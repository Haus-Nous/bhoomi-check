"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";
const defaultCaseId = "demo-family-001";
export function SiteHeader() { const c = t(); return <><a className="skip" href="#main">Skip to content</a><header className="site-header"><Link href="/" className="brand" aria-label="BhoomiCheck home"><span className="brand-mark" aria-hidden>⌂</span><span>Bhoomi<span>Check</span></span></Link><nav aria-label="Primary navigation"><Link href={`/cases/${defaultCaseId}`}>{c.nav.dashboard}</Link><Link className="button small" href="/create-case">{c.cta.check}</Link></nav></header></> }
export function CaseNavigation({ caseId }: { caseId: string }) { const pathname = usePathname(); const c = t(); const links = [ ["dashboard", `/cases/${caseId}`], ["documents", `/cases/${caseId}/documents`], ["family", `/cases/${caseId}/family`], ["verification", `/cases/${caseId}/verification`], ["survey", `/cases/${caseId}/survey-record`], ["action", `/cases/${caseId}/next-action`], ["timeline", `/cases/${caseId}/timeline`] ] as const; return <nav className="case-nav" aria-label="Case sections">{links.map(([key, href]) => <Link key={key} className={pathname === href ? "active" : ""} href={href}>{c.nav[key]}</Link>)}</nav> }
export function Notice() { return <p className="notice" role="note">{t().notice}</p> }
export function CaseHeader({ title, subtitle }: { title: string; subtitle: string }) { return <header className="case-header"><p className="eyebrow">Your land case</p><h1>{title}</h1><p>{subtitle}</p></header> }
