import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/cases/[caseId]/documents/[documentId]/extract/route";
import { documentApplicationService } from "@/server/document-application-service";

const params = (caseId: string, documentId: string) => ({ params: Promise.resolve({ caseId, documentId }) });

describe("synthetic extraction boundary", () => {
  it("rejects a document from another synthetic case before any extraction provider is invoked", async () => {
    await documentApplicationService.ensureSeedDocuments();
    expect(await documentApplicationService.prepare("demo-family-001", "demo-family-001-historical")).not.toBeNull();
    const crossCase = params("demo-family-002", "demo-family-001-historical");
    expect((await GET(new Request("http://localhost"), crossCase)).status).toBe(404);
    expect((await POST(new Request("http://localhost", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "arbitrary citizen text" }) }), crossCase)).status).toBe(404);
  });
});
