# API

- `GET /api/cases/:caseId` returns one coherent `CaseDetail` or `404 CASE_NOT_FOUND`.
- `POST /api/cases` validates a synthetic case payload and returns `201` with its `CaseDetail`.
- `GET /api/cases/:caseId/documents` returns persisted synthetic document metadata.
- `GET /api/cases/:caseId/documents/:documentId` returns a document plus deterministic `PreparedDocument` text for Phase 4.
- `POST /api/cases/:caseId/documents/:documentId/extract` runs configured AI extraction, validates evidence, persists the attempt, and returns `201`, `503 AI_UNAVAILABLE`, or an explicit provider/validation failure.
- `GET /api/cases/:caseId/documents/:documentId/extract` returns the latest persisted extraction attempt or `null`.

The client `CaseService` is the only frontend fetch boundary. Inputs are validated server-side; invalid synthetic inputs return `400 INVALID_INPUT`.
