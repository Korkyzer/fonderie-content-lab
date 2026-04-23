import { NextResponse } from "next/server";

import {
  parseTemplateId,
  parseTemplatePatchPayload,
} from "@/app/api/templates/payload";
import {
  deleteTemplate,
  getTemplateById,
  getTemplateBySlug,
  updateTemplate,
} from "@/lib/data/templates";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseTemplateId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }
  const template = getTemplateById(id);
  if (!template) {
    return NextResponse.json({ error: "Template introuvable" }, { status: 404 });
  }
  return NextResponse.json({ template });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseTemplateId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
  }

  const parsed = parseTemplatePatchPayload(payload);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (parsed.data.slug) {
    const conflict = getTemplateBySlug(parsed.data.slug);
    if (conflict && conflict.id !== id) {
      return NextResponse.json(
        { error: "Un template avec ce slug existe déjà" },
        { status: 409 },
      );
    }
  }

  try {
    const updated = updateTemplate(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "Template introuvable" }, { status: 404 });
    }
    return NextResponse.json({ template: updated });
  } catch (error) {
    console.error("Failed to update template", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le template" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseTemplateId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }
  const ok = deleteTemplate(id);
  if (!ok) {
    return NextResponse.json({ error: "Template introuvable" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
