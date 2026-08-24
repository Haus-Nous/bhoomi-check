import { describe, expect, it } from "vitest";
import { CaseApplicationService, ValidationError } from "@/server/case-application-service";
import { documentApplicationService } from "@/server/document-application-service";

describe("CaseApplicationService", () => {
  const service = new CaseApplicationService();
  it("assembles persisted demo-family-001 data", () => { const detail = service.getCaseDetail("demo-family-001"); expect(detail?.case.nickname).toBe("Demo Case 001"); expect(detail?.documents[0]?.isSynthetic).toBe(true); expect(detail?.landParcels[0]?.khata).toBe("DEMO-128"); });
  it("assembles a distinct second demo case", () => { const first = service.getCaseDetail("demo-family-001"); const second = service.getCaseDetail("demo-family-002"); expect(second?.case.nickname).toBe("Demo Case 002"); expect(second?.landParcels[0]?.khata).not.toBe(first?.landParcels[0]?.khata); });
  it("returns null for a missing case", () => { expect(service.getCaseDetail("does-not-exist")).toBeNull(); });
  it("persists a newly created empty case", () => { const created = service.createCase({ district: "Demo District", circle: "Demo Circle", village: "Example Mauza", khata: "DEMO-777", nickname: "Persisted synthetic case" }); const reloaded = service.getCaseDetail(created.case.id); expect(reloaded?.case.nickname).toBe("Persisted synthetic case"); expect(reloaded?.documents).toHaveLength(0); });
  it("rejects malformed synthetic input", () => { expect(() => service.createCase({ district: "", circle: "Demo Circle", village: "Example Mauza", khata: "128", nickname: "Bad" })).toThrow(ValidationError); });
  it("seeds deterministic hero documents and two controlled differences", () => { documentApplicationService.ensureSeedDocuments(); const documents = documentApplicationService.list("demo-family-001"); const historical = documents.find((item) => item.id.endsWith("historical")); const survey = documents.find((item) => item.id.endsWith("survey")); expect(documents.length).toBeGreaterThanOrEqual(6); expect(historical?.sourceText).toContain("1.20 acre"); expect(survey?.sourceText).toContain("1.02 acre"); expect(documents.find((item) => item.id.endsWith("genealogy"))?.sourceText).toContain("Synthetic Child B 001"); });
  it("keeps the control records consistent and prepares canonical content", () => { const documents = documentApplicationService.list("demo-family-002"); const seeded = documents.filter((item) => item.id.includes("control")); expect(seeded).toHaveLength(2); expect(seeded.every((item) => item.sourceText.includes("1.25 acre"))).toBe(true); const prepared = documentApplicationService.prepare("demo-family-001", "demo-family-001-historical"); expect(prepared?.text).toContain("Synthetic demo document"); expect(prepared?.synthetic).toBe(true); });
});
