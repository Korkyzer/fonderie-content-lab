import { NextResponse } from "next/server";

import {
  createPrompt,
  listPrompts,
} from "@/lib/data/prompts";
import { parsePromptCreatePayload } from "@/app/api/prompts/payload";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ prompts: listPrompts() });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
  }

  const result = parsePromptCreatePayload(payload, new Date().toISOString());
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const prompt = createPrompt(result.data);

  return NextResponse.json({ prompt }, { status: 201 });
}
