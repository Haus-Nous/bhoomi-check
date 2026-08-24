import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/cases/[caseId]/route";

const params = (caseId: string) => ({ params: Promise.resolve({ caseId }) });

describe("case detail guidance integration", () => {
  it("returns deterministic guidance with the selected case detail", async () => {
    const response = await GET(new Request("http://localhost/api/cases/demo-family-001"), params("demo-family-001"));
    const body = await response.json() as { data: { guidance: { caseId: string; status: string; ruleId: string }[] } };
    expect(response.status).toBe(200);
    expect(body.data.guidance).toEqual(expect.arrayContaining([
      expect.objectContaining({ caseId: "demo-family-001", ruleId: "AREA_CONSISTENCY", status: "READY_TO_REVIEW" }),
      expect.objectContaining({ caseId: "demo-family-001", ruleId: "FAMILY_CONTEXT", status: "READY_TO_REVIEW" }),
    ]));
  });
});
