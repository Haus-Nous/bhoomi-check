import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { DocumentItem, DocumentKind } from "@/types/case";
import type { PreparedDocument } from "@/server/extraction";
import { syntheticDocumentFixtures } from "@/fixtures/synthetic-documents";
import { SyntheticDocumentProcessor, documentFromFixture } from "@/services/document-processing";
import { caseApplicationService } from "@/server/case-application-service";
import { isApprovedSyntheticFixture } from "@/server/prototype-mode";

const path = join(process.cwd(), "data", "bhoomi-check.sqlite");
const notice = "Synthetic demo document — not an official government record.";
const hero = [
  ["historical", "Historical Khatiyan-style record", "legacy-record", "Khata: DEMO-128\nKhesra: DEMO-456\nRecorded holder: Synthetic Elder 001\nArea: 1.20 acre\nMauza: Example Mauza A"],
  ["genealogy", "Genealogy / Vanshavali-style record", "family-note", "Synthetic Elder 001 → Synthetic Child A 001\nSynthetic Elder 001 → Synthetic Child B 001\nSynthetic Child A 001 → Synthetic Grandchild A 001\nFamily member under review: Synthetic Child B 001"],
  ["current", "Current Jamabandi-like record", "legacy-record", "Khata: DEMO-128\nKhesra: DEMO-456\nRecorded holder: Synthetic Child A 001\nArea: 1.20 acre"],
  ["support", "Synthetic inheritance support document", "family-note", "Recorded family context: Synthetic Child A 001 and Synthetic Child B 001\nArea reference: 1.20 acre"],
  ["survey", "Synthetic Khanapuri Parcha-style record", "survey-record", "Khata: DEMO-128\nKhesra: DEMO-456\nRecorded holder: Synthetic Child A 001\nArea: 1.02 acre\nMap reference: DEMO-MAP-001"],
  ["map", "Simplified synthetic parcel sketch", "survey-record", "Parcel sketch: DEMO-128 / DEMO-456\nArea label: 1.20 acre\nMap reference: DEMO-MAP-001"]
] as const;
const control = [["control-current", "Control synthetic land record", "legacy-record", "Khata: DEMO-902\nKhesra: DEMO-114\nRecorded holder: Synthetic Holder 002\nArea: 1.25 acre"], ["control-survey", "Control synthetic survey record", "survey-record", "Khata: DEMO-902\nKhesra: DEMO-114\nRecorded holder: Synthetic Holder 002\nArea: 1.25 acre\nMap reference: DEMO-MAP-002"]] as const;

export class DocumentApplicationService {
  private database() { if (!existsSync(path)) return null; return new DatabaseSync(path); }
  ensureSeedDocuments() { const database = this.database(); if (!database) return; [...hero.map((item) => ["demo-family-001", ...item] as const), ...control.map((item) => ["demo-family-002", ...item] as const)].forEach(([caseId, key, title, kind, text]) => { const id = `${caseId}-${key}`; const existing = database.prepare("SELECT id FROM documents WHERE id = ?").get(id); if (existing && key !== "genealogy") return; const payload: DocumentItem = { id, title, kind: kind as DocumentKind, type: title, addedLabel: "Seeded synthetic document", state: "extracted", fields: [], sourceText: `${notice}\n\n${text}`, isSynthetic: true }; database.prepare("INSERT OR REPLACE INTO documents (id,case_id,payload) VALUES (?,?,?)").run(id, caseId, JSON.stringify(payload)); }); database.close(); }
  list(caseId: string) { const database = this.database(); if (!database) return []; const rows = database.prepare("SELECT payload FROM documents WHERE case_id = ?").all(caseId) as { payload: string }[]; database.close(); return rows.map((row) => JSON.parse(row.payload) as DocumentItem); }
  get(caseId: string, documentId: string) { return this.list(caseId).find((item) => item.id === documentId) ?? null; }
  listSyntheticFixtures() { return syntheticDocumentFixtures; }
  attachSyntheticFixture(caseId: string, fixtureId: string) {
    if (!caseApplicationService.getCaseDetail(caseId)) return null;
    const fixture = isApprovedSyntheticFixture(syntheticDocumentFixtures, fixtureId);
    if (!fixture) return null;
    const existing = this.get(caseId, `${caseId}-${fixture.id}`);
    if (existing) return existing;
    const database = this.database();
    if (!database) return null;
    const document = new SyntheticDocumentProcessor().process(documentFromFixture(caseId, fixture));
    database.prepare("INSERT INTO documents (id,case_id,payload) VALUES (?,?,?)").run(document.id, caseId, JSON.stringify(document));
    database.close();
    return document;
  }
  prepare(caseId: string, documentId: string): PreparedDocument | null { const document = this.get(caseId, documentId); return document?.isSynthetic ? { documentId, caseId, documentType: document.kind, text: document.sourceText, metadata: { filename: `${document.id}.txt`, mimeType: "text/plain", section: "synthetic-content" }, synthetic: true } : null; }
}
export const documentApplicationService = new DocumentApplicationService();
