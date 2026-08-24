# Data model

SQLite persists synthetic cases and related people, relationships, parcels, documents, survey records, verification results, actions, and timeline events. Each table uses a text primary key and `case_id` foreign key; all seed data is fictional and carries synthetic-only content. The application service assembles those rows into the frontend `CaseDetail` contract.

Document payloads persist ID, case ID, type, synthetic marker, processing state, deterministic source text, and metadata needed to form a `PreparedDocument`. Binary file storage and OCR are deliberately outside this prototype phase.

`DocumentExtraction` records an immutable extraction attempt. A completed result contains typed facts with a field key, string value, coarse extraction confidence, exact source quote/span, uncertainty text, and `needsHumanReview`. Failed attempts contain no result and retain only a safe error state plus provider/model audit metadata.

`verification_results` stores a replaceable deterministic snapshot per case. Its JSON payload maps to `VerificationItem`: `ruleId`, `outcome`, citizen-facing explanation, UI status, comparison confidence, source-document IDs, and expected/observed values when evidence is present. `outcome` is `PASS`, `POTENTIAL_ISSUE`, or `INSUFFICIENT_EVIDENCE`; the latter is stored instead of manufacturing a discrepancy when a required document or fact is unavailable. The result references the persisted synthetic documents used for the rule, preserving the provenance boundary established by document preparation and extraction.
