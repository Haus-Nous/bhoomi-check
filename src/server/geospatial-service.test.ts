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
  it("seeds each demo geometry idempotently", async () => { await parcelGeometryService.ensureSeedGeometries(); await parcelGeometryService.ensureSeedGeometries(); const heroRows = await getDatabase().query<{ id: string }>({ sql: "SELECT id FROM parcel_geometries WHERE case_id = ?", params: ["demo-family-001"] }); const controlRows = await getDatabase().query<{ id: string }>({ sql: "SELECT id FROM parcel_geometries WHERE case_id = ?", params: ["demo-family-002"] }); expect(heroRows).toEqual([{ id: "demo-family-001-geometry" }]); expect(controlRows).toEqual([{ id: "demo-family-002-geometry" }]); });
});
