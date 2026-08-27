import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/cases/[caseId]/parcel-intelligence/route";
import { caseApplicationService } from "@/server/case-application-service";

const params = (caseId: string) => ({ params: Promise.resolve({ caseId }) });

describe("parcel intelligence API", () => {
  it("returns the isolated hero geometry and contextual recorded areas", async () => {
    const response = await GET(new Request("http://localhost"), params("demo-family-001"));
    const body = await response.json() as { data: { parcel: { khata: string; khesra?: string }; geometry: { caseId: string; provenance: string; sourceReference: string } | null; calculatedArea: { squareMeters: number; acres: number; provenance: string } | null; recordedAreas: { historical: { value: number } | null; survey: { value: number } | null } } };
    expect(response.status).toBe(200);
    expect(body.data.parcel).toMatchObject({ khata: "DEMO-128", khesra: "DEMO-456" });
    expect(body.data.geometry).toMatchObject({ caseId: "demo-family-001", provenance: "SYNTHETIC", sourceReference: "BHOOMICHECK-SYNTHETIC-GEO-001-V2" });
    expect(body.data.calculatedArea).toMatchObject({ provenance: "CALCULATED_FROM_GEOMETRY" });
    expect(body.data.calculatedArea?.acres).toBeGreaterThanOrEqual(1.02);
    expect(body.data.calculatedArea?.acres).toBeLessThanOrEqual(1.03);
    expect(body.data.recordedAreas).toEqual({ historical: { value: 1.2, unit: "acre" }, survey: { value: 1.02, unit: "acre" } });
  });

  it("keeps the control geometry isolated and gives new cases a safe geometry empty state", async () => {
    const control = await GET(new Request("http://localhost"), params("demo-family-002"));
    const controlBody = await control.json() as { data: { parcel: { khata: string }; geometry: { id: string; caseId: string } | null } };
    expect(controlBody.data.parcel.khata).toBe("DEMO-902");
    expect(controlBody.data.geometry).toMatchObject({ id: "demo-family-002-geometry", caseId: "demo-family-002" });
    const created = await caseApplicationService.createCase({ district: "Demo District", circle: "Demo Circle", village: "Demo Mauza", khata: "DEMO-GEO-NEW-001", nickname: "Synthetic unmapped case" });
    const fresh = await GET(new Request("http://localhost"), params(created.case.id));
    const freshBody = await fresh.json() as { data: { geometry: null; calculatedArea: null } };
    expect(fresh.status).toBe(200);
    expect(freshBody.data).toMatchObject({ geometry: null, calculatedArea: null });
  });
});
