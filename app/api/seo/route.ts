import { NextRequest, NextResponse } from "next/server";
import { generateSeoSuggestions } from "@/lib/seo";

export const runtime = "nodejs";

type SeoRequestBody = {
  contentType?: string;
  title?: string;
  content?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SeoRequestBody;
  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json(
      { error: "Le titre et le contenu sont requis pour l'analyse SEO." },
      { status: 400 },
    );
  }

  const suggestion = await generateSeoSuggestions({
    contentType: body.contentType ?? "article blog",
    title: body.title,
    content: body.content,
  });

  return NextResponse.json(suggestion);
}
