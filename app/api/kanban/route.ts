import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";

import { db } from "@/db/index";
import { kanbanCards } from "@/db/schema";

export const dynamic = "force-dynamic";

const VALID_COLUMN_IDS = new Set([
  "ideas",
  "brief",
  "production",
  "review",
  "validated",
  "published",
]);

export async function GET() {
  const cards = db
    .select()
    .from(kanbanCards)
    .orderBy(asc(kanbanCards.columnId), asc(kanbanCards.id))
    .all();
  return NextResponse.json({ cards });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{
    title: string;
    platform: string;
    persona: string;
    campaign: string;
    assignee: string;
    dueDate: string;
    columnId: string;
  }>;

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

  const inserted = db
    .insert(kanbanCards)
    .values({
      title,
      platform: body.platform?.trim() || "Instagram",
      persona: body.persona?.trim() || "Lycéens 16-20",
      campaign: body.campaign?.trim() || "JPO Mai 2026",
      assignee: body.assignee?.trim() || "Laure Reymond",
      dueDate: body.dueDate || new Date().toISOString(),
      columnId,
      aiProgress: 0,
    })
    .returning()
    .all();

  return NextResponse.json({ card: inserted[0] }, { status: 201 });
}
