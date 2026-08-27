import { describe, expect, it } from "vitest";
import { parcelBounds, parcelFeature, parcelRings } from "@/components/parcel-map";
import type { GeoJsonPolygon } from "@/types/geospatial";

const geometry: GeoJsonPolygon = { type: "Polygon", coordinates: [[[0, 0], [0.000579, 0], [0.000579, 0.000579], [0, 0.000579], [0, 0]]] };

describe("parcel map data preparation", () => {
  it("creates a synthetic GeoJSON feature and fits bounds from the actual parcel coordinates", () => {
    expect(parcelFeature(geometry)).toEqual({ type: "Feature", properties: { synthetic: true }, geometry });
    expect(parcelBounds(geometry)).toEqual([[0, 0], [0.000579, 0.000579]]);
    expect(parcelRings(geometry)).toEqual(geometry.coordinates);
  });
});
