# Synthetic geospatial foundation

## Implemented in Phase 16

BhoomiCheck persists one clearly fictional GeoJSON `Polygon` for each seeded demo case. `ParcelGeometry` records the case/parcel association, immutable demo identifiers, `EPSG:4326`, source reference, source type, provenance, quality, and timestamps. Only `SYNTHETIC` geometry is populated.

`GeospatialService` accepts only closed, bounded GeoJSON `Polygon` or `MultiPolygon` values under a payload limit. It rejects empty, unclosed, malformed, non-finite, out-of-range, or unsupported geometry. It calculates square metres, hectares, and acres deterministically with Turf and labels every result `CALCULATED_FROM_GEOMETRY`.

`ParcelIntelligenceService` assembles selected-case parcel identity, geometry, calculated area, and contextual historical/survey area values. It does not create a discrepancy status and does not modify `AREA_CONSISTENCY`.

## Persistence and isolation

`parcel_geometries` stores portable text GeoJSON in both SQLite and Supabase Postgres. No PostGIS runtime is required. Geometry is resolved by both `case_id` and `parcel_id`; no client-supplied geometry ID is accepted. Seed creation and demo reset are idempotent, and new synthetic cases intentionally have no geometry.

## Map boundary

`ParcelMap` is a client-side MapLibre visualization using the public no-key MapLibre demo style. It receives geometry from the case-scoped parcel-intelligence API. Geometry calculation is independent of the basemap. A future `BasemapProvider` may change visualization, while a future `ImageryProvider` may add context; neither changes geometry or its deterministic calculation.

## Future integration boundary

Only this path exists today:

```text
SyntheticParcelGeometryProvider → normalized ParcelGeometry
```

A future authorized path may be designed as:

```text
GovernmentAdapter → CadastralParcelProvider → normalized ParcelGeometry
```

No government provider, BhuNaksha data, real cadastral geometry, satellite analysis, ownership inference, possession conclusion, or encroachment determination is implemented.

## Citizen safety wording

The interface calls this a mapped parcel, synthetic parcel boundary, and geometry estimate. It is not an official cadastral boundary, legal truth, proof of ownership, proof of possession, or proof of encroachment.
