import { NextResponse } from "next/server";

import {
  createBrandAnalysisResponse,
  type BrandAnalysisRequest,
} from "@/lib/brand-guardian-mock";
import { requirePermission } from "@/lib/auth/session";

export async function POST(request: Request) {
  const access = await requirePermission("review.comment");
  if (access.error) return access.error;

  const body = (await request.json().catch(() => ({}))) as Partial<BrandAnalysisRequest>;
  return NextResponse.json(createBrandAnalysisResponse(body));
}

export async function GET() {
  return NextResponse.json(createBrandAnalysisResponse());
}
