export type NewsletterSection = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  highlight: string;
};

export type NewsletterDraftPayload = {
  header: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  sections: NewsletterSection[];
  cta: {
    label: string;
    url: string;
  };
  footer: {
    note: string;
    signature: string;
  };
};

export type StoredNewsletterDraft = {
  id: string;
  title: string;
  templateKey: string;
  payload: NewsletterDraftPayload;
  html: string;
  updatedAt: string;
};

export const NEWSLETTER_TEMPLATES = [
  {
    key: "admissions-parents",
    name: "Admissions parents",
    description:
      "Un format rassurant, orienté accompagnement, pédagogie et étapes d'inscription.",
  },
  {
    key: "alumni-mensuelle",
    name: "Alumni mensuelle",
    description: "Une édition éditoriale qui raconte parcours, actualités et projets d'anciens.",
  },
  {
    key: "partenaires-entreprises",
    name: "Partenaires entreprises",
    description:
      "Une lettre pensée pour valoriser l'alternance, les stages et les collaborations pédagogiques.",
  },
] as const;

export const NEWSLETTER_SNIPPETS = [
  {
    title: "Admissions: atelier découverte",
    body:
      "Les prochaines journées d'immersion permettent aux familles d'observer les studios, de rencontrer les intervenants et de comprendre le rythme pédagogique avant candidature.",
  },
  {
    title: "Prompt blog: pédagogie projet",
    body:
      "Un angle éditorial fort consiste à montrer comment un brief réel structure l'apprentissage, du premier croquis jusqu'à la restitution client.",
  },
  {
    title: "Prompt page web: débouchés métiers",
    body:
      "Les contenus les plus convaincants relient chaque formation à des métiers concrets: direction artistique, motion, UX, design graphique ou communication visuelle.",
  },
];

const PAYLOADS: Record<string, NewsletterDraftPayload> = {
  "admissions-parents": {
    header: {
      eyebrow: "Admissions CFI",
      title: "Votre repère pour préparer une rentrée créative et sereine",
      intro:
        "Cette édition rassemble les étapes clés des admissions, les temps d'immersion à venir et des conseils concrets pour aider votre enfant à choisir une formation de design qui lui ressemble.",
    },
    sections: [
      {
        id: "adm-1",
        eyebrow: "À noter",
        title: "Trois rendez-vous pour découvrir l'école avant de candidater",
        body:
          "Visites de studios, échanges avec l'équipe pédagogique et rencontres avec les étudiants permettent de voir comment les projets prennent forme au quotidien. Ces formats facilitent une décision plus informée.",
        highlight: "Journées d'immersion, portes ouvertes et rendez-vous personnalisés.",
      },
      {
        id: "adm-2",
        eyebrow: "Méthode",
        title: "Comment se déroule l'accompagnement admissions",
        body:
          "Le parcours est séquencé pour être lisible: constitution du dossier, entretien, retour sur le projet d'études puis suivi individuel. Chaque étape aide la famille à se projeter avec clarté.",
        highlight: "Un suivi humain plutôt qu'un tunnel administratif.",
      },
    ],
    cta: {
      label: "Réserver une immersion",
      url: "https://cfi.fr/admissions",
    },
    footer: {
      note:
        "Vous recevez cet email car vous avez demandé des informations sur les formations CFI. Répondez directement à ce message pour poser vos questions.",
      signature: "L'équipe admissions CFI",
    },
  },
  "alumni-mensuelle": {
    header: {
      eyebrow: "Réseau alumni",
      title: "Ce que les diplômés CFI font évoluer ce mois-ci",
      intro:
        "Une sélection de trajectoires, de projets et d'opportunités pour garder le lien avec la communauté et montrer comment les parcours continuent bien après le diplôme.",
    },
    sections: [
      {
        id: "alu-1",
        eyebrow: "Portrait",
        title: "Une ancienne étudiante raconte son passage du studio à l'agence",
        body:
          "Le témoignage revient sur l'importance des projets collectifs, de la direction artistique et des contraintes réelles rencontrées dès la formation. Le récit nourrit la fierté du réseau alumni.",
        highlight: "Une citation forte à isoler dans l'édition mensuelle.",
      },
      {
        id: "alu-2",
        eyebrow: "Radar",
        title: "Appels à projets, conférences et interventions à ne pas manquer",
        body:
          "La newsletter devient un point de contact utile en regroupant les opportunités pertinentes pour des profils design, motion, communication ou UX.",
        highlight: "Une veille compacte, actionnable et inspirante.",
      },
    ],
    cta: {
      label: "Partager une actualité alumni",
      url: "https://cfi.fr/alumni",
    },
    footer: {
      note:
        "Envie d'apparaître dans une prochaine édition? Répondez avec votre actu, votre portfolio ou votre prochaine prise de parole.",
      signature: "Le réseau alumni CFI",
    },
  },
  "partenaires-entreprises": {
    header: {
      eyebrow: "Partenariats entreprises",
      title: "Former avec vous des profils créatifs immédiatement opérationnels",
      intro:
        "Cette newsletter met en lumière les collaborations en cours, les modalités d'alternance et les opportunités de briefs réels pour rapprocher l'école des besoins métiers.",
    },
    sections: [
      {
        id: "ent-1",
        eyebrow: "Collaboration",
        title: "Pourquoi les briefs réels produisent des profils mieux préparés",
        body:
          "Lorsqu'une entreprise partage un cas, les étudiants apprennent à cadrer, itérer, présenter et défendre une réponse créative dans des conditions proches du terrain.",
        highlight: "Un partenariat visible dans la pédagogie, pas seulement sur une brochure.",
      },
      {
        id: "ent-2",
        eyebrow: "Recrutement",
        title: "Alternance, stage, workshop: choisir le format adapté à votre enjeu",
        body:
          "Chaque formule répond à un besoin différent. L'alternance renforce l'intégration à long terme, le stage accélère un projet ciblé, et le workshop ouvre un espace de recherche rapide.",
        highlight: "Des formats souples pour des besoins métiers variés.",
      },
    ],
    cta: {
      label: "Échanger avec l'équipe partenariats",
      url: "https://cfi.fr/entreprises",
    },
    footer: {
      note:
        "Vous pouvez répondre directement à ce message pour proposer un brief, une rencontre métier ou une mission en alternance.",
      signature: "L'équipe partenariats CFI",
    },
  },
};

