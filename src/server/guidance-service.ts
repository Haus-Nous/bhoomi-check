import type { DocumentItem, GuidanceItem, VerificationItem } from "@/types/case";

const caution = "This is preparation only. BhoomiCheck cannot decide which record is legally correct, submit a request, or make an official correction.";

function relatedDocuments(item: VerificationItem, documents: DocumentItem[]) {
  const supportingIds = documents.filter((document) => document.id.endsWith("current") || document.id.endsWith("support")).map((document) => document.id);
  return [...new Set([...item.sourceDocumentIds, ...supportingIds])];
}

function checklist(ruleId: VerificationItem["ruleId"], status: GuidanceItem["status"]) {
  if (status === "NEEDS_MORE_INFORMATION") return [{ id: "records", label: "Keep the available related records together." }, { id: "missing", label: "Note which comparable record or value is still unavailable." }];
  if (status === "NO_ACTION_NEEDED") return [{ id: "retain", label: "Keep the compared record references together for later review." }];
  if (ruleId === "AREA_CONSISTENCY") return [{ id: "areas", label: "Review both area values side by side." }, { id: "identifiers", label: "Confirm the parcel identifiers match across the records." }, { id: "context", label: "Note any measurement, update, or subdivision context that needs clarification." }, { id: "references", label: "Keep the relevant record references together." }];
  return [{ id: "genealogy", label: "Review the genealogy entry named in the comparison." }, { id: "holder", label: "Compare the current holder context with that entry." }, { id: "identifiers", label: "Confirm the parcel identifiers match across the related records." }, { id: "references", label: "Keep the relevant record references together." }];
}

function forResult(caseId: string, item: VerificationItem, documents: DocumentItem[]): GuidanceItem {
  const potential = item.outcome === "POTENTIAL_ISSUE";
  const insufficient = item.outcome === "INSUFFICIENT_EVIDENCE";
  const status = potential ? "READY_TO_REVIEW" : insufficient ? "NEEDS_MORE_INFORMATION" : "NO_ACTION_NEEDED";
  const area = item.ruleId === "AREA_CONSISTENCY";
  const title = potential ? area ? "Review the differing area values" : "Review the family and holder context" : insufficient ? area ? "Gather comparable area information" : "Gather comparable family-context information" : area ? "No immediate area review suggested" : "No immediate family-context review suggested";
  const explanation = potential ? area ? "Review the historical/supporting record and survey entry together. BhoomiCheck does not determine which value is correct." : "Review the genealogy/family record against the current holder and survey context. BhoomiCheck does not determine ownership or inheritance." : insufficient ? "More comparable information is needed before this check can be assessed." : "No immediate action is suggested for this check based on the compared synthetic records.";
  return { id: `${caseId}-guidance-${item.id}`, caseId, verificationResultId: item.id, ruleId: item.ruleId, title, explanation, priority: potential ? area ? 10 : 20 : insufficient ? area ? 70 : 80 : area ? 90 : 100, status, documentIds: relatedDocuments(item, documents), checklist: checklist(item.ruleId, status), caution, sourceVerificationResultIds: [item.id] };
}

export class GuidanceService {
  build(caseId: string, verification: VerificationItem[], documents: DocumentItem[]) { return verification.map((item) => forResult(caseId, item, documents)).sort((left, right) => left.priority - right.priority); }
}

export const guidanceService = new GuidanceService();
