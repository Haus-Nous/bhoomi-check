"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { ParcelGeoJson } from "@/types/geospatial";

const positions = (geometry: ParcelGeoJson) => geometry.type === "Polygon" ? geometry.coordinates.flat() : geometry.coordinates.flat(2);

export function ParcelMap({ geometry, label, loadingLabel, unavailableLabel }: { geometry: ParcelGeoJson; label: string; loadingLabel: string; unavailableLabel: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let disposed = false;
    let map: MapLibreMap | undefined;
    void (async () => {
      try {
        const maplibregl = await import("maplibre-gl");
        if (!container.current || disposed) return;
        const points = positions(geometry);
        const longitudes = points.map(([longitude]) => longitude);
        const latitudes = points.map(([, latitude]) => latitude);
        const mapColor = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
        const instance = new maplibregl.Map({ container: container.current, style: "https://demotiles.maplibre.org/style.json", center: [longitudes[0]!, latitudes[0]!], zoom: 16 });
        map = instance;
        instance.on("load", () => {
          if (disposed) return;
          const ready = instance as unknown as { addSource: (id: string, source: unknown) => void; addLayer: (layer: unknown) => void; fitBounds: (bounds: [[number, number], [number, number]], options: { padding: number; maxZoom: number }) => void };
          ready.addSource("parcel", { type: "geojson", data: { type: "Feature", properties: { synthetic: true }, geometry } });
          ready.addLayer({ id: "parcel-fill", type: "fill", source: "parcel", paint: { "fill-color": mapColor, "fill-opacity": 0.24 } });
          ready.addLayer({ id: "parcel-outline", type: "line", source: "parcel", paint: { "line-color": mapColor, "line-width": 3 } });
          ready.fitBounds([[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]], { padding: 44, maxZoom: 18 });
        });
        instance.on("error", () => { if (!disposed) setUnavailable(true); });
      } catch { if (!disposed) setUnavailable(true); }
    })();
    return () => { disposed = true; map?.remove(); };
  }, [geometry]);
  if (unavailable) return <div className="map-fallback" role="status">{unavailableLabel}</div>;
  return <figure className="parcel-map"><div ref={container} className="map-canvas" role="img" aria-label={label}><span className="map-loading">{loadingLabel}</span></div><figcaption>{label}</figcaption></figure>;
}
