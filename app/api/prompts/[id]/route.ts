import { NextResponse } from "next/server";

import {
  deletePromptById,
  getPromptById,
  updatePromptById,
} from "@/lib/data/prompts";
import {
  parsePromptId,
  parsePromptPatchPayload,
} from "@/app/api/prompts/payload";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: raw } = await context.params;
  const id = parsePromptId(raw);
  if (id === null) return NextResponse.json({ error: "id invalide" }, { status: 400 });
  const prompt = getPromptById(id);
  if (!prompt) return NextResponse.json({ error: "prompt introuvable" }, { status: 404 });
  return NextResponse.json({ prompt });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: raw } = await context.params;
  const id = parsePromptId(raw);
  if (id === null) return NextResponse.json({ error: "id invalide" }, { status: 400 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
  }

  const result = parsePromptPatchPayload(payload);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const prompt = updatePromptById(id, result.data);
  if (!prompt) return NextResponse.json({ error: "prompt introuvable" }, { status: 404 });
  return NextResponse.json({ prompt });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: raw } = await context.params;
  const id = parsePromptId(raw);
  if (id === null) return NextResponse.json({ error: "id invalide" }, { status: 400 });
  const deleted = deletePromptById(id);
  if (!deleted)
    return NextResponse.json({ error: "prompt introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
