import { NextResponse } from "next/server";

import {
  deletePromptById,
  getPromptById,
  updatePromptById,
  type NewPrompt,
} from "@/lib/data/prompts";

export const dynamic = "force-dynamic";

function parseId(param: string) {
  const id = Number.parseInt(param, 10);
  return Number.isFinite(id) ? id : null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: raw } = await context.params;
  const id = parseId(raw);
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
  const id = parseId(raw);
  if (id === null) return NextResponse.json({ error: "id invalide" }, { status: 400 });

  const patch = (await request.json()) as Partial<NewPrompt>;
  const prompt = updatePromptById(id, patch);
  if (!prompt) return NextResponse.json({ error: "prompt introuvable" }, { status: 404 });
  return NextResponse.json({ prompt });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: raw } = await context.params;
  const id = parseId(raw);
  if (id === null) return NextResponse.json({ error: "id invalide" }, { status: 400 });
  const deleted = deletePromptById(id);
  if (!deleted)
    return NextResponse.json({ error: "prompt introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