export function createTemplatePayload(templateKey: string): NewsletterDraftPayload {
  const payload = PAYLOADS[templateKey] ?? PAYLOADS["admissions-parents"];
  return JSON.parse(JSON.stringify(payload)) as NewsletterDraftPayload;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildNewsletterHtml(payload: NewsletterDraftPayload): string {
  const sections = payload.sections
    .map(
      (section) => `
        <tr>
          <td style="padding:0 0 20px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f2ea;border-radius:22px;">
              <tr>
                <td style="padding:28px 28px 24px 28px;font-family:Arial,sans-serif;color:#112031;">
                  <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;margin-bottom:12px;">
                    ${escapeHtml(section.eyebrow)}
                  </div>
                  <h2 style="margin:0 0 12px 0;font-size:28px;line-height:1.2;font-family:Georgia,serif;">
                    ${escapeHtml(section.title)}
                  </h2>
                  <p style="margin:0;font-size:15px;line-height:1.8;color:#334155;">
                    ${escapeHtml(section.body)}
                  </p>
                  <div style="margin-top:18px;padding:14px 16px;border-radius:16px;background:#ffffff;color:#742f1b;font-size:14px;font-weight:600;">
                    ${escapeHtml(section.highlight)}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(payload.header.title)}</title>
  </head>
  <body style="margin:0;background:#efe7dc;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efe7dc;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:28px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(140deg,#112031,#0d6a6d);padding:40px 34px;font-family:Arial,sans-serif;color:#ffffff;">
                <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.7);">
                  ${escapeHtml(payload.header.eyebrow)}
                </div>
                <h1 style="margin:14px 0 0 0;font-size:40px;line-height:1.1;font-family:Georgia,serif;">
                  ${escapeHtml(payload.header.title)}
                </h1>
                <p style="margin:18px 0 0 0;font-size:16px;line-height:1.8;color:rgba(255,255,255,0.85);">
                  ${escapeHtml(payload.header.intro)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 26px 8px 26px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${sections}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 26px 30px 26px;">
                <a
                  href="${escapeHtml(payload.cta.url)}"
                  style="display:block;border-radius:999px;background:#de6b48;padding:16px 20px;color:#ffffff;text-align:center;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;font-weight:700;"
                >
                  ${escapeHtml(payload.cta.label)}
                </a>
                <div style="margin-top:20px;padding:20px;border:1px solid rgba(17,32,49,0.08);border-radius:22px;font-family:Arial,sans-serif;color:#475569;font-size:14px;line-height:1.8;">
                  <p style="margin:0;">${escapeHtml(payload.footer.note)}</p>
                  <p style="margin:10px 0 0 0;font-weight:700;color:#112031;">
                    ${escapeHtml(payload.footer.signature)}
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
