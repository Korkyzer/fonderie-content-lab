import { NextResponse } from "next/server";

import {
  createPrompt,
  listPrompts,
  slugify,
  type NewPrompt,
} from "@/lib/data/prompts";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ prompts: listPrompts() });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<NewPrompt>;

  const required = [
    "title",
    "description",
    "category",
    "audience",
    "platform",
    "tone",
    "body",
  ] as const;
  for (const key of required) {
    if (!payload[key] || typeof payload[key] !== "string") {
      return NextResponse.json(
        { error: `Champ manquant ou invalide : ${key}` },
        { status: 400 },
      );
    }
  }

  const now = new Date().toISOString();
  const prompt = createPrompt({
    slug: payload.slug?.trim() || slugify(payload.title as string),
    title: payload.title as string,
    description: payload.description as string,
    category: payload.category as string,
    audience: payload.audience as string,
    platform: payload.platform as string,
    tone: (payload.tone as string) ?? "purple",
    rating: typeof payload.rating === "number" ? payload.rating : 4.5,
    monthlyUsage:
      typeof payload.monthlyUsage === "number" ? payload.monthlyUsage : 0,
    variables: (payload.variables as string) ?? "",
    body: payload.body as string,
    author: (payload.author as string) ?? "Équipe Fonderie",
    favorite: Boolean(payload.favorite),
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ prompt }, { status: 201 });
}
