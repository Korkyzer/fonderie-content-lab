"use client";

import { useEffect, useRef, useState } from "react";
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
      <aside className="panel flex min-h-[320px] items-center justify-center p-6 text-center">
        <div>
          <p className="eyebrow mb-2">Assistant SEO</p>
          <h2 className="font-heading text-3xl">Disponible sur les articles et pages web</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Sélectionnez un type de contenu indexable pour obtenir mots-clés, maillage et
            structure de titres.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="panel sticky top-6 h-fit p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Assistant SEO</p>
          <h2 className="font-heading text-3xl">Panel latéral d’optimisation</h2>
        </div>
        <button type="button" className="button-secondary" onClick={() => void runAnalysis()}>
          {loading ? "Analyse..." : "Relancer"}
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-[22px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!data ? (
        <div className="mt-8 space-y-3">
          <div className="h-18 animate-pulse rounded-[20px] bg-slate-900/6" />
          <div className="h-32 animate-pulse rounded-[20px] bg-slate-900/6" />
          <div className="h-24 animate-pulse rounded-[20px] bg-slate-900/6" />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <section className="newsletter-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Score estimé</p>
                <h3 className="mt-2 text-4xl font-semibold">{data.score}/100</h3>
              </div>
              <span className="pill">{data.provider}</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-700">{data.notes}</p>
          </section>

          <section className="newsletter-card p-4">
            <p className="text-sm font-semibold">Mots-clés suggérés</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.keywords.map((keyword) => (
                <span key={keyword} className="pill">
                  {keyword}
                </span>
              ))}
            </div>
          </section>

          <section className="newsletter-card p-4">
            <p className="text-sm font-semibold">Meta description</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{data.metaDescription}</p>
          </section>

          <section className="newsletter-card p-4">
            <p className="text-sm font-semibold">Structure recommandée</p>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
              <div>
                <strong>H1</strong>: {data.headings.h1}
              </div>
              <div>
                <strong>H2</strong>: {data.headings.h2.join(" · ")}
              </div>
              <div>
                <strong>H3</strong>: {data.headings.h3.join(" · ")}
              </div>
            </div>
          </section>

          <section className="newsletter-card p-4">
            <p className="text-sm font-semibold">Maillage interne CFI</p>
            <div className="mt-3 space-y-3">
              {data.internalLinks.map((link) => (
                <div key={link.url} className="rounded-2xl bg-slate-950/3 p-3">
                  <div className="text-sm font-semibold">{link.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{link.url}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{link.reason}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}
