"use client";

import { useEffect, useState } from "react";
import { EmptyState, LoadingState } from "@/components/domain";
import { useTranslation } from "@/components/locale-context";
import { ParcelMap } from "@/components/parcel-map";
import type { ParcelIntelligence } from "@/types/geospatial";

const format = (value: number, digits: number) => value.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });

export function ParcelIntelligencePanel({ caseId }: { caseId: string }) {
  const c = useTranslation().parcel;
  const [state, setState] = useState<{ data: ParcelIntelligence | null; error: boolean }>({ data: null, error: false });
  useEffect(() => { const controller = new AbortController(); void fetch(`/api/cases/${encodeURIComponent(caseId)}/parcel-intelligence`, { signal: controller.signal }).then(async (response) => response.ok ? response.json() as Promise<{ data: ParcelIntelligence }> : Promise.reject()).then(({ data }) => setState({ data, error: false })).catch(() => { if (!controller.signal.aborted) setState({ data: null, error: true }); }); return () => controller.abort(); }, [caseId]);
  if (state.error) return <EmptyState title={c.emptyTitle} detail={c.emptyDetail} />;
  if (!state.data) return <LoadingState />;
  const { parcel, geometry, calculatedArea, recordedAreas } = state.data;
  if (!geometry || !calculatedArea) return <EmptyState title={c.emptyTitle} detail={c.emptyDetail} />;
  return <div className="parcel-intelligence"><ParcelMap geometry={geometry.geometry} label={`${c.mappedParcel}: Khata ${parcel.khata}, Khesra ${parcel.khesra || c.notAvailable}`} loadingLabel={c.mapLoading} unavailableLabel={c.mapUnavailable} backgroundUnavailableLabel={c.mapBackgroundUnavailable} /><section className="parcel-details" aria-label={c.identity}><div><p className="eyebrow">{c.identity}</p><h2>{c.mappedParcel}</h2><dl><div><dt>Khata (खाता)</dt><dd>{parcel.khata}</dd></div><div><dt>Khesra (खेसरा)</dt><dd>{parcel.khesra || c.notAvailable}</dd></div><div><dt>Mauza (मौजा)</dt><dd>{parcel.mauza}</dd></div><div><dt>{c.circle}</dt><dd>{parcel.circle}</dd></div><div><dt>{c.district}</dt><dd>{parcel.district}</dd></div></dl></div><div><p className="eyebrow">{c.geometry}</p><h2>{geometry.geometryType}</h2><dl><div><dt>{c.source}</dt><dd>{geometry.sourceReference}</dd></div><div><dt>{c.provenance}</dt><dd>{geometry.provenance}</dd></div><div><dt>{c.calculatedArea}</dt><dd>{c.calculatedFromGeometry}</dd></div></dl></div></section><section className="area-grid" aria-label={c.calculatedArea}><article><p className="eyebrow">{c.squareMeters}</p><strong>{format(calculatedArea.squareMeters, 2)} m²</strong></article><article><p className="eyebrow">{c.hectares}</p><strong>{format(calculatedArea.hectares, 4)} ha</strong></article><article><p className="eyebrow">{c.acres}</p><strong>{format(calculatedArea.acres, 4)} acre</strong></article></section><section className="recorded-areas" aria-labelledby="recorded-areas-title"><p className="eyebrow">{c.geometry}</p><h2 id="recorded-areas-title">{c.historicalArea} · {c.surveyArea}</h2><dl><div><dt>{c.historicalArea}</dt><dd>{recordedAreas.historical ? `${recordedAreas.historical.value} ${recordedAreas.historical.unit}` : c.notAvailable}</dd></div><div><dt>{c.surveyArea}</dt><dd>{recordedAreas.survey ? `${recordedAreas.survey.value} ${recordedAreas.survey.unit}` : c.notAvailable}</dd></div></dl></section><aside className="parcel-safety"><strong>{c.safetyTitle}</strong><p>{c.safetyDetail}</p></aside></div>;
}
