import { NextResponse } from "next/server";
import { caseApplicationService } from "@/server/case-application-service";
import { documentApplicationService } from "@/server/document-application-service";
export const runtime = "nodejs";
export async function GET(_: Request, { params }: { params: Promise<{ caseId: string }> }) { const { caseId } = await params; documentApplicationService.ensureSeedDocuments(); const detail = caseApplicationService.getCaseDetail(caseId); return detail ? NextResponse.json({ data: detail }) : NextResponse.json({ error: { code: "CASE_NOT_FOUND", message: "This synthetic case was not found." } }, { status: 404 }); }
