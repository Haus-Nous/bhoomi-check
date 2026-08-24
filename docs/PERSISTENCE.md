# Persistence

Local development uses Node's built-in SQLite (`data/bhoomi-check.sqlite`). The schema has foreign-keyed tables for each case aggregate, plus indexes on document and parcel case IDs. The database is seeded once with the two fictional demo cases and persists newly created cases across normal reloads. This is prototype-local persistence; it is not a government system and must contain synthetic data only.
