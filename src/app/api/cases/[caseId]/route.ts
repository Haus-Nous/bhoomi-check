import { NextResponse } from "next/server";
import { caseApplicationService } from "@/server/case-application-service";
import { documentApplicationService } from "@/server/document-application-service";
import { verificationService } from "@/server/verification-service";
export const runtime = "nodejs";
export async function GET(_: Request, { params }: { params: Promise<{ caseId: string }> }) { const { caseId } = await params; documentApplicationService.ensureSeedDocuments(); const detail = caseApplicationService.getCaseDetail(caseId); if (!detail) return NextResponse.json({ error: { code: "CASE_NOT_FOUND", message: "This synthetic case was not found." } }, { status: 404 }); verificationService.run(caseId); return NextResponse.json({ data: caseApplicationService.getCaseDetail(caseId) }); }
