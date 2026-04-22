import { NextResponse } from "next/server";

import {
  deletePromptById,
  getPromptById,
  getPromptBySlug,
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
  try {
    const prompt = getPromptById(id);
    if (!prompt) {
      return NextResponse.json({ error: "prompt introuvable" }, { status: 404 });
    }
    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Failed to read prompt", error);
    return NextResponse.json(
      { error: "Impossible de charger le prompt" },
      { status: 500 },
    );
  }
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

  try {
    const current = getPromptById(id);
    if (!current) {
      return NextResponse.json({ error: "prompt introuvable" }, { status: 404 });
    }

    if (result.data.slug) {
      const conflict = getPromptBySlug(result.data.slug);
      if (conflict && conflict.id !== id) {
        return NextResponse.json(
          { error: "Un prompt avec ce slug existe déjà" },
          { status: 409 },
        );
      }
    }

    const prompt = updatePromptById(id, result.data);
    if (!prompt) {
      return NextResponse.json({ error: "prompt introuvable" }, { status: 404 });
    }
    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Failed to update prompt", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le prompt" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: raw } = await context.params;
  const id = parsePromptId(raw);
  if (id === null) return NextResponse.json({ error: "id invalide" }, { status: 400 });
  try {
    const deleted = deletePromptById(id);
    if (!deleted) {
      return NextResponse.json({ error: "prompt introuvable" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete prompt", error);
    return NextResponse.json(
      { error: "Impossible de supprimer le prompt" },
      { status: 500 },
    );
  }
}
