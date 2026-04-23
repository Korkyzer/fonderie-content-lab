import type { RequestyMessage } from "@/lib/requesty";

const CFI_BRAND_CONTEXT = `Tu es le Brand Guardian du Campus Fonderie de l'Image (CFI), école supérieure privée à Bagnolet (93).
Ton rôle: auditer la conformité brand d'un contenu éditorial (caption, post, email, script) avant publication.

Règles brand CFI à vérifier strictement:

1. PALETTE COULEURS (cite la couleur exacte fautive si détectée dans le texte, ex: #FFD914 off-brand):
   - Violet signature #AE64DE (accent primaire)
   - Bleu campus #80D3FF
   - Noir éditorial #1D1D1B
   - Blanc cassé #FAF7F1
   - Jaune officiel #FFED00 (tout autre jaune type #FFD914 est off-brand)

2. TYPOGRAPHIE: SVHFlib Bold obligatoire pour les titres. Toute autre mention de police est un warning.

3. TON DE VOIX:
   - Accessible, direct, chaleureux, humain.
   - Tutoiement recommandé pour les lycéens / étudiants.
   - Pas de jargon corporate excessif ("synergie", "leverage", "disruptif", "paradigme", "ROI" sans contexte péda).
   - Pas de buzzwords marketing creux.

4. VOCABULAIRE INTERDIT:
   - Aucune mention de "IA", "AI", "Claude", "GPT", "intelligence artificielle", "chatbot".
   - Pas d'em dash (—) ni en dash (–). Virgules, points ou parenthèses à la place.
   - Orthographe française correcte (é, è, à, ç, ù, ê préservés).

5. MISE EN AVANT ÉTUDIANTS:
   - Un contenu CFI doit idéalement mentionner des visuels étudiants, ateliers, projets, ou alumni.
   - Absence totale de référence étudiante = warning.

6. CONFORMITÉ ÉDUCATION:
   - Si l'école est évoquée dans un contexte de formation, idéalement mention Qualiopi, RNCP, ou financement possible.

7. FORMATIONS PHARES (reconnaître sans erreur):
   - BTS Design Graphique, Mastère DCDG, Motion Design, Sérigraphie, Direction Artistique.`;

const JSON_SCHEMA_DOC = `Rends STRICTEMENT un JSON valide (pas de markdown, pas de préambule, pas de texte après) avec cette forme exacte:
{
  "score": <entier 0-100>,
  "summary": "<string, 1 phrase, verdict global>",
  "violations": [
    {
      "rule": "<nom court de la règle enfreinte, ex: palette, ton, vocabulaire, typographie, etudiants, education>",
      "severity": "<error | warning | info>",
      "description": "<string, 1-2 phrases, ce qui ne va pas précisément, cite l'élément fautif>",
      "suggestion": "<string, 1 phrase, comment corriger>"
    }
  ]
}

Règles de scoring:
- Score 95-100: aucune violation, contenu prêt à publier.
- Score 85-94: 1 à 2 warnings ou infos, retouches mineures.
- Score 70-84: 1 error ou 3+ warnings, retravail nécessaire.
- Score < 70: multiples errors, contenu non conforme.

Severity:
- "error": violation bloquante (vocabulaire interdit, couleur off-brand explicite, jargon corporate majeur).
- "warning": point d'attention non bloquant (absence d'étudiants, ton trop froid).
- "info": suggestion d'amélioration (ajouter un hashtag, préciser la formation).

Retourne au maximum 6 violations, classées par sévérité décroissante.`;

export function buildBrandAnalysisMessages(
  content: string,
  format: string,
): RequestyMessage[] {
  const system = `${CFI_BRAND_CONTEXT}

${JSON_SCHEMA_DOC}`;

  const user = `Format cible: ${format}

Contenu à auditer:
"""
${content}
"""

Produis maintenant l'audit JSON strict.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

export type LLMViolation = {
  rule: string;
  severity: "error" | "warning" | "info";
  description: string;
  suggestion: string;
};

export type LLMBrandAnalysis = {
  score: number;
  summary: string;
  violations: LLMViolation[];
};

export function parseBrandAnalysisJSON(raw: string): LLMBrandAnalysis | null {
  const text = raw.trim();
  if (!text) return null;

  let jsonText = text;
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    jsonText = fenceMatch[1].trim();
  } else {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      jsonText = text.slice(start, end + 1);
    }
  }

  try {
    const parsed = JSON.parse(jsonText) as {
      score?: unknown;
      summary?: unknown;
      violations?: unknown;
    };
    const score = typeof parsed.score === "number" ? parsed.score : Number(parsed.score);
    if (!Number.isFinite(score)) return null;
    const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
    const summary = typeof parsed.summary === "string" ? parsed.summary : "";
    const rawViolations = Array.isArray(parsed.violations) ? parsed.violations : [];

    const violations: LLMViolation[] = rawViolations
      .map((v): LLMViolation | null => {
        if (!v || typeof v !== "object") return null;
        const item = v as Record<string, unknown>;
        const rule = typeof item.rule === "string" ? item.rule : "";
        const severityRaw = typeof item.severity === "string" ? item.severity.toLowerCase() : "";
        const severity: LLMViolation["severity"] =
          severityRaw === "error" || severityRaw === "warning" || severityRaw === "info"
            ? severityRaw
            : "warning";
        const description = typeof item.description === "string" ? item.description : "";
        const suggestion = typeof item.suggestion === "string" ? item.suggestion : "";
        if (!rule && !description) return null;
        return { rule, severity, description, suggestion };
      })
      .filter((v): v is LLMViolation => v !== null)
      .slice(0, 6);

    return { score: clampedScore, summary, violations };
  } catch {
    return null;
  }
}
