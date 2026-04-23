import { NextResponse } from "next/server";

import { toggleFavorite } from "@/lib/data/prompts";
import { parsePromptId } from "@/app/api/prompts/payload";
import { requirePermission } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const access = await requirePermission("content.write");
  if (access.error) return access.error;

  const { id: raw } = await context.params;
  const id = parsePromptId(raw);
  if (id === null) {
    return NextResponse.json({ error: "id invalide" }, { status: 400 });
  }

  try {
    const prompt = toggleFavorite(id);
    if (!prompt) {
      return NextResponse.json({ error: "prompt introuvable" }, { status: 404 });
    }
    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Failed to toggle favorite", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le favori" },
      { status: 500 },
    );
  }
}
