# Verification engine

Verification uses deterministic rules only. `AREA_CONSISTENCY` compares normalized area values from historical and survey documents. `FAMILY_CONTEXT` compares an explicitly stated genealogy member with the survey-holder context. Results are persisted with stable rule identifiers, source-document IDs, compared values, and informational explanations.

Each rule produces one of three outcomes: `PASS`, `POTENTIAL_ISSUE`, or `INSUFFICIENT_EVIDENCE`. A missing record, area, genealogy member, or recorded holder yields `INSUFFICIENT_EVIDENCE`; it never becomes an invented discrepancy. The UI maps these to passed, warning, and review states respectively.

Evidence is traced to the persisted synthetic document records prepared in Phase 4. Extraction provenance remains available on the document itself; verification does not use an LLM to decide whether values conflict. Its confidence indicates clarity of the deterministic comparison only, never ownership, legal validity, or entitlement. A verification rerun replaces the saved snapshot for that case, making the latest persisted result idempotent and current.
