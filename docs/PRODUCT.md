# BhoomiCheck Product Definition

## Purpose

**BhoomiCheck** is an independent, citizen-side assistance and verification prototype for the AI-Rebuilder 2026 hackathon.

**Tagline:** *Understand your land record before you act.*

It helps a person assemble a synthetic land-survey case from fragmented documents and family knowledge, compare the records, understand possible inconsistencies, and prepare a clearly labelled **MOCK** review, claim, or objection packet. It is not a Government of Bihar service, an official records portal, or a legal decision-maker.

## Problem and users

Land-survey participants may need to reconcile old records, Khata/Khesra identifiers, family lineage, inheritance narratives, survey records, Khanapuri Parcha, maps, claims, and administrative stages across disconnected sources. The immediate problem is comprehension and organization; the consequential problem is deciding what to verify next when records do not appear to agree.

Primary user: a citizen or family helper preparing to understand a survey case.

Secondary demo user: a legal-aid volunteer or community facilitator using the case summary to orient a citizen. The app must never represent their work as legal advice or a final ownership conclusion.

## MVP journey

1. Create a **synthetic** land-survey case.
2. Add family members, relationships, land parcels, and identifiers.
3. Upload only supplied synthetic/demo documents.
4. Extract suggested structured fields and allow user review.
5. Build a unified case view with source provenance.
6. Compare identifiers, names, areas, relationships, and stated ownership/possession facts.
7. Surface deterministic potential inconsistencies.
8. Explain each finding in simple Hindi/English-oriented language, with its sources and a non-legal disclaimer.
9. Display a synthetic Khanapuri Parcha/survey record.
10. Compare the survey record with the reviewed case.
11. Recommend a non-binding administrative next step from a curated rules matrix.
12. Generate a watermarked **MOCK — NOT FOR SUBMISSION** review/claim/objection packet.
13. Show a simple, editable case timeline.

## Product principles

- **Citizen-side, not system-side:** organize and explain information; do not transact with government systems.
- **Provenance before confidence:** every displayed field identifies its source document, page, extraction method, and review status.
- **Human confirmation:** extraction is a suggestion. People explicitly confirm or correct fields before they drive case conclusions.
- **Deterministic checks:** numeric, identifier, and normalized-string comparisons use reproducible rules; AI explains but does not adjudicate.
- **Plain language:** show the source terminology and an understandable explanation side by side. Begin bilingual support with English plus simple Hindi labels/content; do not claim certified translations.
- **Safety by design:** persistent prototype/synthetic/non-legal notices and no real government integrations.

## Citizen-facing verification experience

The verification screen explains what BhoomiCheck compared in the available synthetic records. A pass means no obvious discrepancy was found in the records selected for that check; a potential issue means the records contain values or family/holder context that differ; insufficient evidence means the required comparable information is not available. Every potential issue displays its deterministic rule, compared values, source-document references, and a concise explanation of why it was flagged. None of these states establishes legal ownership, record correctness, fraud, mutation validity, or official verification.

## Guided preparation experience

The next-action screen turns each deterministic comparison result into a safe preparation item. It separates what BhoomiCheck found from what a citizen can review next, lists only existing synthetic records relevant to that comparison, and offers a local checklist for keeping references and questions organised. A checked item does not complete an official process. BhoomiCheck does not file, submit, correct, or otherwise interact with government systems; any legal or administrative action remains outside the prototype.

## Demo scenario and acceptance criteria

Ship one polished seeded scenario, such as an inherited parcel where a legacy record uses a parent name, the family narrative contains a spelling variant, and the synthetic survey record has a different area or omitted heir. Seed multiple controlled variants only if time permits.

A credible live demo must show:

- a new synthetic case created end to end;
- document upload or selection from a bundled synthetic document library;
- visible extraction with user review and field-level source links;
- at least three meaningful findings (for example area mismatch, Khata mismatch, name variation, or unresolved relationship);
- a synthetic Khanapuri Parcha comparison;
- plain-language next-step guidance tied to each finding;
- a downloadable/printable mock packet with watermark; and
- a timeline and explicit limitations on every consequential screen.

## Explicit non-goals

- Accessing, scraping, querying, or automating any live government system.
- Real applications, objections, claims, payments, OTPs, Aadhaar/PAN handling, or official submissions.
- Use or storage of real private land records or personal identity documents.
- Legal ownership, inheritance, title, validity, or eligibility determinations.
- Government branding, endorsement claims, or government logos.
- Production-grade identity verification, payment, or public multi-tenant deployment for the hackathon.

## Success measures for the demo

- A first-time viewer can identify what sources disagree and why in under two minutes.
- Every important field is traceable to a synthetic source.
- Findings are explainable, reproducible, and visibly distinguish “possible inconsistency” from a legal conclusion.
- The exported packet cannot plausibly be confused with an official document.
