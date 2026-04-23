import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/index";
import { competitiveAlerts } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const rows = db
    .select()
    .from(competitiveAlerts)
    .where(eq(competitiveAlerts.dismissed, false))
    .orderBy(desc(competitiveAlerts.createdAt))
    .all();
  return NextResponse.json({ alerts: rows });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { id?: number; action?: string };
  if (!body.id || body.action !== "dismiss") {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }
  db.update(competitiveAlerts)
    .set({ dismissed: true })
    .where(eq(competitiveAlerts.id, body.id))
    .run();
  return NextResponse.json({ ok: true });
}
