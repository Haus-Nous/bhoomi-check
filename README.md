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
7. Open **Parcel map** to view a clearly synthetic mapped boundary, calculated geometry area, and contextual document/survey areas.

The hero case (`demo-family-001`) demonstrates an area mismatch and a family-context potential issue. Every verification result retains its source-document IDs and compared values.

## AI and verification

AI extraction is optional and server-side. Set `AI_EXTRACTION_PROVIDER=gemini` (recommended for the demo) or `openai`; each proposes structured candidate facts only. Accepted facts require common schema validation, exact evidence spans, and deterministic semantic grounding. It does not decide a discrepancy, ownership, inheritance, or legal outcome.

`VerificationService` makes deterministic area and family-context decisions. It returns `PASS`, `POTENTIAL_ISSUE`, or `INSUFFICIENT_EVIDENCE`; malformed or missing evidence is never turned into a discrepancy.

Synthetic parcel GeoJSON is validated and its area is calculated deterministically. It is contextual only: it is not an official cadastral boundary and does not change verification outcomes. See [geospatial notes](docs/GEOSPATIAL.md).

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

Open `http://localhost:3000`. No AI-provider key is needed for case creation, fixture attachment, deterministic verification, tests, evaluation, or the build.

To enable optional live extraction only, select exactly one server-side provider:

```bash
AI_EXTRACTION_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_EXTRACTION_MODEL=gemini-2.5-flash
```

## Demo

1. Start the app and open `http://localhost:3000`.
2. Select **Explore demo case** to enter Demo Case 001; no identifier entry is required.
3. Open **Documents** and choose **Inspect fields** to read synthetic source text and quoted extraction evidence. Live extraction is optional: without a key for the explicitly selected provider, the rest of the demo continues and the extraction screen reports a safe unavailable state.
4. Open **Survey record**, then **Check records**. The hero case shows `AREA_CONSISTENCY = POTENTIAL_ISSUE` and `FAMILY_CONTEXT = POTENTIAL_ISSUE`, each with source document IDs and compared values.
5. Continue to **Next step**, prepare a local MOCK review packet, and show the **Timeline**.
6. Return home and select **Reset demo case** to restore Demo Case 001 for another run. Reset is limited to the two bundled seed cases and never deletes a newly created case.
7. To show the control, open `/cases/demo-family-002`. It returns `AREA_CONSISTENCY = PASS` and `FAMILY_CONTEXT = INSUFFICIENT_EVIDENCE`.

## Deployment

Local development uses Node SQLite. The hosted hackathon demo uses Vercel route handlers with server-side Supabase Postgres configured through `DATABASE_URL`. Supabase is database infrastructure only: this prototype does not implement Supabase Auth, browser database access, or production multi-user controls. Optional Gemini or OpenAI extraction is not required for the demo. See [deployment notes](docs/DEPLOYMENT.md).

## Checks

```bash
npm run typecheck
npm run lint
npm test -- --run
npm run eval
npm run build
```

`npm run eval` runs a 12-case, 24-rule-check synthetic benchmark against the production verification service. Its current result is 24/24 correct for that fixture set only; it is not a real-world, legal, or live-model accuracy claim.
# Phase 17: synthetic parcel intelligence

The Parcel Intelligence page now makes the synthetic document, survey/Parcha, and mapped-geometry area story transparent. It uses deterministic acreage normalization and symmetric pairwise comparisons with clearly labelled demo-only tolerances; it does not use AI or make legal conclusions.

## Synthetic official-record lookup

Phase 18 demonstrates a future lawful integration through deterministic synthetic fixtures only. A citizen can search, inspect, identity-check, and idempotently link a synthetic official-style record to a case; Dashboard, Documents, and Parcel Intelligence show it as context. Every linked record preserves `SYNTHETIC_OFFICIAL_FIXTURE` provenance and `authoritative=false`. It never queries government systems, becomes an ordinary document, changes verification, or becomes a fourth Phase 17 area source.
