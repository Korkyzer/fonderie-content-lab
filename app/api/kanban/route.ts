import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";

import { db } from "@/db/index";
import { kanbanCards, kanbanTransitions } from "@/db/schema";
import { requirePermission } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const VALID_COLUMN_IDS = new Set([
  "ideas",
  "brief",
  "production",
  "review",
  "validated",
  "published",
]);

const VALID_PRIORITIES = new Set(["urgent", "normal", "can_wait"]);

export async function GET() {
  const cards = db
    .select()
    .from(kanbanCards)
    .orderBy(asc(kanbanCards.columnId), asc(kanbanCards.id))
    .all();
  return NextResponse.json({ cards });
}

export async function POST(request: Request) {
  const access = await requirePermission("content.write");
  if (access.error) return access.error;

  let body: Partial<{
    title: string;
    platform: string;
    persona: string;
    campaign: string;
    assignee: string;
    dueDate: string;
    columnId: string;
    priority: string;
    reviewerId: string | null;
    deadline: string | null;
  }>;

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json(
      { error: "Le titre est obligatoire." },
      { status: 400 },
    );
  }

  const columnId = body.columnId?.trim() || "ideas";
  if (!VALID_COLUMN_IDS.has(columnId)) {
    return NextResponse.json(
      { error: "Colonne invalide." },
      { status: 400 },
    );
  }

  const priority = body.priority?.trim() || "normal";
  if (!VALID_PRIORITIES.has(priority)) {
    return NextResponse.json(
      { error: "Priorité invalide." },
      { status: 400 },
    );
  }

  const assignee = body.assignee?.trim() || "Laure Reymond";
  const now = new Date().toISOString();

  const inserted = db
    .insert(kanbanCards)
    .values({
      title,
      platform: body.platform?.trim() || "Instagram",
      persona: body.persona?.trim() || "Lycéens 16-20",
      campaign: body.campaign?.trim() || "JPO Mai 2026",
      assignee,
      dueDate: body.dueDate || now,
      columnId,
      aiProgress: 0,
      priority,
      reviewerId: body.reviewerId ?? null,
      deadline: body.deadline ?? null,
    })
    .returning()
    .all();

  const card = inserted[0];
  if (card) {
    db.insert(kanbanTransitions)
      .values({
        cardId: card.id,
        fromStatus: null,
        toStatus: columnId,
        user: assignee,
        createdAt: now,
      })
      .run();
  }

  return NextResponse.json({ card }, { status: 201 });
}
