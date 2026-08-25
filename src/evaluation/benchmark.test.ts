import { describe, expect, it } from "vitest";
import { benchmarkCases, benchmarkSummary, evaluateCase, prohibitedClaimCount, scoreExpectedFacts } from "@/evaluation/benchmark";

describe("synthetic evaluation benchmark", () => {
  it("has explicit synthetic ground truth across clean, issue, and insufficient-evidence cases", () => {
    expect(benchmarkCases).toHaveLength(12);
    expect(benchmarkCases.every((item) => item.id.includes("demo") === false)).toBe(true);
    expect(benchmarkCases.find((item) => item.id === "hero-both-005")?.expected).toMatchObject({ area: "POTENTIAL_ISSUE", family: "POTENTIAL_ISSUE" });
    expect(benchmarkCases.find((item) => item.id === "control-012")?.expected.family).toBe("INSUFFICIENT_EVIDENCE");
  });

  it("scores extraction fields, missing facts, numeric strings, and false extractions", () => {
    expect(scoreExpectedFacts(["DEMO-128", "1.20 acre"], ["DEMO-128", "1.20 acre", "invented"])).toEqual({ expected: 2, matched: 2, missing: 0, falseExtractions: 1, evidencePresence: 3 });
  });

  it("evaluates deterministic rule outcomes including numeric equivalents", () => {
    const format = benchmarkCases.find((item) => item.id === "clean-format-002")!;
    expect(evaluateCase(format)).toEqual({ area: "PASS", family: "PASS" });
    expect(benchmarkSummary().verification).toMatchObject({ totalRuleChecks: 24, correct: 24, falsePositives: 0, falseNegatives: 0 });
  });

  it("checks grounding templates for prohibited claims", () => {
    expect(prohibitedClaimCount("Possible mismatch; review the source records.")).toBe(0);
    expect(prohibitedClaimCount("Government approved and ownership confirmed.")).toBe(2);
  });
});
