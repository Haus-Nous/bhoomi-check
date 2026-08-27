# Data model

## Persisted local prototype state

Local development stores synthetic case aggregates in Node SQLite at `data/bhoomi-check.sqlite`, which is ignored by Git. Hosted Vercel requests use the identical aggregate-table model in Supabase Postgres, initialized by `supabase/schema.sql`.

| State | Persistence | Notes |
| --- | --- | --- |
| Case, people, relationships, parcels, survey record | Case aggregate tables keyed by `case_id` | `CaseApplicationService` assembles these into `CaseDetail`. |
| Documents | `documents` | Each document contains synthetic metadata, canonical source text, processing state, and deterministic fields. An approved fixture attachment has a deterministic case-and-fixture ID and is idempotent per case. |
| Extraction attempt | `document_extractions` | Immutable completed/failed attempt with case/document IDs, provider/model, prompt version, timestamp, safe failure metadata, and accepted grounded result when completed. |
| Verification snapshot | `verification_results` | Replaceable deterministic result set per case. Each item retains rule ID, outcome, source document IDs, compared values, evidence, and confidence. |
| Review packet | `review_packets` | Local synthetic draft linked to one verification result. It retains source verification/document IDs, compared values, citizen notes/request, timestamps, and `DRAFT` or `READY_FOR_REVIEW` status. |
| Timeline events | `timeline_events` | Persisted case activity plus packet events. It is citizen-facing history, not a technical audit log. |
| Parcel geometry | `parcel_geometries` | Case- and parcel-scoped portable GeoJSON text, source/provenance reference, and timestamps. Seed rows are synthetic only; no PostGIS requirement exists. |

`READY_FOR_REVIEW` means a local packet snapshot is frozen; it is never submitted, received, or approved by any government system. The packet service reuses the earliest packet for a case/result pair rather than generating duplicate drafts.

The controlled demo reset deletes and recreates state only for the two server-defined seed IDs. It restores their synthetic aggregate, fixture documents, verification/packet/timeline state, and leaves every newly created synthetic case untouched.

New synthetic cases have no automatically invented geometry. The parcel-intelligence read model therefore returns `geometry: null` and `calculatedArea: null` until an approved future geometry path exists.

## Derived read-model state

`CaseDetail.guidance` is derived deterministically from current verification results and existing documents; it is not separately persisted. The case API also builds a current timeline/read model, ensuring the dashboard and case screens consume the selected case’s persisted state.

`PASS`, `POTENTIAL_ISSUE`, and `INSUFFICIENT_EVIDENCE` are verification outcomes, not legal findings. Missing or unusable required evidence is persisted as insufficient evidence rather than a discrepancy.

## Configuration and boundaries

`survey-workflow.ts` and `MockGovernmentAdapter` are server-side configuration/boundaries, not government data. `MockGovernmentAdapter` derives clearly synthetic workflow context and makes no network call.

The database adapter selects local SQLite without `DATABASE_URL` and server-side Supabase Postgres when it is configured. Browser components never receive a database credential. This synthetic-demo prototype has no user/session tenancy, production migrations, managed backups, object storage, background workers, or production audit logging. Only synthetic data belongs in it.
