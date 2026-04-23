import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db/index";
import { kanbanTransitions } from "@/db/schema";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const cardId = Number(id);
  if (!Number.isFinite(cardId)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  const transitions = db
    .select()
    .from(kanbanTransitions)
    .where(eq(kanbanTransitions.cardId, cardId))
    .orderBy(asc(kanbanTransitions.createdAt))
    .all();

  return NextResponse.json({ transitions });
}
