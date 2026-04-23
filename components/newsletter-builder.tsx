"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import { Textarea } from "@/components/ui/textarea";
import {
  NEWSLETTER_SNIPPETS,
  NEWSLETTER_TEMPLATES,
  buildNewsletterHtml,
  createTemplatePayload,
  type NewsletterDraftPayload,
  type NewsletterSection,
  type StoredNewsletterDraft,
} from "@/lib/newsletter";

type NewsletterBuilderProps = {
  initialDrafts: StoredNewsletterDraft[];
};

export function NewsletterBuilder({ initialDrafts }: NewsletterBuilderProps) {
  const [templateKey, setTemplateKey] = useState<string>(NEWSLETTER_TEMPLATES[0].key);
  const [payload, setPayload] = useState<NewsletterDraftPayload>(
    () => createTemplatePayload(NEWSLETTER_TEMPLATES[0].key),
  );
  const [drafts, setDrafts] = useState(initialDrafts);
  const [draftId, setDraftId] = useState<string | undefined>(undefined);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  const html = useMemo(() => buildNewsletterHtml(payload), [payload]);

  function patchSection(sectionId: string, patch: Partial<NewsletterSection>) {
    setPayload((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section,
      ),
    }));
  }

  function addSection() {
    setPayload((current) => ({
      ...current,
      sections: [
        ...current.sections,
        {
          id: crypto.randomUUID(),
          eyebrow: "Nouveau module",
          title: "Titre de section",
          body: "Ajoutez ici un contenu prêt à envoyer, rédigé pour une newsletter CFI.",
          highlight: "Chiffre, citation ou point-clé.",
        },
      ],
    }));
  }

  function removeSection(sectionId: string) {
    setPayload((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== sectionId),
    }));
  }

  function applyTemplate(nextKey: string) {
    setTemplateKey(nextKey);
    setPayload(createTemplatePayload(nextKey));
    setDraftId(undefined);
    setSaveState("idle");
    setSaveMessage("");
  }

  function injectSnippet(title: string, body: string) {
    setPayload((current) => ({
      ...current,
      sections: [
        {
          id: crypto.randomUUID(),
          eyebrow: "Source générateur",
          title,
          body,
          highlight: "Pré-rempli depuis les prompts éditoriaux du studio.",
        },
        ...current.sections,
      ],
    }));
  }

  async function handleSave() {
    try {
      setSaveState("saving");
      setSaveMessage("");
      const response = await fetch("/api/newsletter-drafts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: draftId,
          title: payload.header.title,
          templateKey,
          payload,
        }),
      });
      const json = (await response.json()) as
        | { draft: StoredNewsletterDraft }
        | { error?: string };
      if (!response.ok || !("draft" in json)) {
        throw new Error("error" in json ? json.error : "Sauvegarde impossible");
      }

      setDraftId(json.draft.id);
      setDrafts((current) => {
        const next = [json.draft, ...current.filter((draft) => draft.id !== json.draft.id)];
        return next.slice(0, 12);
      });
      setSaveState("saved");
      setSaveMessage(
        `Brouillon enregistré le ${new Date(json.draft.updatedAt).toLocaleString("fr-FR")}`,
      );
    } catch (issue) {
      setSaveState("error");
      setSaveMessage(issue instanceof Error ? issue.message : "Sauvegarde impossible");
    }
  }

  function exportHtml() {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${payload.header.title.toLowerCase().replaceAll(/\s+/g, "-")}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Newsletter builder"
        title="Assembler, prévisualiser et exporter les newsletters CFI"
        description="Les brouillons sont enregistrés côté serveur, réinjectables dans l'éditeur et prévisualisés sur un rendu desktop et mobile avant export HTML."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.95fr)]">
        <section className="space-y-5">
          <Panel className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Tag tone="caramel">Templates CFI</Tag>
                <Tag tone="outline">Desktop + mobile</Tag>
                <Tag tone={saveState === "saved" ? "green" : "outline"}>Export HTML</Tag>
              </div>
              <Button
                variant="light"
                size="sm"
                onClick={addSection}
                icon={<Icon name="plus" size={12} />}
              >
                Ajouter une section
              </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <div className="space-y-5">
                <Panel className="space-y-3 bg-white/72">
                  <p className="text-sm font-semibold">Templates CFI</p>
                  {NEWSLETTER_TEMPLATES.map((template) => (
                    <button
                      key={template.key}
                      type="button"
                      onClick={() => applyTemplate(template.key)}
                      className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                        templateKey === template.key
                          ? "border-[rgba(13,106,109,0.28)] bg-[rgba(13,106,109,0.08)]"
                          : "border-black/8 bg-white/70 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="text-sm font-semibold">{template.name}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-700">
                        {template.description}
                      </div>
                    </button>
                  ))}
                </Panel>

                <Panel className="space-y-3 bg-white/72">
                  <p className="text-sm font-semibold">
                    Pré-remplissage depuis les contenus existants
                  </p>
                  {NEWSLETTER_SNIPPETS.map((snippet) => (
                    <button
                      key={snippet.title}
                      type="button"
                      className="w-full rounded-[22px] border border-black/8 bg-slate-950/2 px-4 py-3 text-left hover:bg-slate-950/4"
                      onClick={() => injectSnippet(snippet.title, snippet.body)}
                    >
                      <div className="text-sm font-semibold">{snippet.title}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-700">
                        {snippet.body}
                      </div>
                    </button>
                  ))}
                </Panel>

                <Panel className="space-y-3 bg-white/72">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">Brouillons enregistrés</p>
                    <Tag tone="outline">{drafts.length}</Tag>
                  </div>
                  {drafts.length === 0 ? (
                    <p className="text-sm text-slate-600">
                      Aucun brouillon enregistré pour le moment.
                    </p>
                  ) : (
                    drafts.map((draft) => (
                      <button
                        key={draft.id}
                        type="button"
                        className="w-full rounded-[22px] border border-black/8 bg-white/70 px-4 py-3 text-left hover:bg-white"
                        onClick={() => {
                          setDraftId(draft.id);
                          setTemplateKey(draft.templateKey);
                          setPayload(draft.payload);
                          setSaveState("idle");
                          setSaveMessage("");
                        }}
                      >
                        <div className="text-sm font-semibold">{draft.title}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-500">
                          {new Date(draft.updatedAt).toLocaleString("fr-FR")}
                        </div>
                      </button>
                    ))
                  )}
                </Panel>
              </div>

              <div className="space-y-5">
                <Panel className="space-y-4 bg-white/72">
                  <p className="text-sm font-semibold">En-tête</p>
                  <Input
                    label="Eyebrow"
                    value={payload.header.eyebrow}
                    onChange={(event) =>
                      setPayload((current) => ({
                        ...current,
                        header: { ...current.header, eyebrow: event.target.value },
                      }))
                    }
                    placeholder="Admissions CFI"
                  />
                  <Input
                    label="Titre"
                    value={payload.header.title}
                    onChange={(event) =>
                      setPayload((current) => ({
                        ...current,
                        header: { ...current.header, title: event.target.value },
                      }))
                    }
                    placeholder="Titre principal"
                  />
                  <Textarea
                    label="Introduction"
                    value={payload.header.intro}
                    onChange={(event) =>
                      setPayload((current) => ({
                        ...current,
                        header: { ...current.header, intro: event.target.value },
                      }))
                    }
                    placeholder="Introduction"
                  />
                </Panel>

                <Panel className="space-y-4 bg-white/72">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold">Sections éditables</p>
                    <Tag tone="outline">{payload.sections.length} modules</Tag>
                  </div>
                  <div className="space-y-4">
                    {payload.sections.map((section) => (
                      <div
                        key={section.id}
                        className="rounded-[22px] border border-black/8 bg-white/70 p-4"
                      >
                        <div className="grid gap-3">
                          <Input
                            label="Sur-titre"
                            value={section.eyebrow}
                            onChange={(event) =>
                              patchSection(section.id, { eyebrow: event.target.value })
                            }
                            placeholder="Sur-titre"
                          />
                          <Input
                            label="Titre de section"
                            value={section.title}
                            onChange={(event) =>
                              patchSection(section.id, { title: event.target.value })
                            }
                            placeholder="Titre de section"
                          />
                          <Textarea
                            label="Contenu"
                            value={section.body}
                            onChange={(event) =>
                              patchSection(section.id, { body: event.target.value })
                            }
                            placeholder="Contenu"
                          />
                          <Input
                            label="Encadré / preuve"
                            value={section.highlight}
                            onChange={(event) =>
                              patchSection(section.id, { highlight: event.target.value })
                            }
                            placeholder="Encadré / preuve"
                          />
                          <Button
                            variant="light"
                            onClick={() => removeSection(section.id)}
                          >
                            Supprimer la section
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <div className="grid gap-5 md:grid-cols-2">
                  <Panel className="space-y-3 bg-white/72">
                    <p className="text-sm font-semibold">Call-to-action</p>
                    <Input
                      label="Label CTA"
                      value={payload.cta.label}
                      onChange={(event) =>
                        setPayload((current) => ({
                          ...current,
                          cta: { ...current.cta, label: event.target.value },
                        }))
                      }
                    />
                    <Input
                      label="URL CTA"
                      value={payload.cta.url}
                      onChange={(event) =>
                        setPayload((current) => ({
                          ...current,
                          cta: { ...current.cta, url: event.target.value },
                        }))
                      }
                    />
                  </Panel>

                  <Panel className="space-y-3 bg-white/72">
                    <p className="text-sm font-semibold">Footer</p>
                    <Textarea
                      label="Note"
                      value={payload.footer.note}
                      onChange={(event) =>
                        setPayload((current) => ({
                          ...current,
                          footer: { ...current.footer, note: event.target.value },
                        }))
                      }
                    />
                    <Input
                      label="Signature"
                      value={payload.footer.signature}
                      onChange={(event) =>
                        setPayload((current) => ({
                          ...current,
                          footer: { ...current.footer, signature: event.target.value },
                        }))
                      }
                    />
                  </Panel>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => void handleSave()}
                    disabled={saveState === "saving"}
                    icon={<Icon name="sparkle" size={12} />}
                  >
                    {saveState === "saving" ? "Sauvegarde..." : "Sauvegarder en DB"}
                  </Button>
                  <Button variant="light" onClick={exportHtml}>
                    Exporter en HTML
                  </Button>
                  <span aria-live="polite" className="pill">
                    {saveMessage || "Le brouillon est prêt pour Brevo ou Mailchimp."}
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </section>

        <section className="space-y-5">
          <Panel className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">Prévisualisation responsive</p>
                <h2 className="font-heading text-3xl">Desktop + mobile</h2>
              </div>
              <Tag tone="outline">HTML synchronisé</Tag>
            </div>

            <article className="preview-paper p-4">
              <div className="mb-4 flex items-center justify-between">
                <Tag tone="outline">Desktop</Tag>
                <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  1280 px
                </span>
              </div>
              <PreviewNewsletter payload={payload} desktop />
            </article>

            <article className="preview-paper mx-auto w-[340px] max-w-full p-3">
              <div className="mb-4 flex items-center justify-between">
                <Tag tone="outline">Mobile</Tag>
                <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  390 px
                </span>
              </div>
              <PreviewNewsletter payload={payload} desktop={false} />
            </article>
          </Panel>
        </section>
      </div>
    </div>
  );
}

