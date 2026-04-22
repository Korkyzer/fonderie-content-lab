import { NextResponse } from "next/server";

import {
  createBrandAnalysisResponse,
  type BrandAnalysisRequest,
} from "@/lib/brand-guardian-mock";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<BrandAnalysisRequest>;
  return NextResponse.json(createBrandAnalysisResponse(body));
}

export async function GET() {
  return NextResponse.json(createBrandAnalysisResponse());
}
