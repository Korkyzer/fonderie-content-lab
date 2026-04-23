import { NextResponse } from "next/server";

import {
  buildPdf,
  getExportFilename,
  resolveExportDocument,
  type ExportContentInput,
} from "@/lib/export-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ExportContentInput | null;
  if (!body) {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const document = resolveExportDocument(body);
  if (!document) {
    return NextResponse.json(
      { error: "Le contenu exporté est introuvable ou incomplet." },
      { status: 404 },
    );
  }

  const pdf = buildPdf(document);
  return new Response(pdf, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${getExportFilename(document.title, "pdf")}"`,
    },
  });
}
