import { NextResponse } from "next/server";

import {
  createGenerateResponse,
  type GenerateRequest,
} from "@/lib/generator-mock";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<GenerateRequest>;
  return NextResponse.json(createGenerateResponse(body));
}
