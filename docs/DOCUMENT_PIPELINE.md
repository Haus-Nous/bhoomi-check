# Document pipeline

`Synthetic fixture → validation → persisted document metadata → deterministic content preparation → PreparedDocument → AI extraction (Phase 4) → structured entities (Phase 4) → verification (Phase 5)`.

`PreparedDocument` must contain `documentId`, `caseId`, `documentType`, canonical `text`, optional pages/sections, source metadata, and `synthetic: true`. Phase 3 does not infer entities or call an AI model.

Implemented Phase 3 path: persisted synthetic document metadata → deterministic `sourceText` → `PreparedDocument` served by the document-detail API. The text is canonical fixture content; OCR has not run and is not claimed.
