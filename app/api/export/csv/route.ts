import { NextResponse } from "next/server";

import { buildCsv, type ExportScope } from "@/lib/export-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { scope?: ExportScope } | null;
  const scope = body?.scope;

  if (scope !== "calendar" && scope !== "prompts" && scope !== "kanban") {
    return NextResponse.json(
      { error: "Le scope d'export CSV est invalide." },
      { status: 400 },
    );
  }

  const csv = buildCsv(scope);
  return new Response(csv.content, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${csv.filename}"`,
    },
  });
}
