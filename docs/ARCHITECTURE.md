# BhoomiCheck architecture

## Implemented prototype flow

```mermaid
flowchart LR
  UI[Citizen UI] --> CS[CaseService]
  CS --> API[Next.js API routes]
  API --> APP[Application / domain services]
  APP --> DB[(Local SQLite: synthetic data)]
  APP --> PREP[PreparedDocument]
  PREP --> EXT[Optional ExtractionService]
  EXT --> OAI[OpenAI provider when configured]
  APP --> VER[VerificationService]
  VER --> GUIDE[GuidanceService]
  GUIDE --> PACKET[ReviewPacketService]
  APP --> GOV[GovernmentAdapter]
  GOV --> MOCK[MockGovernmentAdapter]
```

The selected route is the case identity. UI components consume `CaseDetail`; they do not read SQLite or fixture files directly. The client `CaseService` calls typed case-scoped API routes. `PROTOTYPE_MODE = "synthetic-demo"` constrains new synthetic case inputs and approved fixture selection before persistence. Application services assemble persisted synthetic rows, deterministic verification, derived guidance, packets, and honest timeline state into the response.

## Document and verification flow

```mermaid
flowchart TD
  F[Approved synthetic fixture] --> D[Persisted document]
  D --> P[PreparedDocument]
  P --> E[Optional model candidate extraction]
  E --> V[Schema + span + semantic grounding validation]
  V --> X[Persisted extraction attempt]
  D --> R[Deterministic VerificationService]
  R --> G[GuidanceService]
  R --> K[Case-scoped review packet]
```

Extraction is optional and can suggest only grounded candidate facts. `VerificationService` does not use an LLM: it strictly parses supported acreage and compares an explicit family comparison subject with the survey holder. It persists `PASS`, `POTENTIAL_ISSUE`, or `INSUFFICIENT_EVIDENCE` with source-document references.

## Government boundary

`GovernmentAdapter` is server-only. The sole implementation is `MockGovernmentAdapter`, which derives synthetic process context locally and makes no network request. No official adapter, scraping, credentials, OTP flow, or submission path exists.

## Evaluation and observability

The 12-case evaluation constructs synthetic document inputs and invokes the production `VerificationService`. Ground truth is declared independently; calculated metrics include correct/incorrect outcomes, FP/FN, and insufficient-evidence classification counts. Metrics are process-local and privacy-minimized; they are not production monitoring.

## Current limits

Implemented: Next.js UI/API, local SQLite persistence, bundled synthetic fixture attachment, optional server-side extraction, deterministic verification, bilingual presentation, guidance, local review packets, and a mock government boundary.

Mocked: all government workflow context and every document/person/parcel fixture.

Future, not implemented: authentication/session tenancy, managed relational storage, object storage, queues/workers, production observability, migrations/backups, live government integration, and government submission. A real-data deployment must add an authenticated principal followed by authorization/case-ownership validation before exposing persistence. The lack of that boundary means this prototype must not be deployed as a shared case system.
