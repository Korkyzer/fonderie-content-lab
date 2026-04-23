import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db/index";
import { kanbanComments } from "@/db/schema";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const cardId = Number(id);
  if (!Number.isFinite(cardId)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  const comments = db
    .select()
    .from(kanbanComments)
    .where(eq(kanbanComments.cardId, cardId))
    .orderBy(asc(kanbanComments.createdAt))
    .all();

  return NextResponse.json({ comments });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const cardId = Number(id);
  if (!Number.isFinite(cardId)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  let body: Partial<{ author: string; content: string }>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const author = body.author?.trim();
  const content = body.content?.trim();
  if (!author || !content) {
    return NextResponse.json(
      { error: "Auteur et contenu requis." },
      { status: 400 },
    );
  }

  const inserted = db
    .insert(kanbanComments)
    .values({
      cardId,
      author,
      content,
      createdAt: new Date().toISOString(),
    })
    .returning()
    .all();

  return NextResponse.json({ comment: inserted[0] }, { status: 201 });
}
