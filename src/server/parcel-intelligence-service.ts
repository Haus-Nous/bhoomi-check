import { caseApplicationService } from "@/server/case-application-service";
import { documentApplicationService } from "@/server/document-application-service";
import { geospatialService } from "@/server/geospatial-service";
import { parcelGeometryService } from "@/server/parcel-geometry-service";
import { parseSupportedArea } from "@/server/verification-service";
import type { ParcelIntelligence } from "@/types/geospatial";

export class ParcelIntelligenceService {
  async get(caseId: string): Promise<ParcelIntelligence | null> {
    const detail = await caseApplicationService.getCaseDetail(caseId);
    const parcel = detail?.landParcels[0];
    if (!detail || !parcel) return null;
    const geometry = await parcelGeometryService.getForParcel(caseId, parcel.id, parcel.khata, parcel.khesra);
    const documents = await documentApplicationService.list(caseId);
    const historical = documents.find((document) => document.id.endsWith("historical")) ?? documents.find((document) => document.kind === "legacy-record" && document.id !== `${caseId}-document`);
    const survey = documents.find((document) => document.id.endsWith("survey")) ?? documents.find((document) => document.kind === "survey-record");
    const historicalArea = historical ? parseSupportedArea(historical.sourceText) : null;
    const surveyArea = survey ? parseSupportedArea(survey.sourceText) : null;
    return { caseId, parcel: { id: parcel.id, khata: parcel.khata, khesra: parcel.khesra, district: detail.case.location.district, circle: detail.case.location.circle, mauza: detail.case.location.village }, geometry, calculatedArea: geometry ? geospatialService.calculateArea(geometry) : null, recordedAreas: { historical: historicalArea ? { value: historicalArea.value, unit: historicalArea.unit } : null, survey: surveyArea ? { value: surveyArea.value, unit: surveyArea.unit } : null } };
  }
}

export const parcelIntelligenceService = new ParcelIntelligenceService();
