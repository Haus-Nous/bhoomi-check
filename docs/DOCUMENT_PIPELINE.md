# Document pipeline

`Synthetic fixture → validation → persisted document metadata → deterministic content preparation → PreparedDocument → ExtractionService → ExtractionProvider → runtime validation → evidence-backed extraction persistence → verification (future phase)`.

`PreparedDocument` must contain `documentId`, `caseId`, `documentType`, canonical `text`, optional pages/sections, source metadata, and `synthetic: true`. Phase 3 does not infer entities or call an AI model.

Implemented Phase 3 path: persisted synthetic document metadata → deterministic `sourceText` → `PreparedDocument` served by the document-detail API. The text is canonical fixture content; OCR has not run and is not claimed.

## Phase 4 extraction

`ExtractionService` consumes only a synthetic `PreparedDocument`. `OpenAIExtractionProvider` uses the official server-side SDK and a strict JSON schema; `OPENAI_API_KEY` is read from the environment and is never persisted. Tests inject fake providers and never contact OpenAI.

The model may suggest only explicitly stated document type, people, relationships, Khata/Khesra, area/unit, location, reference identifiers, and dates. Runtime validation rejects unknown shapes and evidence whose exact quote and offsets do not match `PreparedDocument.text`. Completed and failed attempts are stored in SQLite with provider/model metadata and timestamps. Provider failures and missing configuration are explicit; no fallback fields are fabricated.

Confidence is a coarse `low` / `medium` / `high` statement about extraction clarity only. It is not legal, ownership, entitlement, or government-verification confidence. Every suggestion remains marked for human review. Discrepancy reasoning remains outside Phase 4.
