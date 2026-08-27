# API

All implemented routes are local Next.js route handlers in the enforced `synthetic-demo` profile. They operate on synthetic prototype data only and return JSON shaped as `{ data }` or `{ error: { code, message? } }`. No route contacts a government system, accepts real uploads, or submits an application.

| Method | Route | Behavior |
| --- | --- | --- |
| `POST` | `/api/cases` | Creates a synthetic case from clearly labelled synthetic location/nickname fields, a `DEMO-...` Khata, and optional `DEMO-...` Khesra. Returns `201`; invalid/non-synthetic input returns `400 INVALID_INPUT`. |
| `GET` | `/api/cases/:caseId` | Returns the current `CaseDetail`, persisted documents/results/packets, derived guidance/timeline, and clearly labelled mock workflow context. Unknown cases return `404 CASE_NOT_FOUND`. |
| `GET` | `/api/cases/:caseId/parcel-intelligence` | Returns the selected case’s parcel identity, validated synthetic GeoJSON when available, deterministic geometry area, and contextual historical/survey areas. It never returns another case’s geometry and does not decide a discrepancy. |
| `GET` | `/api/cases/:caseId/documents` | Lists persisted documents scoped to the selected case. |
| `GET` | `/api/cases/:caseId/documents/fixtures` | Lists approved bundled synthetic fixture choices for an existing case. |
| `POST` | `/api/cases/:caseId/documents` | Strict `{ fixtureId }` attachment. First attachment returns `201`; repeat attachment reuses the case-scoped document and returns `200`. Invalid fixture input is `400`; unavailable fixture is `404`. |
| `GET` | `/api/cases/:caseId/documents/:documentId` | Returns a case-scoped document and its deterministic `PreparedDocument`; cross-case IDs return `404`. |
| `GET` | `/api/cases/:caseId/documents/:documentId/extract` | Returns the latest persisted extraction attempt or `null`. |
| `POST` | `/api/cases/:caseId/documents/:documentId/extract` | Runs optional configured extraction, validates evidence grounding, persists an attempt, and returns a safe result. Missing AI configuration is reported safely; no provider internals are exposed. |
| `POST` | `/api/cases/:caseId/verify` | Runs deterministic verification, replaces that case’s snapshot, and returns current results. |
| `GET` | `/api/cases/:caseId/verification` | Returns the persisted verification snapshot. |
| `GET` | `/api/cases/:caseId/review-packets` | Lists case-scoped local review packets. |
| `POST` | `/api/cases/:caseId/review-packets` | Creates or reuses a packet only for a persisted `POTENTIAL_ISSUE`. Creation is idempotent per `(caseId, verificationResultId)`. Invalid input is `400`; ineligible/cross-case results are `422`. |
| `GET` | `/api/cases/:caseId/review-packets/:packetId` | Retrieves a packet only inside its selected case; cross-case access is `404`. |
| `PATCH` | `/api/cases/:caseId/review-packets/:packetId` | Updates a `DRAFT` packet’s citizen notes/request or marks it ready. `READY_FOR_REVIEW` packets are frozen: content changes return `409 PACKET_LOCKED`; a repeated ready request is a safe no-op. |
| `POST` | `/api/demo/reset` | Resets exactly one approved seed case (`demo-family-001` or `demo-family-002`) to deterministic synthetic state. It rejects arbitrary case IDs and does not affect newly created cases. |
| `GET` | `/api/health` | Returns only safe synthetic-demo database availability status. |

The client’s `CaseService` is the UI fetch boundary. Nested resources are validated against the selected synthetic case, but this is resource scoping—not user authorization. The current prototype does not implement a user/session authorization boundary; opaque case IDs and case-scoped nested queries are not a substitute for production tenancy.
