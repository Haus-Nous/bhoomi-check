import { NextResponse } from "next/server";
import { caseApplicationService } from "@/server/case-application-service";
import { documentApplicationService } from "@/server/document-application-service";
import { verificationService } from "@/server/verification-service";
import { guidanceService } from "@/server/guidance-service";
export const runtime = "nodejs";
export async function GET(_: Request, { params }: { params: Promise<{ caseId: string }> }) { const { caseId } = await params; documentApplicationService.ensureSeedDocuments(); const detail = caseApplicationService.getCaseDetail(caseId); if (!detail) return NextResponse.json({ error: { code: "CASE_NOT_FOUND", message: "This synthetic case was not found." } }, { status: 404 }); verificationService.run(caseId); const refreshed = caseApplicationService.getCaseDetail(caseId)!; return NextResponse.json({ data: { ...refreshed, guidance: guidanceService.build(caseId, refreshed.verification, refreshed.documents) } }); }