function PreviewNewsletter({
  payload,
  desktop,
}: {
  payload: NewsletterDraftPayload;
  desktop: boolean;
}) {
  return (
    <div
      className={`mx-auto overflow-hidden rounded-[26px] bg-white shadow-[0_24px_80px_rgba(17,32,49,0.12)] ${
        desktop ? "max-w-[720px]" : "max-w-[316px]"
      }`}
    >
      <div className="bg-[linear-gradient(140deg,#112031,#0d6a6d)] px-6 py-8 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-white/70">
          {payload.header.eyebrow}
        </p>
        <h3 className="mt-3 font-heading text-3xl leading-tight">{payload.header.title}</h3>
        <p className="mt-4 text-sm leading-7 text-white/80">{payload.header.intro}</p>
      </div>

      <div className="space-y-4 px-5 py-5">
        {payload.sections.map((section) => (
          <section key={section.id} className="rounded-[22px] bg-[#f7f2ea] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              {section.eyebrow}
            </p>
            <h4 className="mt-2 font-heading text-2xl leading-tight text-slate-900">
              {section.title}
            </h4>
            <p className="mt-3 text-sm leading-7 text-slate-700">{section.body}</p>
            <div className="mt-4 rounded-[18px] bg-white px-4 py-3 text-sm font-medium text-[var(--brand-ink)]">
              {section.highlight}
            </div>
          </section>
        ))}
      </div>

      <div className="px-5 pb-6">
        <a
          href={payload.cta.url}
          className="block rounded-[999px] bg-[var(--brand)] px-5 py-4 text-center text-sm font-semibold text-white"
        >
          {payload.cta.label}
        </a>
        <div className="mt-5 rounded-[22px] border border-black/8 bg-white px-4 py-4 text-sm leading-7 text-slate-600">
          <p>{payload.footer.note}</p>
          <p className="mt-2 font-medium text-slate-900">{payload.footer.signature}</p>
        </div>
      </div>
    </div>
  );
}
