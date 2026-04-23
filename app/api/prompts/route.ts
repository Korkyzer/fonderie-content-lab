import { NextResponse } from "next/server";

import {
  createPrompt,
  getPromptBySlug,
  listPrompts,
} from "@/lib/data/prompts";
import { parsePromptCreatePayload } from "@/app/api/prompts/payload";
import { requirePermission } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    return NextResponse.json({ prompts: listPrompts() });
  } catch (error) {
    console.error("Failed to list prompts", error);
    return NextResponse.json(
      { error: "Impossible de charger les prompts" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const access = await requirePermission("content.write");
  if (access.error) return access.error;

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

  try {
    const existing = getPromptBySlug(result.data.slug);
    if (existing) {
      return NextResponse.json(
        { error: "Un prompt avec ce slug existe déjà" },
        { status: 409 },
      );
    }

    const prompt = createPrompt(result.data);
    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    console.error("Failed to create prompt", error);
    return NextResponse.json(
      { error: "Impossible de créer le prompt" },
      { status: 500 },
    );
  }
}
