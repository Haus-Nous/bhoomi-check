"use client";
import Link from "next/link";
import { NextActionCard } from "@/components/domain";
import { useTranslation } from "@/components/locale-context";

export default function Home() {
  const c = useTranslation();
  return <main id="main"><section className="hero"><div><p className="eyebrow">{c.home.eyebrow}</p><h1>{c.home.title}</h1><p className="lead">{c.home.lead}</p><div className="actions"><Link className="button" href="/create-case">{c.cta.check}</Link><a className="button secondary" href="#how-it-works">{c.cta.how}</a></div><p className="micro">{c.home.safety}</p></div><aside className="hero-card"><p className="eyebrow">{c.home.start}</p><ol><li><b>1</b>{c.home.step1}</li><li><b>2</b>{c.home.step2}</li><li><b>3</b>{c.home.step3}</li><li><b>4</b>{c.home.step4}</li></ol></aside></section><section className="section two-col"><div><p className="eyebrow">{c.home.forWho}</p><h2>{c.home.forWhoTitle}</h2><p>{c.home.forWhoDetail}</p></div><div className="callout"><strong>{c.home.does}</strong><p>{c.home.doesDetail}</p><strong>{c.home.doesNot}</strong><p>{c.home.doesNotDetail}</p></div></section><section id="how-it-works" className="section"><p className="eyebrow">{c.cta.how}</p><h2>{c.home.howTitle}</h2><div className="action-grid"><NextActionCard href="/create-case" title={c.home.createTitle} detail={c.home.createDetail} /><NextActionCard href="/cases/demo-family-001/documents" title={c.home.documentsTitle} detail={c.home.documentsDetail} /><NextActionCard href="/cases/demo-family-001/verification" title={c.home.verifyTitle} detail={c.home.verifyDetail} /></div></section></main>;
}
