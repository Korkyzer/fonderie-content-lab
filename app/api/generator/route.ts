import { NextRequest, NextResponse } from "next/server";
import {
  CONTENT_TYPES,
  generateContent,
  type ContentType,
} from "@/lib/content-generator";

export const runtime = "nodejs";

type GeneratorRequestBody = {
  contentType?: unknown;
  audience?: unknown;
  goal?: unknown;
  tone?: unknown;
  angle?: unknown;
};

export async function POST(request: NextRequest) {
  let body: GeneratorRequestBody;

  try {
    const payload: unknown = await request.json();
    body = isRequestBody(payload) ? payload : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (!isContentType(body.contentType)) {
      return NextResponse.json(
        {
          error: `Invalid contentType. Must be one of: ${CONTENT_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const audience = readRequiredText(body.audience);
    const goal = readRequiredText(body.goal);
    const tone = readRequiredText(body.tone);
    const angle = readRequiredText(body.angle);

    if (!audience || !goal || !tone || !angle) {
      return NextResponse.json(
        { error: "Tous les champs sont requis pour générer un contenu." },
        { status: 400 },
      );
    }

    const generated = await generateContent({
      contentType: body.contentType,
      audience,
      goal,
      tone,
      angle,
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

function isRequestBody(value: unknown): value is GeneratorRequestBody {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isContentType(value: unknown): value is ContentType {
  return (
    typeof value === "string" &&
    (CONTENT_TYPES as readonly string[]).includes(value)
  );
}

function readRequiredText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}
