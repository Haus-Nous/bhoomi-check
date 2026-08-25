"use client";
import Link from "next/link";
import { CasePage } from "@/components/case-page";
import { CaseHeader, CaseNavigation } from "@/components/shell";
import { Timeline } from "@/components/domain";
export default function TimelinePage() { return <CasePage>{(detail, caseId) => { const packet = detail.reviewPackets?.find((item) => item.status === "READY_FOR_REVIEW"); const href = packet ? `/cases/${caseId}/review-packet` : `/cases/${caseId}/next-action`; const label = packet ? "Review prepared packet" : "Continue preparation"; return <main id="main" className="case-layout"><CaseNavigation caseId={caseId} /><div className="case-content"><CaseHeader title="Your case timeline" subtitle="Only recorded case activity and current available state are shown here." />{detail.timeline.length ? <Timeline events={detail.timeline} /> : <p className="state">No case activity has been recorded yet.</p>}<div className="actions"><Link className="button" href={href}>{label}</Link><Link className="button secondary" href={`/cases/${caseId}`}>Back to case summary</Link></div></div></main>; }}</CasePage>; }
