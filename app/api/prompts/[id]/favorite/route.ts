import { NextResponse } from "next/server";

import { toggleFavorite } from "@/lib/data/prompts";
import { parsePromptId } from "@/app/api/prompts/payload";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: raw } = await context.params;
  const id = parsePromptId(raw);
  if (id === null)
    return NextResponse.json({ error: "id invalide" }, { status: 400 });
  const prompt = toggleFavorite(id);
  if (!prompt)
    return NextResponse.json({ error: "prompt introuvable" }, { status: 404 });
  return NextResponse.json({ prompt });
}
