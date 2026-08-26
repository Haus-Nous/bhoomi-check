import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import OpenAI from "openai";
import { z } from "zod";
import type { DocumentExtraction, ExtractedDocument, ExtractionFactKey } from "@/types/case";
import { DOCUMENT_EXTRACTION_PROMPT_VERSION, documentExtractionInstructions } from "@/server/extraction-prompt";
import { measureAsync, metrics } from "@/server/metrics";

export type PreparedDocument = { documentId: string; caseId: string; documentType: string; text: string; metadata: { filename: string; mimeType: string; section: string }; synthetic: true };
const factKeys = ["documentType", "personName", "relationship", "khata", "khesra", "recordedArea", "areaUnit", "location", "surveyReference", "recordDate"] as const;
const extractedDocumentSchema = z.object({ documentType: z.string().min(1), facts: z.array(z.object({ key: z.enum(factKeys), value: z.string().min(1), confidence: z.enum(["low", "medium", "high"]), evidence: z.object({ quote: z.string().min(1), start: z.number().int().nonnegative(), end: z.number().int().positive() }), needsHumanReview: z.boolean(), uncertainty: z.string() })).max(50) }).strict();
export class ExtractionValidationError extends Error { constructor(message = "The extraction response was invalid or not grounded in the source document.") { super(message); } }
export class ExtractionConfigurationError extends Error { constructor() { super("AI extraction is unavailable because OPENAI_API_KEY is not configured."); } }
export interface ExtractionProvider { readonly name: string; readonly model: string; extract(document: PreparedDocument): Promise<unknown>; }

export class OpenAIExtractionProvider implements ExtractionProvider {
  readonly name = "openai";
  readonly model: string;
  private client: OpenAI;
  constructor(apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_EXTRACTION_MODEL || "gpt-4.1-mini") { if (!apiKey) throw new ExtractionConfigurationError(); this.client = new OpenAI({ apiKey }); this.model = model; }
  async extract(document: PreparedDocument) {
    const response = await this.client.responses.create({ model: this.model, input: [{ role: "system", content: documentExtractionInstructions }, { role: "user", content: document.text }], text: { format: { type: "json_schema", name: "document_extraction", strict: true, schema: { type: "object", additionalProperties: false, properties: { documentType: { type: "string" }, facts: { type: "array", maxItems: 50, items: { type: "object", additionalProperties: false, properties: { key: { type: "string", enum: factKeys }, value: { type: "string" }, confidence: { type: "string", enum: ["low", "medium", "high"] }, evidence: { type: "object", additionalProperties: false, properties: { quote: { type: "string" }, start: { type: "integer", minimum: 0 }, end: { type: "integer", minimum: 1 } }, required: ["quote", "start", "end"] }, needsHumanReview: { type: "boolean" }, uncertainty: { type: "string" } }, required: ["key", "value", "confidence", "evidence", "needsHumanReview", "uncertainty"] } } }, required: ["documentType", "facts"] } } } });
    return JSON.parse(response.output_text);
  }
}

export function validateExtraction(raw: unknown, sourceText: string): ExtractedDocument {
  const parsed = extractedDocumentSchema.safeParse(raw); if (!parsed.success) throw new ExtractionValidationError();
  for (const fact of parsed.data.facts) { const { quote, start, end } = fact.evidence; if (end <= start || sourceText.slice(start, end) !== quote || !sourceText.includes(quote) || !isFactGrounded(fact.key, fact.value, quote)) throw new ExtractionValidationError(); }
  return parsed.data;
}

