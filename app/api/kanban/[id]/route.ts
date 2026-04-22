import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { kanbanCards, kanbanTransitions } from "@/db/schema";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const VALID_COLUMN_IDS = new Set([
  "ideas",
  "brief",
  "production",
  "review",
  "validated",
  "published",
]);

const VALID_PRIORITIES = new Set(["urgent", "normal", "can_wait"]);

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
    priority: string;
    reviewerId: string | null;
    deadline: string | null;
    transitionUser: string;
  }>;

  const existing = db
    .select()
    .from(kanbanCards)
    .where(eq(kanbanCards.id, cardId))
    .all();
  if (existing.length === 0) {
    return NextResponse.json({ error: "Carte introuvable." }, { status: 404 });
  }
  const previous = existing[0];

  const updates: Record<string, unknown> = {};
  if (body.columnId) {
    if (!VALID_COLUMN_IDS.has(body.columnId)) {
      return NextResponse.json({ error: "Colonne invalide." }, { status: 400 });
    }
    updates.columnId = body.columnId;
  }
  if (body.priority) {
    if (!VALID_PRIORITIES.has(body.priority)) {
      return NextResponse.json({ error: "Priorité invalide." }, { status: 400 });
    }
    updates.priority = body.priority;
  }
  if (body.title) updates.title = body.title;
  if (body.platform) updates.platform = body.platform;
  if (body.persona) updates.persona = body.persona;
  if (body.campaign) updates.campaign = body.campaign;
  if (body.assignee) updates.assignee = body.assignee;
  if (body.dueDate) updates.dueDate = body.dueDate;
  if (typeof body.aiProgress === "number") updates.aiProgress = body.aiProgress;
  if (typeof body.brandScore === "number") updates.brandScore = body.brandScore;
  if (body.reviewerId !== undefined) updates.reviewerId = body.reviewerId;
  if (body.deadline !== undefined) updates.deadline = body.deadline;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucune modification fournie." }, { status: 400 });
  }

  const updated = db
    .update(kanbanCards)
    .set(updates)
    .where(eq(kanbanCards.id, cardId))
    .returning()
    .all();

  if (
    updates.columnId &&
    typeof updates.columnId === "string" &&
    updates.columnId !== previous.columnId
  ) {
    db.insert(kanbanTransitions)
      .values({
        cardId,
        fromStatus: previous.columnId,
        toStatus: updates.columnId,
        user: body.transitionUser?.trim() || previous.assignee,
        createdAt: new Date().toISOString(),
      })
      .run();
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
