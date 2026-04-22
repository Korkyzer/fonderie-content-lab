import { NextResponse } from "next/server";

import { toggleFavorite } from "@/lib/data/prompts";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: raw } = await context.params;
  const id = Number.parseInt(raw, 10);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "id invalide" }, { status: 400 });
  const prompt = toggleFavorite(id);
  if (!prompt)
    return NextResponse.json({ error: "prompt introuvable" }, { status: 404 });
  return NextResponse.json({ prompt });
}