const normalizeIdentifier = (value: string) => value.trim().toUpperCase().replace(/\s+/g, "");
const normalizeText = (value: string) => value.toLowerCase().replace(/[\s.,_-]+/g, "");
const normalizeAreaUnit = (value: string) => value.trim().toLowerCase().replace(/s$/, "");
const labelledValue = (quote: string, labels: string[]) => { const label = labels.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"); return quote.match(new RegExp(`(?:${label})\\s*:\\s*(.+)`, "i"))?.[1]?.trim() ?? quote.trim(); };
const parseAreaEvidence = (quote: string) => { const match = quote.match(/(?:Area|Recorded area)\s*:\s*([0-9]+(?:\.[0-9]+)?)\s*(acre|acres)\b/i); if (!match) return null; const value = Number(match[1]); return Number.isFinite(value) ? { value, unit: "acre" } : null; };

function isFactGrounded(key: ExtractionFactKey, value: string, quote: string) {
  if (!value.trim()) return false;
  if (key === "khata" || key === "khesra") return normalizeIdentifier(value) === normalizeIdentifier(labelledValue(quote, [key]));
  if (key === "recordedArea") { const evidence = parseAreaEvidence(quote); const numeric = Number(value); return Boolean(evidence && Number.isFinite(numeric) && numeric === evidence.value); }
  if (key === "areaUnit") { const evidence = parseAreaEvidence(quote); return Boolean(evidence && normalizeAreaUnit(value) === evidence.unit); }
  if (key === "personName") return normalizeText(value) === normalizeText(labelledValue(quote, ["Recorded holder", "Recorded name", "Grandparent", "Parent", "Family member under review"]));
  if (key === "relationship") return normalizeText(value) === normalizeText(labelledValue(quote, ["Relationship"]));
  if (key === "documentType") return normalizeText(value) === normalizeText(labelledValue(quote, ["Document type", "Type"]));
  if (key === "surveyReference") return normalizeText(value) === normalizeText(labelledValue(quote, ["Map reference", "Survey reference"]));
  if (key === "location") return normalizeText(value) === normalizeText(labelledValue(quote, ["Mauza", "Location", "Village"]));
  if (key === "recordDate") return normalizeText(value) === normalizeText(labelledValue(quote, ["Record date", "Date"]));
  return normalizeText(value) === normalizeText(quote);
}

export interface ExtractionRepository { save(value: DocumentExtraction): void; latest(caseId: string, documentId: string): DocumentExtraction | null; }
export class SqliteExtractionRepository implements ExtractionRepository {
  private open() { mkdirSync(join(process.cwd(), "data"), { recursive: true }); const db = new DatabaseSync(join(process.cwd(), "data", "bhoomi-check.sqlite")); db.exec("CREATE TABLE IF NOT EXISTS document_extractions (id TEXT PRIMARY KEY, case_id TEXT NOT NULL, document_id TEXT NOT NULL, status TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL); CREATE INDEX IF NOT EXISTS extraction_document_id ON document_extractions(case_id, document_id, created_at);"); return db; }
  save(value: DocumentExtraction) { const db = this.open(); db.prepare("INSERT INTO document_extractions (id,case_id,document_id,status,payload,created_at) VALUES (?,?,?,?,?,?)").run(value.id, value.caseId, value.documentId, value.status, JSON.stringify(value), value.createdAt); db.close(); }
  latest(caseId: string, documentId: string) { const db = this.open(); const row = db.prepare("SELECT payload FROM document_extractions WHERE case_id = ? AND document_id = ? ORDER BY created_at DESC LIMIT 1").get(caseId, documentId) as { payload: string } | undefined; db.close(); return row ? JSON.parse(row.payload) as DocumentExtraction : null; }
}

export class ExtractionService {
  constructor(private provider: ExtractionProvider, private repository: ExtractionRepository = new SqliteExtractionRepository()) {}
  async extract(document: PreparedDocument): Promise<DocumentExtraction> { return measureAsync(metrics, "extraction", async () => { const createdAt = new Date().toISOString(); try { const raw = await this.provider.extract(document); const result = validateExtraction(raw, document.text); const extraction: DocumentExtraction = { id: crypto.randomUUID(), caseId: document.caseId, documentId: document.documentId, status: "completed", result, provider: this.provider.name, model: this.provider.model, promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION, createdAt }; this.repository.save(extraction); return extraction; } catch (error) { const extraction: DocumentExtraction = { id: crypto.randomUUID(), caseId: document.caseId, documentId: document.documentId, status: "failed", provider: this.provider.name, model: this.provider.model, promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION, createdAt, error: { code: error instanceof ExtractionValidationError ? "INVALID_MODEL_OUTPUT" : "PROVIDER_FAILURE", message: error instanceof ExtractionValidationError ? error.message : "AI extraction failed. No fields were accepted." } }; this.repository.save(extraction); return extraction; } }, { caseId: document.caseId, documentId: document.documentId, synthetic: true }, (extraction) => extraction.status === "completed" ? "success" : "failure"); }
}
