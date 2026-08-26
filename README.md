# BhoomiCheck

**Understand your land record before you act.**

BhoomiCheck is an independent AI-Rebuilder 2026 hackathon prototype for helping citizens make sense of a land-survey case before taking any outside action. It brings synthetic land records, family context, survey information, and possible record differences into one understandable case view.

It is **not** a Government of Bihar product, does not connect to government systems, uses only fictional/synthetic data, and never determines legal ownership or submits anything.

## What a demo shows

1. Create a synthetic `DEMO-...` land case.
2. Add an approved bundled synthetic fixture.
3. Inspect source text and optional AI-assisted candidate extraction.
4. Compare available records using deterministic rules.
5. Review source-linked potential issues or insufficient evidence.
6. Follow preparation guidance and create a clearly labelled local review-packet draft.

The hero case (`demo-family-001`) demonstrates an area mismatch and a family-context potential issue. Every verification result retains its source-document IDs and compared values.

## AI and verification

OpenAI extraction is optional and server-side. It proposes structured candidate facts only; accepted facts require schema validation, exact evidence spans, and deterministic semantic grounding. It does not decide a discrepancy, ownership, inheritance, or legal outcome.

`VerificationService` makes deterministic area and family-context decisions. It returns `PASS`, `POTENTIAL_ISSUE`, or `INSUFFICIENT_EVIDENCE`; malformed or missing evidence is never turned into a discrepancy.

The citizen interface supports English and Hindi. Locale changes affect presentation only, never identifiers, evidence, citizen notes, or stored verification decisions.

## Boundaries

- All fixtures, people, identifiers, and documents are synthetic.
- The enforced deployment profile is `synthetic-demo`: new cases require `DEMO-...` identifiers and clearly labelled synthetic/demo text; bundled fixtures are the only attachable records.
- `MockGovernmentAdapter` is a local, deterministic boundary with no network behavior.
- Review packets are local preparation aids, never submissions.
- SQLite is a local prototype persistence adapter, not production infrastructure.
- Authentication/session tenancy is not implemented; do not deploy this prototype as a shared case system.

Appropriate uses are local development, hackathon demonstrations, synthetic-data evaluation, and controlled demonstrations containing only synthetic records. It is not appropriate for real citizen records, sensitive land documents, legal/government workflow, or public multi-user storage.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. No OpenAI key is needed for case creation, fixture attachment, deterministic verification, tests, evaluation, or the build.

To enable optional live extraction only, set server-side environment configuration:

```bash
OPENAI_API_KEY=...
OPENAI_EXTRACTION_MODEL=gpt-4.1-mini
```

## Checks

```bash
npm run typecheck
npm run lint
npm test -- --run
npm run eval
npm run build
```

`npm run eval` runs a 12-case, 24-rule-check synthetic benchmark against the production verification service. Its current result is 24/24 correct for that fixture set only; it is not a real-world, legal, or live-model accuracy claim.
