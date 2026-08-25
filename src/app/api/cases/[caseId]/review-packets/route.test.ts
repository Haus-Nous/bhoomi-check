import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/cases/[caseId]/review-packets/route";

const params = (caseId: string) => ({ params: Promise.resolve({ caseId }) });

describe("review packet write boundary", () => {
  it("rejects a cross-case verification result", async () => {
    const response = await POST(new Request("http://localhost/api/cases/demo-family-002/review-packets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ verificationResultId: "demo-family-001-area-consistency" }) }), params("demo-family-002"));
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ error: { code: "PACKET_UNAVAILABLE", message: "This packet could not be prepared from the selected result." } });
  });

  it("returns a safe validation error for malformed or unsupported input", async () => {
    const response = await POST(new Request("http://localhost/api/cases/demo-family-001/review-packets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ verificationResultId: "bad value", extra: true }) }), params("demo-family-001"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: { code: "INVALID_INPUT", message: "Choose a valid potential issue to prepare." } });
  });
});
