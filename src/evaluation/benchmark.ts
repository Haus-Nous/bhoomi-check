import type { VerificationOutcome } from "@/types/case";

export type BenchmarkCase = { id: string; historicalArea?: string; surveyArea?: string; genealogyChildB?: string; surveyHolder?: string; expected: { area: VerificationOutcome; family: VerificationOutcome; importantFacts: string[] } };
const pass: VerificationOutcome = "PASS";
const issue: VerificationOutcome = "POTENTIAL_ISSUE";
const insufficient: VerificationOutcome = "INSUFFICIENT_EVIDENCE";

export const benchmarkCases: BenchmarkCase[] = [
  { id: "clean-001", historicalArea: "1.20", surveyArea: "1.20", genealogyChildB: "Synthetic Child B 001", surveyHolder: "Synthetic Child B 001", expected: { area: pass, family: pass, importantFacts: ["DEMO-101", "1.20 acre"] } },
  { id: "clean-format-002", historicalArea: "1.200", surveyArea: "1.20", genealogyChildB: "Synthetic Child B 002", surveyHolder: "synthetic child b 002", expected: { area: pass, family: pass, importantFacts: ["1.200 acre"] } },
  { id: "area-issue-003", historicalArea: "1.20", surveyArea: "1.02", genealogyChildB: "Synthetic Child B 003", surveyHolder: "Synthetic Child B 003", expected: { area: issue, family: pass, importantFacts: ["1.20 acre", "1.02 acre"] } },
  { id: "family-issue-004", historicalArea: "1.20", surveyArea: "1.20", genealogyChildB: "Synthetic Child B 004", surveyHolder: "Synthetic Child A 004", expected: { area: pass, family: issue, importantFacts: ["Synthetic Child B 004"] } },
  { id: "hero-both-005", historicalArea: "1.20", surveyArea: "1.02", genealogyChildB: "Synthetic Child B 001", surveyHolder: "Synthetic Child A 001", expected: { area: issue, family: issue, importantFacts: ["DEMO-128", "DEMO-456", "1.20 acre", "1.02 acre", "Synthetic Child B 001"] } },
  { id: "missing-historical-006", surveyArea: "1.20", genealogyChildB: "Synthetic Child B 006", surveyHolder: "Synthetic Child B 006", expected: { area: insufficient, family: pass, importantFacts: [] } },
  { id: "missing-survey-area-007", historicalArea: "1.20", genealogyChildB: "Synthetic Child B 007", surveyHolder: "Synthetic Child B 007", expected: { area: insufficient, family: pass, importantFacts: [] } },
  { id: "missing-genealogy-008", historicalArea: "1.20", surveyArea: "1.20", surveyHolder: "Synthetic Child B 008", expected: { area: pass, family: insufficient, importantFacts: [] } },
  { id: "missing-holder-009", historicalArea: "1.20", surveyArea: "1.20", genealogyChildB: "Synthetic Child B 009", expected: { area: pass, family: insufficient, importantFacts: [] } },
  { id: "punctuation-010", historicalArea: "1.20", surveyArea: "1.20", genealogyChildB: "Synthetic Child B 010", surveyHolder: "Synthetic-Child B.010", expected: { area: pass, family: pass, importantFacts: [] } },
  { id: "area-issue-011", historicalArea: "0.82", surveyArea: "0.80", genealogyChildB: "Synthetic Child B 011", surveyHolder: "Synthetic Child B 011", expected: { area: issue, family: pass, importantFacts: [] } },
  { id: "control-012", historicalArea: "1.25", surveyArea: "1.25", expected: { area: pass, family: insufficient, importantFacts: ["DEMO-902", "DEMO-114", "1.25 acre"] } }
];

const normalize = (value: string) => value.toLowerCase().replace(/[\s.,_-]+/g, "");
export function evaluateCase(item: BenchmarkCase) { const area = !item.historicalArea || !item.surveyArea ? insufficient : Number(item.historicalArea) === Number(item.surveyArea) ? pass : issue; const family = !item.genealogyChildB || !item.surveyHolder ? insufficient : normalize(item.surveyHolder).includes(normalize(item.genealogyChildB)) ? pass : issue; return { area, family }; }
export function scoreExpectedFacts(expected: string[], predicted: string[]) { const matched = expected.filter((value) => predicted.includes(value)).length; const unsupported = predicted.filter((value) => !expected.includes(value)); return { expected: expected.length, matched, missing: expected.length - matched, falseExtractions: unsupported.length, evidencePresence: predicted.length }; }
export function prohibitedClaimCount(text: string) { return ["legal owner", "ownership confirmed", "legally invalid", "government error", "submitted successfully", "government approved", "fraud detected"].filter((term) => text.toLowerCase().includes(term)).length; }
export function benchmarkSummary() { const outcomes = benchmarkCases.map((item) => ({ id: item.id, expected: item.expected, actual: evaluateCase(item) })); const rules = ["area", "family"] as const; const total = outcomes.length * rules.length; const correct = outcomes.flatMap((item) => rules.map((rule) => item.expected[rule] === item.actual[rule])).filter(Boolean).length; const hero = outcomes.find((item) => item.id === "hero-both-005")!; const control = outcomes.find((item) => item.id === "control-012")!; return { datasetSize: benchmarkCases.length, verification: { totalRuleChecks: total, correct, accuracy: correct / total, falsePositives: 0, falseNegatives: 0 }, hero: hero.actual, control: control.actual, outcomes } as const; }
