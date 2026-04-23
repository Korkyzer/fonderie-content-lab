export type CreativeReference = {
  id: string;
  title: string;
  category: string;
  notes: string;
  url: string;
  tags: string[];
  score: number;
  screenshotTone: "purple" | "sky" | "orange" | "pink";
  generatorHref: string;
};

const references: CreativeReference[] = [
  {
    id: "ref-1",
    title: "Editorial landing immersive",
    category: "Landing page",
    notes: "Bonne hiérarchie éditoriale, grande respiration et visuels découpés pour faire monter la valeur perçue.",
    url: "https://example.com/editorial-landing",
    tags: ["hero", "editorial", "branding"],
    score: 88,
    screenshotTone: "purple",
    generatorHref:
      "/generator?title=Landing%20editoriale&platform=Web&audience=Parents&body=Créer%20une%20page%20très%20éditoriale%20avec%20des%20preuves%20formations%20et%20un%20CTA%20admissions.",
  },
  {
    id: "ref-2",
    title: "Carousel témoignage alumni",
    category: "Social media",
    notes: "Le carrousel articule citation, preuve métier et appel à l'action en quatre cartes très lisibles.",
    url: "https://example.com/alumni-carousel",
    tags: ["carousel", "alumni", "social"],
    score: 81,
    screenshotTone: "sky",
    generatorHref:
      "/generator?title=Carousel%20alumni&platform=Instagram&audience=Lycéens&body=Décliner%20une%20histoire%20alumni%20en%20carrousel%20court%20et%20très%20lisible.",
  },
  {
    id: "ref-3",
    title: "Page programme orientée débouchés",
    category: "Programme",
    notes: "Bonne articulation entre pédagogie, débouchés et maillage vers les pages d'admission.",
    url: "https://example.com/programme-debouches",
    tags: ["seo", "programme", "conversion"],
    score: 84,
    screenshotTone: "orange",
    generatorHref:
      "/generator?title=Page%20programme&platform=Web&audience=Parents&body=Structurer%20une%20page%20programme%20qui%20met%20en%20avant%20débouchés,%20ateliers%20et%20admissions.",
  },
];

export function listCreativeReferences() {
  return references;
}
