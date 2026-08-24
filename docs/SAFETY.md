# BhoomiCheck Safety, Privacy, and Prototype Boundaries

## Hard boundaries

This repository implements an independent hackathon prototype using synthetic/mock data only.

The application must not:

- connect to, scrape, crawl, reverse-engineer, or automate government websites or undocumented APIs;
- submit, draft for actual submission, or track real government claims, objections, applications, or payments;
- request, receive, retain, or process real Aadhaar, PAN, OTP, bank/payment, or private land-record data;
- determine legal ownership, inheritance rights, title validity, or legal outcomes;
- present itself as affiliated with, endorsed by, or operated by the Government of Bihar; or
- use government marks/logos in a way that implies endorsement.

## Product safeguards

1. Show a persistent header/footer notice: “Independent prototype. Synthetic demo data only. Not a government service or legal advice.”
2. Gate uploads in the MVP to bundled synthetic files and generated test fixtures. If an open upload control is later enabled, require an acknowledgement and reject known high-risk identity/financial document categories; do not claim this is a complete privacy control.
3. Prefix all seeded entities with unmistakably synthetic names/identifiers (for example `DEMO-`, fictional villages, and deliberately non-official document designs).
4. Watermark every generated packet and printable view: `MOCK — SYNTHETIC DATA — NOT FOR GOVERNMENT SUBMISSION`.
5. State “potential inconsistency” rather than “error,” “fraud,” “invalid,” or “owner.”
6. State that next steps are informational prompts to verify with an appropriate qualified person or official channel, not legal recommendations.
7. Link each extracted field and finding to the source evidence and reviewed status.

## AI guardrails

The AI service is permitted to classify document type, suggest schema-constrained fields, normalize entities, extract stated relationships, and turn precomputed findings into plain-language explanations. It is not permitted to infer a legal owner, resolve competing claims, establish lineage as fact, or instruct the user to submit a legal filing.

All AI calls must use a schema-constrained response with:

- `value`, `confidence`, `evidence[]`, and `uncertainty` for extracted facts;
- page/region or text-span citations where available;
- a `needsHumanReview` flag;
- no ungrounded factual statements; and
- a prompt that repeats the prototype, synthetic-data, and non-adjudication boundaries.

The application must validate the response server-side, retain raw extraction separately from reviewed facts, and fall back to deterministic/template copy when the AI response is invalid or unavailable.

## Data handling

- Seeded synthetic data is the default and the only demo dataset.
- Store uploaded fixtures in private object storage in production-like environments; use short-lived signed URLs.
- Encrypt in transit and at rest, avoid document text in logs, and redact error telemetry.
- Keep document hashes and metadata for traceability. Retention/deletion flows are deferred because the hackathon MVP prohibits real records.
- Never send data to an LLM provider unless the case is synthetic and the request has passed validation.

## Threat and misuse review

| Risk | Mitigation |
| --- | --- |
| User treats output as official/legal | Persistent notices, careful language, evidence links, and mock-only exports |
| Real records enter the demo | Synthetic-only upload allowlist, acknowledgement, clear demo positioning |
| Hallucinated extraction | Strict schema, source citations, review workflow, deterministic comparisons |
| Sensitive data leaks to logs/model | Fixture-only policy, log redaction, server-side validation |
| Government affiliation confusion | Independent branding, no official logos, clear disclosures |
| Tampered comparison result | Versioned inputs, finding rule/version, immutable audit events |

## Release checklist

- [ ] Every route has the independent-prototype notice.
- [ ] All visible people, identifiers, documents, maps, and parcels are synthetic.
- [ ] No outbound government URLs, API clients, scraping dependencies, or government logo assets exist.
- [ ] Exports contain the mock watermark on every page.
- [ ] AI output is validated and reviewable before it is shown as a case fact.
- [ ] Findings say “potential inconsistency” and never determine ownership.
- [ ] A manual demo reset restores only synthetic seed data.
