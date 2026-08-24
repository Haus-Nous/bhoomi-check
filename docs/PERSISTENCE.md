# Persistence

Local development uses Node's built-in SQLite (`data/bhoomi-check.sqlite`). The schema has foreign-keyed tables for each case aggregate, plus indexes on document and parcel case IDs. The database is seeded once with the two fictional demo cases and persists newly created cases across normal reloads. This is prototype-local persistence; it is not a government system and must contain synthetic data only.

Phase 4 adds the non-destructive `document_extractions` table. Each row stores document/case identity, completed or failed status, validated structured output when available, provider/model metadata, timestamp, and a safe failure code/message. API keys and raw document secrets are never stored.
