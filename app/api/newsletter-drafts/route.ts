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
  const body = (await request.json()) as DraftRequestBody;
  if (!body.payload || !body.templateKey || !body.title) {
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
}
