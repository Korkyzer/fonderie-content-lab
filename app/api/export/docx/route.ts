import { NextResponse } from "next/server";

import {
  buildDocx,
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

  const docx = await buildDocx(document);
  return new Response(new Uint8Array(docx), {
    status: 200,
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "content-disposition": `attachment; filename="${getExportFilename(document.title, "docx")}"`,
    },
  });
}
