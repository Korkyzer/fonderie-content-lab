import { NextRequest, NextResponse } from "next/server";
import { generateContent, type ContentGenerationInput } from "@/lib/content-generator";

export const runtime = "nodejs";

type GeneratorRequestBody = Partial<ContentGenerationInput>;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GeneratorRequestBody;

    if (
      !body.contentType ||
      !body.audience?.trim() ||
      !body.goal?.trim() ||
      !body.tone?.trim() ||
      !body.angle?.trim()
    ) {
      return NextResponse.json(
        { error: "Tous les champs sont requis pour générer un contenu." },
        { status: 400 },
      );
    }

    const generated = await generateContent({
      contentType: body.contentType,
      audience: body.audience,
      goal: body.goal,
      tone: body.tone,
      angle: body.angle,
    });

    return NextResponse.json({ generated });
  } catch (issue) {
    return NextResponse.json(
      {
        error:
          issue instanceof Error
            ? issue.message
            : "La génération de contenu a échoué.",
      },
      { status: 500 },
    );
  }
}
