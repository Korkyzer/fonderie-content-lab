import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { kanbanCards } from "@/db/schema";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const cardId = Number(id);
  if (!Number.isFinite(cardId)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  const body = (await request.json()) as Partial<{
    columnId: string;
    title: string;
    platform: string;
    persona: string;
    campaign: string;
    assignee: string;
    dueDate: string;
    aiProgress: number;
    brandScore: number;
  }>;

  const updates: Record<string, unknown> = {};
  if (body.columnId) updates.columnId = body.columnId;
  if (body.title) updates.title = body.title;
  if (body.platform) updates.platform = body.platform;
  if (body.persona) updates.persona = body.persona;
  if (body.campaign) updates.campaign = body.campaign;
  if (body.assignee) updates.assignee = body.assignee;
  if (body.dueDate) updates.dueDate = body.dueDate;
  if (typeof body.aiProgress === "number") updates.aiProgress = body.aiProgress;
  if (typeof body.brandScore === "number") updates.brandScore = body.brandScore;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucune modification fournie." }, { status: 400 });
  }

  const updated = db
    .update(kanbanCards)
    .set(updates)
    .where(eq(kanbanCards.id, cardId))
    .returning()
    .all();

  if (updated.length === 0) {
    return NextResponse.json({ error: "Carte introuvable." }, { status: 404 });
  }

  return NextResponse.json({ card: updated[0] });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const cardId = Number(id);
  if (!Number.isFinite(cardId)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  db.delete(kanbanCards).where(eq(kanbanCards.id, cardId)).run();
  return NextResponse.json({ ok: true });
}
