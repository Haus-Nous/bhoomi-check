import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { documentApplicationService } from "@/server/document-application-service";
import type { DocumentItem, VerificationItem } from "@/types/case";
import { measure, metrics } from "@/server/metrics";

const dbPath = join(process.cwd(), "data", "bhoomi-check.sqlite");
const normalizeName = (value: string) => value.toLowerCase().replace(/[\s.,_-]+/g, "").trim();
const labelledValues = (text: string, label: string) => [...text.matchAll(new RegExp(`^${label}:\\s*(.+)$`, "gim"))].map((match) => match[1]?.trim()).filter((value): value is string => Boolean(value));

export type ParsedArea = { value: number; unit: "acre"; display: string };
export function parseSupportedArea(text: string): ParsedArea | null {
  const values = labelledValues(text, "Area");
  if (values.length !== 1) return null;
  const match = values[0]?.match(/^([0-9]+(?:\.[0-9]+)?)\s*(acre|acres)$/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? { value, unit: "acre", display: values[0]! } : null;
}

const surveyHolder = (text: string) => {
  const values = labelledValues(text, "Recorded holder");
  return values.length === 1 ? values[0] : null;
};

const familyMemberUnderReview = (text: string) => {
  const values = labelledValues(text, "Family member under review");
  return values.length === 1 ? values[0] : null;
};

const insufficientArea = (caseId: string, sourceDocumentIds: string[]): VerificationItem => ({ id: `${caseId}-area-evidence`, ruleId: "AREA_CONSISTENCY", outcome: "INSUFFICIENT_EVIDENCE", title: "Area comparison needs more evidence", detail: "Potential area comparison could not be completed because a required synthetic record or supported area value is missing.", status: "review", confidence: 0, evidence: "INSUFFICIENT_EVIDENCE · Historical and survey records", sourceDocumentIds });
const insufficientFamily = (caseId: string, sourceDocumentIds: string[]): VerificationItem => ({ id: `${caseId}-family-evidence`, ruleId: "FAMILY_CONTEXT", outcome: "INSUFFICIENT_EVIDENCE", title: "Family-context comparison needs more evidence", detail: "Potential family-context comparison could not be completed because a required synthetic comparison subject or holder value is missing.", status: "review", confidence: 0, evidence: "INSUFFICIENT_EVIDENCE · Family comparison subject and survey holder", sourceDocumentIds });

export class VerificationService {
  run(caseId: string): VerificationItem[] | null { return measure(metrics, "verification", () => this.runDeterministic(caseId), { caseId, synthetic: true }); }

  evaluateDocuments(caseId: string, docs: DocumentItem[]): VerificationItem[] {
    const historical = docs.find((document) => document.id.endsWith("historical")) ?? docs.find((document) => document.kind === "legacy-record" && document.id !== `${caseId}-document`);
    const survey = docs.find((document) => document.id.endsWith("survey")) ?? docs.find((document) => document.kind === "survey-record");
    const genealogy = docs.find((document) => document.id.endsWith("genealogy"));
    const results: VerificationItem[] = [];
    const historicalArea = historical ? parseSupportedArea(historical.sourceText) : null;
    const observedArea = survey ? parseSupportedArea(survey.sourceText) : null;

    if (!historical || !survey || !historicalArea || !observedArea) {
      results.push(insufficientArea(caseId, [historical?.id, survey?.id].filter((id): id is string => Boolean(id))));
    } else {
      const matches = historicalArea.value === observedArea.value;
      const expected = historicalArea.display;
      const observed = observedArea.display;
      results.push({ id: `${caseId}-area-consistency`, ruleId: "AREA_CONSISTENCY", outcome: matches ? "PASS" : "POTENTIAL_ISSUE", title: matches ? "Area values are consistent" : "Potential area mismatch", detail: matches ? `Synthetic historical and survey records both show ${expected}.` : `Potential area mismatch: historical records show ${expected} while the synthetic survey record shows ${observed}. This does not decide which value is legally correct.`, status: matches ? "passed" : "warning", confidence: 100, evidence: `Rule AREA_CONSISTENCY · ${historical.title}: ${expected} · ${survey.title}: ${observed}`, sourceDocumentIds: [historical.id, survey.id], expectedValue: expected, observedValue: observed });
    }

    const comparisonSubject = genealogy ? familyMemberUnderReview(genealogy.sourceText) : null;
    const holder = survey ? surveyHolder(survey.sourceText) : null;
    if (!genealogy || !survey || !comparisonSubject || !holder) {
      results.push(insufficientFamily(caseId, [genealogy?.id, survey?.id].filter((id): id is string => Boolean(id))));
    } else {
      const matches = normalizeName(comparisonSubject) === normalizeName(holder);
      results.push({ id: `${caseId}-family-context`, ruleId: "FAMILY_CONTEXT", outcome: matches ? "PASS" : "POTENTIAL_ISSUE", title: matches ? "Family context is consistent" : "Potential family-record inconsistency", detail: matches ? "The available synthetic family comparison subject and survey holder context are consistent." : `The synthetic family comparison subject is ${comparisonSubject}, while the survey holder context records ${holder}. This is an informational consistency check, not an ownership conclusion.`, status: matches ? "passed" : "warning", confidence: 100, evidence: `Rule FAMILY_CONTEXT · ${genealogy.title}: ${comparisonSubject} · ${survey.title}: ${holder}`, sourceDocumentIds: [genealogy.id, survey.id], expectedValue: comparisonSubject, observedValue: holder });
    }
    return results;
  }

  private runDeterministic(caseId: string): VerificationItem[] | null {
    if (!existsSync(dbPath)) return null;
    documentApplicationService.ensureSeedDocuments();
    const docs = documentApplicationService.list(caseId);
    if (!docs.length) return null;
    const results = this.evaluateDocuments(caseId, docs);
    const db = new DatabaseSync(dbPath);
    db.prepare("DELETE FROM verification_results WHERE case_id = ?").run(caseId);
    for (const item of results) db.prepare("INSERT INTO verification_results (id,case_id,payload) VALUES (?,?,?)").run(item.id, caseId, JSON.stringify(item));
    db.close();
    return results;
  }

  list(caseId: string) { if (!existsSync(dbPath)) return []; const db = new DatabaseSync(dbPath); const rows = db.prepare("SELECT payload FROM verification_results WHERE case_id = ?").all(caseId) as { payload: string }[]; db.close(); return rows.map((row) => JSON.parse(row.payload) as VerificationItem); }
}

export const verificationService = new VerificationService();
