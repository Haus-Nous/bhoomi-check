"use client";

import { useEffect, useState } from "react";
import { CasePage } from "@/components/case-page";
import { useCaseActions } from "@/components/case-context";
import { CaseHeader, CaseNavigation } from "@/components/shell";
import { DocumentCard, EmptyState } from "@/components/domain";
import type { CaseDetail, DocumentExtraction, SyntheticDocumentFixture } from "@/types/case";
import { useTranslation } from "@/components/locale-context";

function DocumentsContent({ detail, caseId }: { detail: CaseDetail; caseId: string }) {
  const c = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const [fixtures, setFixtures] = useState<SyntheticDocumentFixture[]>([]);
  const [extraction, setExtraction] = useState<DocumentExtraction | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const { listFixtures, attachFixture } = useCaseActions();

  useEffect(() => {
    void listFixtures(caseId).then(setFixtures).catch(() => setFixtures([]));
  }, [caseId, listFixtures]);

  const runExtraction = async (documentId: string) => {
    setExtracting(true);
    setError("");
    try {
      const response = await fetch(`/api/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(documentId)}/extract`, { method: "POST" });
      const body = await response.json() as { data?: DocumentExtraction };
      if (!response.ok || !body.data) throw new Error();
      setExtraction(body.data);
    } catch {
      setError(c.documents.extractionFailure);
    } finally {
      setExtracting(false);
    }
  };

  const item = detail.documents.find((document) => document.id === selected);
  return <main id="main" className="case-layout"><CaseNavigation caseId={caseId} /><div className="case-content"><CaseHeader title={c.documents.header} subtitle={c.documents.subtitle} /><section className="fixture-panel"><p className="eyebrow">{c.documents.add}</p><h2>{c.documents.choose}</h2><div className="fixture-list">{fixtures.map((fixture) => <button key={fixture.id} type="button" className="button secondary" disabled={detail.documents.some((document) => document.id === `${caseId}-${fixture.id}`)} onClick={() => void attachFixture(caseId, fixture.id)}>{fixture.title}</button>)}</div><p className="micro">{c.documents.fixturesNotice}</p></section><div className="document-list">{detail.documents.length ? detail.documents.map((document) => <div key={document.id} className="document-workflow"><DocumentCard document={document} /><div className="document-actions"><button type="button" className="button secondary" aria-expanded={selected === document.id} aria-controls={selected === document.id ? "extracted-fields" : undefined} onClick={() => { setSelected(document.id); setExtraction(null); setError(""); }}>{c.common.inspect}</button></div></div>) : <EmptyState title={c.documents.noDocuments} detail={c.documents.noDocumentsDetail} />}</div>{item && <section id="extracted-fields" className="inspect" aria-live="polite"><div className="section-head"><div><p className="eyebrow">{c.documents.source}</p><h2>{item.title}</h2></div><button className="button secondary" onClick={() => setSelected(null)}>{c.documents.close}</button></div><pre className="source-text">{item.sourceText}</pre><div className="section-head"><div><p className="eyebrow">{c.documents.extraction}</p><h2>{c.documents.suggested}</h2></div><button className="button small" disabled={extracting} onClick={() => void runExtraction(item.id)}>{extracting ? c.documents.extracting : c.documents.runExtraction}</button></div><p className="micro">{c.documents.extractionNotice}</p>{error && <p className="form-error" role="alert">{error}</p>}{extraction?.result?.facts.map((fact, index) => <div className="field-row" key={`${fact.key}-${index}`}><span>{fact.key}</span><strong>{fact.value}</strong><span><span className="confidence">{fact.confidence} {c.documents.extractionConfidence}</span><br />{c.labels.evidence}: “{fact.evidence.quote}”{fact.uncertainty ? ` · ${fact.uncertainty}` : ""}</span></div>)}</section>}</div></main>;
}

export default function DocumentsPage() {
  return <CasePage>{(detail, caseId) => <DocumentsContent detail={detail} caseId={caseId} />}</CasePage>;
}
