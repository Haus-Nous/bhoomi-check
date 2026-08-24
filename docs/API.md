# API

- `GET /api/cases/:caseId` returns one coherent `CaseDetail` or `404 CASE_NOT_FOUND`.
- `POST /api/cases` validates a synthetic case payload and returns `201` with its `CaseDetail`.
- `GET /api/cases/:caseId/documents` returns persisted synthetic document metadata.
- `GET /api/cases/:caseId/documents/:documentId` returns a document plus deterministic `PreparedDocument` text for Phase 4.
- `POST /api/cases/:caseId/documents/:documentId/extract` runs configured AI extraction, validates evidence, persists the attempt, and returns `201`, `503 AI_UNAVAILABLE`, or an explicit provider/validation failure.
- `GET /api/cases/:caseId/documents/:documentId/extract` returns the latest persisted extraction attempt or `null`.
- `POST /api/cases/:caseId/verify` evaluates the deterministic verification rules, replaces that case's persisted verification snapshot, and returns the current results. It returns `404 CASE_NOT_FOUND`, or `422 INSUFFICIENT_EVIDENCE` when the case has no comparable synthetic records.
- `GET /api/cases/:caseId/verification` returns the latest persisted verification snapshot. Results include a stable rule ID, deterministic outcome (`PASS`, `POTENTIAL_ISSUE`, or `INSUFFICIENT_EVIDENCE`), source-document IDs, and compared values where available.

`GET /api/cases/:caseId` runs a fresh deterministic verification snapshot after loading the selected case, so its returned `CaseDetail.verification` is current and persisted. The client `CaseService` is the only frontend fetch boundary. Inputs are validated server-side; invalid synthetic inputs return `400 INVALID_INPUT`. No route submits a government application, calls a government system, or makes a legal ownership determination.
