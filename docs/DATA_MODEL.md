# Data model

SQLite persists synthetic cases and related people, relationships, parcels, documents, survey records, verification results, actions, and timeline events. Each table uses a text primary key and `case_id` foreign key; all seed data is fictional and carries synthetic-only content. The application service assembles those rows into the frontend `CaseDetail` contract.

Document payloads persist ID, case ID, type, synthetic marker, processing state, deterministic source text, and metadata needed to form a `PreparedDocument`. Binary file storage and OCR are deliberately outside this prototype phase.
