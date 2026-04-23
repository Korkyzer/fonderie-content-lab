"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Tag } from "@/components/ui/tag";
import type { SeoSuggestion } from "@/lib/seo";

type SeoAssistantProps = {
  visible: boolean;
  contentType: string;
  title: string;
  content: string;
};

export function SeoAssistant({
  visible,
  contentType,
  title,
  content,
}: SeoAssistantProps) {
  const [data, setData] = useState<SeoSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  async function runAnalysis() {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/seo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contentType, title, content }),
      });
      const json = (await response.json()) as SeoSuggestion | { error?: string };
      if (!response.ok) {
        throw new Error("error" in json ? json.error : "Analyse SEO indisponible");
      }
      if (requestIdRef.current === requestId) {
        setData(json as SeoSuggestion);
      }
    } catch (issue) {
      if (requestIdRef.current === requestId) {
        setError(issue instanceof Error ? issue.message : "Analyse SEO indisponible");
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (visible) {
      const timer = window.setTimeout(() => {
        void runAnalysis();
      }, 0);
      return () => window.clearTimeout(timer);
    }
    // title and content are intentional SEO inputs.
  }, [visible, title, content]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) {
    return (
      <Panel className="flex min-h-[320px] items-center justify-center text-center">
        <div className="max-w-xs space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
            Assistant SEO
          </p>
          <h2 className="text-b2 font-display uppercase leading-tight">
            Disponible sur articles et pages web
          </h2>
          <p className="text-[13px] leading-relaxed text-ink/72">
            Sélectionnez un type de contenu indexable pour obtenir mots-clés, maillage et
            structure de titres.
          </p>
        </div>
      </Panel>
    );
  }

  return (
    <Panel className="sticky top-6 h-fit space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
            Assistant SEO
          </p>
          <h2 className="mt-1 text-b2 font-display uppercase leading-tight">
            Optimisation indexation
          </h2>
        </div>
        <Button
          variant="light"
          size="sm"
          onClick={() => void runAnalysis()}
          disabled={loading}
        >
          {loading ? "Analyse..." : "Relancer"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-sm border border-red/30 bg-red/10 p-3 text-[12px] font-medium text-red">
          {error}
        </div>
      ) : null}

      {!data ? (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-sm bg-ink/6" />
          <div className="h-28 animate-pulse rounded-sm bg-ink/6" />
          <div className="h-24 animate-pulse rounded-sm bg-ink/6" />
        </div>
      ) : (
        <div className="space-y-4">
          <section className="rounded-sm border border-ink/10 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                  Score estimé
                </p>
                <p className="mt-2 text-[32px] font-bold leading-none">
                  {data.score}
                  <span className="text-[18px] text-ink/60">/100</span>
                </p>
              </div>
              <Tag tone="outline">{data.provider}</Tag>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink/72">{data.notes}</p>
          </section>

          <section className="rounded-sm border border-ink/10 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
              Mots-clés suggérés
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.keywords.map((keyword) => (
                <Tag key={keyword} tone="lila">
                  {keyword}
                </Tag>
              ))}
            </div>
          </section>

          <section className="rounded-sm border border-ink/10 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
              Meta description
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink/72">
              {data.metaDescription}
            </p>
          </section>

          <section className="rounded-sm border border-ink/10 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
              Structure recommandée
            </p>
            <dl className="mt-3 space-y-2 text-[13px] leading-relaxed text-ink/78">
              <div className="flex gap-2">
                <dt className="min-w-[24px] font-bold uppercase text-ink">H1</dt>
                <dd>{data.headings.h1}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="min-w-[24px] font-bold uppercase text-ink">H2</dt>
                <dd>{data.headings.h2.join(" · ")}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="min-w-[24px] font-bold uppercase text-ink">H3</dt>
                <dd>{data.headings.h3.join(" · ")}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-sm border border-ink/10 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
              Maillage interne CFI
            </p>
            <div className="mt-3 space-y-2">
              {data.internalLinks.map((link) => (
                <div
                  key={link.url}
                  className="rounded-sm border border-ink/8 bg-cream p-3"
                >
                  <div className="text-[13px] font-bold uppercase tracking-[0.02em]">
                    {link.title}
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-ink/55">
                    {link.url}
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-ink/72">
                    {link.reason}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </Panel>
  );
}
