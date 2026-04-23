import { NextRequest, NextResponse } from "next/server";
import { saveNewsletterDraft, listNewsletterDrafts } from "@/lib/newsletter-db";
import type { NewsletterDraftPayload } from "@/lib/newsletter";

export const runtime = "nodejs";

type DraftRequestBody = {
  id?: string;
  title?: string;
  templateKey?: string;
  payload?: NewsletterDraftPayload;
};

export async function GET() {
  return NextResponse.json({ drafts: listNewsletterDrafts() });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DraftRequestBody;
    if (
      !body.payload ||
      !body.templateKey?.trim() ||
      !body.title?.trim() ||
      !isDraftPayload(body.payload)
    ) {
      return NextResponse.json(
        { error: "Paramètres de brouillon incomplets." },
        { status: 400 },
      );
    }

    const draft = saveNewsletterDraft({
      id: body.id,
      title: body.title,
      templateKey: body.templateKey,
      payload: body.payload,
    });

    return NextResponse.json({ draft });
  } catch (issue) {
    return NextResponse.json(
      {
        error:
          issue instanceof Error ? issue.message : "La sauvegarde du brouillon a échoué.",
      },
      { status: 500 },
    );
  }
}

function isDraftPayload(value: NewsletterDraftPayload): boolean {
  return (
    Boolean(value.header?.title?.trim()) &&
    Boolean(value.header?.intro?.trim()) &&
    Array.isArray(value.sections) &&
    value.sections.length > 0 &&
    value.sections.every(
      (section) =>
        Boolean(section.id?.trim()) &&
        Boolean(section.title?.trim()) &&
        Boolean(section.body?.trim()) &&
        Boolean(section.highlight?.trim()),
    ) &&
    Boolean(value.cta?.label?.trim()) &&
    Boolean(value.cta?.url?.trim()) &&
    Boolean(value.footer?.note?.trim()) &&
    Boolean(value.footer?.signature?.trim())
  );
}
