import { NextResponse } from "next/server";

import { parseTemplateId } from "@/app/api/templates/payload";
import {
  createTemplate,
  getTemplateById,
  getTemplateBySlug,
  slugifyTemplateName,
} from "@/lib/data/templates";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function nextAvailableSlug(baseSlug: string): string {
  const base = baseSlug.length > 0 ? baseSlug : "template";
  let candidate = `${base}-copie`;
  let suffix = 2;
  while (getTemplateBySlug(candidate)) {
    candidate = `${base}-copie-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function POST(_req: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseTemplateId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }
  const source = getTemplateById(id);
  if (!source) {
    return NextResponse.json({ error: "Template introuvable" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const baseSlug = slugifyTemplateName(source.slug);
  const newSlug = nextAvailableSlug(baseSlug);

  const duplicated = createTemplate({
    slug: newSlug,
    name: `${source.name} (copie)`,
    description: source.description,
    kind: source.kind,
    formation: source.formation ?? null,
    eventName: source.eventName ?? null,
    audience: source.audience ?? null,
    platform: source.platform,
    tone: source.tone,
    visualStyle: source.visualStyle,
    duration: source.duration,
    cta: source.cta,
    structure: JSON.stringify(source.structure),
    assets: JSON.stringify(source.assets),
    briefSeed: source.briefSeed,
    archived: false,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ template: duplicated }, { status: 201 });
}
