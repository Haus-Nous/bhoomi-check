import { describe, expect, it } from "vitest";
import { GeometryValidationError, geospatialService, MAX_GEOMETRY_BYTES, validateParcelGeoJson } from "@/server/geospatial-service";
import { getDatabase } from "@/server/database";
import { parcelGeometryService } from "@/server/parcel-geometry-service";
import type { GeoJsonMultiPolygon, GeoJsonPolygon } from "@/types/geospatial";

const polygon: GeoJsonPolygon = { type: "Polygon", coordinates: [[[0, 0], [0.001, 0], [0.001, 0.001], [0, 0.001], [0, 0]]] };
const multiPolygon: GeoJsonMultiPolygon = { type: "MultiPolygon", coordinates: [polygon.coordinates, [[[0.01, 0.01], [0.0105, 0.01], [0.0105, 0.0105], [0.01, 0.0105], [0.01, 0.01]]]] };

describe("GeoJSON validation", () => {
  it("accepts closed Polygon and MultiPolygon geometries", () => { expect(validateParcelGeoJson(polygon)).toEqual(polygon); expect(validateParcelGeoJson(multiPolygon)).toEqual(multiPolygon); });
  it("rejects malformed nesting, empty polygons, unclosed rings and short rings", () => { expect(() => validateParcelGeoJson({ type: "Polygon", coordinates: ["not-a-ring"] })).toThrow(GeometryValidationError); expect(() => validateParcelGeoJson({ type: "Polygon", coordinates: [] })).toThrow(GeometryValidationError); expect(() => validateParcelGeoJson({ type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1]]] })).toThrow(GeometryValidationError); expect(() => validateParcelGeoJson({ type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 0]]] })).toThrow(GeometryValidationError); });
  it("rejects invalid longitude, latitude, non-finite values and unsupported types", () => { expect(() => validateParcelGeoJson({ type: "Polygon", coordinates: [[[181, 0], [0, 0], [0, 1], [181, 0]]] })).toThrow(GeometryValidationError); expect(() => validateParcelGeoJson({ type: "Polygon", coordinates: [[[0, 91], [0, 0], [1, 1], [0, 91]]] })).toThrow(GeometryValidationError); expect(() => validateParcelGeoJson({ type: "Polygon", coordinates: [[[Number.NaN, 0], [0, 0], [1, 1], [Number.NaN, 0]]] })).toThrow(GeometryValidationError); expect(() => validateParcelGeoJson({ type: "GeometryCollection", geometries: [] })).toThrow(GeometryValidationError); });
  it("rejects payloads over the configured limit", () => { expect(() => validateParcelGeoJson({ type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]], padding: "x".repeat(MAX_GEOMETRY_BYTES) })).toThrow(GeometryValidationError); });
});

describe("deterministic geometry area", () => {
  it("calculates square metres, hectares and acres deterministically for Polygon and MultiPolygon", () => { const first = geospatialService.calculateArea({ geometry: polygon }); const second = geospatialService.calculateArea({ geometry: polygon }); const combined = geospatialService.calculateArea({ geometry: multiPolygon }); expect(first).toEqual(second); expect(first).toMatchObject({ provenance: "CALCULATED_FROM_GEOMETRY" }); expect(first.squareMeters).toBeGreaterThan(0); expect(first.hectares).toBeCloseTo(first.squareMeters / 10_000, 12); expect(first.acres).toBeCloseTo(first.squareMeters / 4_046.8564224, 12); expect(combined.squareMeters).toBeGreaterThan(first.squareMeters); });
});

describe("synthetic geometry persistence", () => {
  it("keeps the hero identity synthetic and calculates its corrected area through Turf", async () => {
    const hero = await parcelGeometryService.getForParcel("demo-family-001", "demo-family-001-parcel", "DEMO-128", "DEMO-456");
    expect(hero).toMatchObject({ id: "demo-family-001-geometry", caseId: "demo-family-001", khataId: "DEMO-128", khesraId: "DEMO-456", provenance: "SYNTHETIC" });
    const area = geospatialService.calculateArea(hero!);
    expect(area.provenance).toBe("CALCULATED_FROM_GEOMETRY");
    expect(area.acres).toBeGreaterThanOrEqual(1.02);
    expect(area.acres).toBeLessThanOrEqual(1.03);
  });

  it("corrects only the known old hero seed and remains idempotent", async () => {
    const database = getDatabase();
    const oldGeometry = JSON.stringify({ type: "Polygon", coordinates: [[[0, 0], [0.0005, 0], [0.0005, 0.0005], [0, 0.0005], [0, 0]]] });
    await database.execute({ sql: "UPDATE parcel_geometries SET geometry_json = ?, source_reference = ? WHERE id = ?", params: [oldGeometry, "BHOOMICHECK-SYNTHETIC-GEO-001", "demo-family-001-geometry"] });
    await parcelGeometryService.ensureSeedGeometries();
    await parcelGeometryService.ensureSeedGeometries();
    const hero = await parcelGeometryService.getForParcel("demo-family-001", "demo-family-001-parcel", "DEMO-128", "DEMO-456");
    expect(geospatialService.calculateArea(hero!).acres).toBeGreaterThanOrEqual(1.02);
    const heroRows = await database.query<{ id: string }>({ sql: "SELECT id FROM parcel_geometries WHERE case_id = ?", params: ["demo-family-001"] });
    expect(heroRows).toEqual([{ id: "demo-family-001-geometry" }]);
  });

  it("does not overwrite control or arbitrary user geometry", async () => {
    const database = getDatabase();
    const controlBefore = await parcelGeometryService.getForParcel("demo-family-002", "demo-family-002-parcel", "DEMO-902", "DEMO-114");
    const userGeometry = JSON.stringify({ type: "Polygon", coordinates: [[[1, 1], [1.001, 1], [1.001, 1.001], [1, 1.001], [1, 1]]] });
    await database.execute({ sql: "INSERT INTO parcel_geometries (id,case_id,parcel_id,geometry_json,source_type,source_reference,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)", params: ["phase-16a-user-geometry", "demo-case-user", "demo-case-user-parcel", userGeometry, "USER_IMPORTED", "USER-TEST", "2026-01-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z"] });
    await parcelGeometryService.ensureSeedGeometries();
    const controlAfter = await parcelGeometryService.getForParcel("demo-family-002", "demo-family-002-parcel", "DEMO-902", "DEMO-114");
    const user = await database.query<{ geometry_json: string }>({ sql: "SELECT geometry_json FROM parcel_geometries WHERE id = ?", params: ["phase-16a-user-geometry"] });
    expect(controlAfter?.geometry).toEqual(controlBefore?.geometry);
    expect(geospatialService.calculateArea(controlAfter!).acres).toBeCloseTo(0.37427380338418353, 12);
    expect(user).toEqual([{ geometry_json: userGeometry }]);
    await database.execute({ sql: "DELETE FROM parcel_geometries WHERE id = ?", params: ["phase-16a-user-geometry"] });
  });
});
