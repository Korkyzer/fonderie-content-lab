import { eq } from "drizzle-orm";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { jsPDF } from "jspdf";

import { db } from "@/db/index";
import {
  calendarEvents,
  contentItems,
  kanbanCards,
} from "@/db/schema";
import { listPrompts } from "@/lib/data/prompts";
import { slugify } from "@/lib/data/prompts";

type ExportMetadataValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type ExportContentInput = {
  contentId?: number;
  title?: string;
  content?: string;
  author?: string;
  platform?: string;
  persona?: string;
  createdAt?: string;
  brandScore?: number | null;
  violations?: string[];
  metadata?: Record<string, ExportMetadataValue>;
};

export type ExportScope = "calendar" | "prompts" | "kanban";

type ExportDocument = {
  title: string;
  content: string;
  brandScore: number | null;
  violations: string[];
  metadata: Array<{ label: string; value: string }>;
};

const PDF_COLORS = {
  ink: "#171717",
  cream: "#f7f3eb",
  purple: "#b09cff",
  sky: "#c9ecff",
  green: "#7ddc98",
  border: "#d9d1c4",
};

function trimText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formatValue(value: ExportMetadataValue) {
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  return trimText(value) || "Non renseigné";
}

function formatDate(value: string | undefined) {
  const text = trimText(value);
  if (!text) return "Non renseignée";
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(parsed);
}

function buildMetadata(input: ExportContentInput) {
  const metadata: ExportDocument["metadata"] = [];

  if (input.createdAt) {
    metadata.push({ label: "Date", value: formatDate(input.createdAt) });
  }
  if (input.author) {
    metadata.push({ label: "Auteur", value: input.author });
  }
  if (input.platform) {
    metadata.push({ label: "Plateforme", value: input.platform });
  }
  if (input.persona) {
    metadata.push({ label: "Persona", value: input.persona });
  }

  for (const [label, rawValue] of Object.entries(input.metadata ?? {})) {
    metadata.push({
      label,
      value: formatValue(rawValue),
    });
  }

  return metadata;
}

function contentItemToExport(item: typeof contentItems.$inferSelect): ExportDocument {
  return {
    title: item.title,
    content: [
      `Contenu ${item.format} pour ${item.platform}.`,
      `Campagne: ${item.campaign}.`,
      `Statut: ${item.status}.`,
      `Piloté par ${item.owner}.`,
    ].join("\n\n"),
    brandScore: item.brandScore ?? null,
    violations: [],
    metadata: [
      { label: "Date", value: formatDate(item.publishedAt ?? item.dueDate) },
      { label: "Auteur", value: item.owner },
      { label: "Plateforme", value: item.platform },
      { label: "Persona", value: item.persona },
      { label: "Campagne", value: item.campaign },
      { label: "Format", value: item.format },
      { label: "Statut", value: item.status },
      {
        label: "Score IA",
        value: item.aiScore == null ? "Non renseigné" : `${item.aiScore}/100`,
      },
    ],
  };
}

export function resolveExportDocument(input: ExportContentInput): ExportDocument | null {
  if (typeof input.contentId === "number") {
    const item = db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, input.contentId))
      .get();
    return item ? contentItemToExport(item) : null;
  }

  const title = trimText(input.title);
  const content = trimText(input.content);
  if (!title || !content) return null;

  return {
    title,
    content,
    brandScore: typeof input.brandScore === "number" ? input.brandScore : null,
    violations: Array.isArray(input.violations)
      ? input.violations.map((value) => trimText(value)).filter(Boolean)
      : [],
    metadata: buildMetadata(input),
  };
}

function safeFilename(base: string, extension: string) {
  const normalized = slugify(base) || "export";
  return `${normalized}.${extension}`;
}

export function getExportFilename(base: string, extension: string) {
  return safeFilename(base, extension);
}

export function buildPdf(document: ExportDocument) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let cursorY = 56;

  const addPage = () => {
    pdf.addPage();
    cursorY = 56;
  };

  const ensureSpace = (height: number) => {
    if (cursorY + height <= pageHeight - 56) return;
    addPage();
  };

  pdf.setFillColor(PDF_COLORS.ink);
  pdf.rect(0, 0, pageWidth, 122, "F");
  pdf.setTextColor(PDF_COLORS.cream);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("EXPORT CFI", margin, 34);
  pdf.setFontSize(28);
  pdf.text(document.title, margin, 76, { maxWidth });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Document éditable généré par Fonderie Content Lab", margin, 102);

  cursorY = 150;

  if (document.metadata.length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(PDF_COLORS.ink);
    pdf.setFontSize(11);
    pdf.text("MÉTADONNÉES", margin, cursorY);
    cursorY += 18;

    const cardHeight = 22 + document.metadata.length * 18;
    ensureSpace(cardHeight);
    pdf.setDrawColor(PDF_COLORS.border);
    pdf.setFillColor(PDF_COLORS.cream);
    pdf.roundedRect(margin, cursorY, maxWidth, cardHeight, 8, 8, "FD");
    cursorY += 20;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    for (const item of document.metadata) {
      pdf.setFont("helvetica", "bold");
      pdf.text(`${item.label}:`, margin + 16, cursorY);
      pdf.setFont("helvetica", "normal");
      pdf.text(item.value, margin + 110, cursorY, { maxWidth: maxWidth - 126 });
      cursorY += 18;
    }
    cursorY += 18;
  }

  if (document.brandScore != null) {
    ensureSpace(88);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("SCORE BRAND", margin, cursorY);
    cursorY += 18;
    pdf.setFillColor(PDF_COLORS.sky);
    pdf.roundedRect(margin, cursorY, maxWidth, 46, 8, 8, "F");
    pdf.setFontSize(20);
    pdf.setTextColor(PDF_COLORS.ink);
    pdf.text(`${document.brandScore}/100`, margin + 18, cursorY + 29);
    cursorY += 64;
  }

  if (document.violations.length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("POINTS À CORRIGER", margin, cursorY);
    cursorY += 18;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    for (const violation of document.violations) {
      const lines = pdf.splitTextToSize(`• ${violation}`, maxWidth - 16);
      ensureSpace(lines.length * 14 + 8);
      pdf.text(lines, margin + 8, cursorY);
      cursorY += lines.length * 14 + 6;
    }
    cursorY += 14;
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("CONTENU", margin, cursorY);
  cursorY += 18;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  const paragraphs = document.content.split(/\n{2,}/);
  for (const paragraph of paragraphs) {
    const lines = pdf.splitTextToSize(paragraph, maxWidth);
    ensureSpace(lines.length * 16 + 8);
    pdf.text(lines, margin, cursorY);
    cursorY += lines.length * 16 + 10;
  }

  return pdf.output("arraybuffer");
}

