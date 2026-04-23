import { NextResponse } from "next/server";

import {
  parseTemplateCreatePayload,
} from "@/app/api/templates/payload";
import {
  createTemplate,
  getTemplateBySlug,
  listTemplates,
} from "@/lib/data/templates";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeArchived = url.searchParams.get("includeArchived") === "1";
    return NextResponse.json({ templates: listTemplates(includeArchived) });
  } catch (error) {
    console.error("Failed to list templates", error);
    return NextResponse.json(
      { error: "Impossible de charger les templates" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
  }

  const result = parseTemplateCreatePayload(payload, new Date().toISOString());
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const existing = getTemplateBySlug(result.data.slug);
    if (existing) {
      return NextResponse.json(
        { error: "Un template avec ce slug existe déjà" },
        { status: 409 },
      );
    }
    const template = createTemplate(result.data);
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Failed to create template", error);
    return NextResponse.json(
      { error: "Impossible de créer le template" },
      { status: 500 },
    );
  }
}
