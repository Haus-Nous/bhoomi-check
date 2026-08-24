"use client";
import Link from "next/link";
import { CasePage } from "@/components/case-page";
import { CaseHeader, CaseNavigation } from "@/components/shell";
import { Timeline } from "@/components/domain";
export default function TimelinePage() { return <CasePage>{(detail, caseId) => <main id="main" className="case-layout"><CaseNavigation caseId={caseId} /><div className="case-content"><CaseHeader title="Your case timeline" subtitle="A simple record of what you have reviewed and what comes next." /><Timeline events={detail.timeline} /><div className="actions"><Link className="button" href={`/cases/${caseId}/next-action`}>Choose a next step</Link><Link className="button secondary" href={`/cases/${caseId}`}>Back to case summary</Link></div></div></main>}</CasePage>; }