export async function buildDocx(document: ExportDocument) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: document.title,
                bold: true,
                size: 34,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 220 },
            border: {
              left: {
                style: BorderStyle.SINGLE,
                color: "B09CFF",
                size: 8,
              },
            },
            children: [
              new TextRun({
                text: "Document éditable CFI",
                bold: true,
                size: 22,
                color: "171717",
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 120 },
            children: [new TextRun({ text: "Métadonnées", bold: true })],
          }),
          ...document.metadata.map(
            (item) =>
              new Paragraph({
                spacing: { after: 70 },
                children: [
                  new TextRun({ text: `${item.label}: `, bold: true }),
                  new TextRun(item.value),
                ],
              }),
          ),
          ...(document.brandScore != null
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 180, after: 120 },
                  children: [new TextRun({ text: "Score brand", bold: true })],
                }),
                new Paragraph({
                  spacing: { after: 120 },
                  children: [
                    new TextRun({
                      text: `${document.brandScore}/100`,
                      bold: true,
                    }),
                  ],
                }),
              ]
            : []),
          ...(document.violations.length > 0
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 180, after: 120 },
                  children: [new TextRun({ text: "Violations", bold: true })],
                }),
                ...document.violations.map(
                  (violation) =>
                    new Paragraph({
                      bullet: { level: 0 },
                      spacing: { after: 80 },
                      children: [new TextRun(violation)],
                    }),
                ),
              ]
            : []),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 180, after: 120 },
            children: [new TextRun({ text: "Contenu", bold: true })],
          }),
          ...document.content.split(/\n{2,}/).map(
            (paragraph) =>
              new Paragraph({
                spacing: { after: 140 },
                children: [new TextRun(paragraph)],
              }),
          ),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function serializeCsv(
  columns: string[],
  rows: Array<Record<string, unknown>>,
) {
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(",")),
  ].join("\n");
}

export function buildCsv(scope: ExportScope) {
  if (scope === "calendar") {
    const rows = db
      .select()
      .from(calendarEvents)
      .all()
      .map((event) => ({
        title: event.title,
        eventType: event.eventType,
        platform: event.platform,
        campaign: event.campaign,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location ?? "",
        aiSuggestion: event.aiSuggestion ?? "",
      }));

    return {
      filename: safeFilename("calendrier-editorial", "csv"),
      content: serializeCsv(
        [
          "title",
          "eventType",
          "platform",
          "campaign",
          "startDate",
          "endDate",
          "location",
          "aiSuggestion",
        ],
        rows,
      ),
    };
  }

  if (scope === "kanban") {
    const rows = db
      .select()
      .from(kanbanCards)
      .all()
      .map((card) => ({
        title: card.title,
        columnId: card.columnId,
        platform: card.platform,
        persona: card.persona,
        campaign: card.campaign,
        assignee: card.assignee,
        dueDate: card.dueDate,
        aiProgress: card.aiProgress ?? "",
        brandScore: card.brandScore ?? "",
      }));

    return {
      filename: safeFilename("kanban-contenus", "csv"),
      content: serializeCsv(
        [
          "title",
          "columnId",
          "platform",
          "persona",
          "campaign",
          "assignee",
          "dueDate",
          "aiProgress",
          "brandScore",
        ],
        rows,
      ),
    };
  }

  const rows = listPrompts().map((prompt) => ({
    title: prompt.title,
    slug: prompt.slug,
    category: prompt.category,
    audience: prompt.audience,
    platform: prompt.platform,
    tone: prompt.tone,
    rating: prompt.rating,
    monthlyUsage: prompt.monthlyUsage,
    variables: prompt.variables,
    author: prompt.author,
    favorite: prompt.favorite,
    createdAt: prompt.createdAt,
    updatedAt: prompt.updatedAt,
  }));

  return {
    filename: safeFilename("bibliotheque-prompts", "csv"),
    content: serializeCsv(
      [
        "title",
        "slug",
        "category",
        "audience",
        "platform",
        "tone",
        "rating",
        "monthlyUsage",
        "variables",
        "author",
        "favorite",
        "createdAt",
        "updatedAt",
      ],
      rows,
    ),
  };
}
