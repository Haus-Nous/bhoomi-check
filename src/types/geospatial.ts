export type GeoJsonPosition = [number, number];
export type GeoJsonLinearRing = GeoJsonPosition[];
export type GeoJsonPolygon = { type: "Polygon"; coordinates: GeoJsonLinearRing[] };
export type GeoJsonMultiPolygon = { type: "MultiPolygon"; coordinates: GeoJsonLinearRing[][] };
export type ParcelGeoJson = GeoJsonPolygon | GeoJsonMultiPolygon;

export type ParcelGeometryProvenance = "SYNTHETIC" | "USER_IMPORTED" | "OFFICIAL_REFERENCE";
export type ParcelGeometrySourceType = "SYNTHETIC" | "USER_IMPORTED" | "OFFICIAL_REFERENCE";
export type GeometryQuality = "DEMONSTRATION_ONLY" | "UNVERIFIED" | "REFERENCE_ONLY";

export type ParcelGeometry = {
  id: string;
  caseId: string;
  parcelId: string;
  khataId: string;
  khesraId?: string;
  geometryType: ParcelGeoJson["type"];
  geometry: ParcelGeoJson;
  coordinateReferenceSystem: "EPSG:4326";
  sourceType: ParcelGeometrySourceType;
  sourceReference: string;
  importedAt: string;
  provenance: ParcelGeometryProvenance;
  quality: GeometryQuality;
  createdAt: string;
  updatedAt: string;
};

export type CalculatedGeometryArea = {
  squareMeters: number;
  hectares: number;
  acres: number;
  provenance: "CALCULATED_FROM_GEOMETRY";
};

export type ParcelIntelligence = {
  caseId: string;
  parcel: { id: string; khata: string; khesra?: string; district: string; circle: string; mauza: string };
  geometry: ParcelGeometry | null;
  calculatedArea: CalculatedGeometryArea | null;
  recordedAreas: { historical: { value: number; unit: "acre" } | null; survey: { value: number; unit: "acre" } | null };
};
