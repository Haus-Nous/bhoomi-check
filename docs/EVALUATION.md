# BhoomiCheck Evaluation

## Purpose

This is a small, reproducible prototype evaluation. It measures deterministic fixture behavior, structured extraction scoring helpers, safety checks, and robustness boundaries. It is not a real-world, legal, or production-accuracy benchmark.

## Evaluation dataset

The deterministic CI dataset contains 12 fully synthetic cases: clean records, area-only and family-only issues, the combined hero scenario, four insufficient-evidence variants, formatting/punctuation variants, and the control scenario. No live OpenAI or government service is required.

## Ground truth

Each fixture explicitly declares expected `AREA_CONSISTENCY` and `FAMILY_CONTEXT` outcomes plus relevant important facts. The benchmark fixture is the ground truth; it is not inferred from a production result.

## Extraction metrics

`scoreExpectedFacts` reports expected facts, matched facts, missing facts, false extractions, and evidence presence. The test includes a concrete two-fact scenario with two matches and one false extraction. Runtime extraction tests separately validate malformed output rejection, source-span grounding, provider failure, missing configuration, and prompt-version retention.

## Verification metrics

The runner evaluates 24 rule checks (12 fixtures × 2 rules), including 1.20 vs 1.200 normalization and insufficient evidence. The deterministic fixture run reports all expected outcomes correctly, with zero false positives and zero false negatives for this intentionally small synthetic set.

## Grounding/safety checks

The evaluation rejects prohibited claim phrases in citizen-facing template checks and tests that source values, rule outcomes, packet links, and cross-case references stay within existing deterministic boundaries. These checks do not claim to evaluate all natural-language risks.

## Robustness scenarios

Existing and evaluation tests cover malformed model output, unsupported facts, provider failure, missing OpenAI configuration, invalid case IDs, cross-case packet source, invalid packet body, insufficient evidence, and unsupported packet state transitions.

## Observability

`src/server/metrics.ts` provides a process-local, privacy-minimized event sink. Events contain only operation, success/failure, duration, and small metadata such as synthetic case/document IDs. Instrumentation failures are swallowed so they cannot interrupt a citizen workflow. This is not deployed monitoring infrastructure.

## Actual measured results

Command: `npm run eval`

- Dataset: 12 synthetic cases
- Verification: 24/24 expected rule outcomes (100.0%)
- False positives: 0
- False negatives: 0
- Hero fixture: `AREA_CONSISTENCY = POTENTIAL_ISSUE`; `FAMILY_CONTEXT = POTENTIAL_ISSUE`
- Control fixture: `AREA_CONSISTENCY = PASS`; `FAMILY_CONTEXT = INSUFFICIENT_EVIDENCE`

These numbers are emitted by the deterministic runner and verified by the evaluation tests. They describe this fixture set only.

## What these results do not mean

They do not establish production accuracy, performance on real land records, legal correctness, generalization to varied documents, or reliability of an optional live model. Optional live-model evaluation is not executed or reported by CI.

## Limitations

The benchmark is small, synthetic, and rules-focused. It does not include real documents, real citizens, official processes, production observability, or live-model results.
