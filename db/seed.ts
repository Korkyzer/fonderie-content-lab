import { db, sqlite } from "@/db/index";
import {
  brandRules,
  calendarEvents,
  competitors,
  contentItems,
  kanbanCards,
  personas,
  prompts,
} from "@/db/schema";

async function main() {
  db.delete(contentItems).run();
  db.delete(brandRules).run();
  db.delete(kanbanCards).run();
  db.delete(calendarEvents).run();
  db.delete(competitors).run();
  db.delete(prompts).run();
  db.delete(personas).run();

  db.insert(contentItems).values([
    {
      title: "Reel motion : rush étudiants DCDG",
      format: "Reel",
      platform: "Instagram",
      campaign: "JPO Mai 2026",
      persona: "Lycéens 16-20",
      status: "published",
      dueDate: "2026-05-07T10:00:00+02:00",
      publishedAt: "2026-05-07T18:00:00+02:00",
      owner: "Laure Reymond",
      aiScore: 96,
      brandScore: 94,
    },
    {
      title: "Portrait alumni : Refika Dervišević",
      format: "Carrousel",
      platform: "Instagram",
      campaign: "Alumni",
      persona: "Alumni",
      status: "review",
      dueDate: "2026-05-16T09:30:00+02:00",
      owner: "Thomas L.",
      aiScore: 88,
      brandScore: 91,
    },
    {
      title: "Newsletter entreprises : workshop motion",
      format: "Newsletter",
      platform: "Email",
      campaign: "Partenariats",
      persona: "Entreprises partenaires",
      status: "brief",
      dueDate: "2026-06-03T14:00:00+02:00",
      owner: "Laure Reymond",
      aiScore: 82,
      brandScore: 90,
    },
  ]);

  db.insert(brandRules).values([
    {
      category: "Palette",
      name: "Jaune institutionnel",
      description: "Utiliser #FFED00 et refuser toute dérive off-brand sur les slides CTA et admissions.",
      severity: "high",
      expectedValue: "#FFED00",
      status: "active",
    },
    {
      category: "Typographie",
      name: "Titres caps SVHFlib Bold",
      description: "Les titres doivent rester en capitales avec SVHFlib Bold pour les écrans de campagne.",
      severity: "high",
      expectedValue: "SVHFlib Bold uppercase",
      status: "active",
    },
    {
      category: "Conformité",
      name: "Mentions formation",
      description: "Toute promesse formation ou financement garde les mentions Qualiopi et RNCP utiles.",
      severity: "high",
      expectedValue: "Mentions présentes",
      status: "active",
    },
    {
      category: "Ton",
      name: "Tutoiement pour les lycéens",
      description: "Employer un ton direct, inspirant et accessible sur les contenus recrutement.",
      severity: "medium",
      expectedValue: "Tutoiement",
      status: "active",
    },
    {
      category: "CTA",
      name: "Repères JPO",
      description: "Les contenus JPO citent la date, le campus et le bénéfice visiteur dès le CTA final.",
      severity: "medium",
      expectedValue: "Date + campus + bénéfice",
      status: "active",
    },
  ]);

  db.insert(kanbanCards).values([
    {
      columnId: "ideas",
      title: "Teaser JPO sérigraphie : 3 secondes pour accrocher",
      platform: "Instagram Reel",
      persona: "Lycéens 16-20",
      campaign: "JPO Mai 2026",
      assignee: "Laure Reymond",
      dueDate: "2026-05-03T12:00:00+02:00",
      aiProgress: 24,
    },
    {
      columnId: "production",
      title: "Reel JPO Motion Design : variantes",
      platform: "Instagram Reel",
      persona: "Lycéens 16-20",
      campaign: "JPO Mai 2026",
      assignee: "Thomas L.",
      dueDate: "2026-05-10T15:00:00+02:00",
      aiProgress: 72,
      brandScore: 89,
    },
    {
      columnId: "validated",
      title: "Carrousel BTS animation : coulisses atelier",
      platform: "Instagram",
      persona: "Parents",
      campaign: "Showcase étudiants",
      assignee: "Laure Reymond",
      dueDate: "2026-05-18T11:30:00+02:00",
      aiProgress: 100,
      brandScore: 97,
    },
  ]);

  db.insert(calendarEvents).values([
    {
      title: "JPO de mai",
      eventType: "open_day",
      platform: "Multi-canal",
      campaign: "JPO Mai 2026",
      startDate: "2026-05-17T09:00:00+02:00",
      endDate: "2026-05-17T18:00:00+02:00",
      location: "Campus CFI Paris",
      aiSuggestion: "Créer un compte à rebours stories dès le 7 mai.",
    },
    {
      title: "Fenêtre Parcoursup",
      eventType: "recruitment",
      platform: "Instagram + LinkedIn",
      campaign: "Parcoursup",
      startDate: "2026-01-15T09:00:00+01:00",
      endDate: "2026-03-31T18:00:00+02:00",
      location: "France",
      aiSuggestion: "Préparer 4 rappels orientés parents et lycéens.",
    },
    {
      title: "Festival d'Annecy",
      eventType: "festival",
      platform: "Instagram Reel",
      campaign: "Showcase étudiants",
      startDate: "2026-06-14T09:00:00+02:00",
      endDate: "2026-06-20T19:00:00+02:00",
      location: "Annecy",
      aiSuggestion: "Monter une série backstage avec 3 rushs motion inexploités.",
    },
    {
      title: "Salons étudiants de printemps",
      eventType: "fair",
      platform: "LinkedIn + Stories",
      campaign: "Recrutement étudiants",
      startDate: "2026-03-12T09:00:00+01:00",
      endDate: "2026-03-27T18:00:00+01:00",
      location: "Paris et Lyon",
    },
    {
      title: "Rentrée de septembre",
      eventType: "school_year",
      platform: "Instagram + Email",
      campaign: "Rentrée 2026",
      startDate: "2026-09-01T08:00:00+02:00",
      endDate: "2026-09-15T18:00:00+02:00",
      location: "Campus CFI",
      aiSuggestion: "Ajouter 2 contenus alumni pour équilibrer le mois.",
    },
  ]);

  db.insert(competitors).values([
    {
      name: "Gobelins",
      handle: "@gobelins_paris",
      primaryPlatform: "Instagram",
      monthlyPosts: 128,
      deltaPercent: 12,
      positioning: "Narration premium et coulisses ateliers",
      opportunity: "Répondre avec un format process étudiant plus brut et plus incarné.",
    },
    {
      name: "LISAA",
      handle: "@lisaa_paris",
      primaryPlatform: "TikTok",
      monthlyPosts: 94,
      deltaPercent: 4,
      positioning: "Volumes forts sur les admissions et la vie de campus",
      opportunity: "Renforcer les témoignages vidéo autour de la JPO.",
    },
    {
      name: "ECV",
      handle: "@ecv_france",
      primaryPlatform: "LinkedIn",
      monthlyPosts: 82,
      deltaPercent: -2,
      positioning: "Focus employabilité et projets de fin d’études",
      opportunity: "Accélérer les contenus entreprises partenaires.",
    },
    {
      name: "Cifacom",
      handle: "@cifacom",
      primaryPlatform: "Instagram",
      monthlyPosts: 67,
      deltaPercent: 8,
      positioning: "Ton événementiel et rythme soutenu sur les stories",
      opportunity: "Monter une série stories Parcoursup plus claire et plus pédagogique.",
    },
  ]);

  db.insert(prompts).values([
    {
      title: "JPO · Teaser Reel",
      category: "JPO & Events",
      rating: 4.9,
      monthlyUsage: 24,
      variables: "{formation},{persona},{plateforme},{ton},{date_evenement},{hashtag_principal}",
      body: "Rédige un brief de Reel {plateforme} pour {persona} afin d’annoncer {date_evenement}. Respecte la palette CFI noir #1D1D1B, violet #AE64DE, bleu #80D3FF, jaune #FFED00 et impose des titres en SVHFlib Bold. Le ton doit rester {ton} avec un CTA final clair.",
      author: "Laure R.",
    },
    {
      title: "Parcoursup · Carousel parents",
      category: "Recrutement étudiants",
      rating: 4.8,
      monthlyUsage: 18,
      variables: "{formation},{deadline},{preuve_sociale}",
      body: "Construis un carrousel rassurant pour les parents autour de {formation}, avec une slide deadline {deadline} et une slide preuve sociale {preuve_sociale}.",
      author: "Laure R.",
    },
    {
      title: "Festival Annecy · carnet de bord",
      category: "Showcase étudiants",
      rating: 4.7,
      monthlyUsage: 14,
      variables: "{rushs},{angle}",
      body: "Crée une série de scripts courts à partir de {rushs} avec un angle {angle} pour couvrir le Festival d'Annecy.",
      author: "Thomas L.",
    },
    {
      title: "Story compte à rebours JPO",
      category: "JPO & Events",
      rating: 4.6,
      monthlyUsage: 12,
      variables: "{jour},{formation}",
      body: "Prépare 3 stories verticales qui annoncent J-{jour} avant la JPO en mettant en avant {formation}.",
      author: "Laure R.",
    },
    {
      title: "Portrait alumni newsletter",
      category: "Alumni",
      rating: 4.8,
      monthlyUsage: 9,
      variables: "{alumni},{emploi}",
      body: "Rédige une newsletter alumni présentant {alumni}, aujourd’hui {emploi}, avec un angle inspiration et trajectoire métier.",
      author: "Laure R.",
    },
    {
      title: "LinkedIn partenariat studio",
      category: "Partenariats",
      rating: 4.5,
      monthlyUsage: 8,
      variables: "{entreprise},{atelier}",
      body: "Compose un post LinkedIn annonçant le partenariat avec {entreprise} autour de {atelier}.",
      author: "Thomas L.",
    },
    {
      title: "Campus life · micro-trottoir",
      category: "Life on campus",
      rating: 4.4,
      monthlyUsage: 11,
      variables: "{question},{persona}",
      body: "Écris un conducteur de micro-trottoir sur le campus avec la question {question} pour {persona}.",
      author: "Laure R.",
    },
    {
      title: "Showcase étudiants · avant/après",
      category: "Showcase étudiants",
      rating: 4.6,
      monthlyUsage: 10,
      variables: "{projet},{logiciel}",
      body: "Propose un concept avant/après pour {projet} avec une mention de {logiciel}.",
      author: "Laure R.",
    },
    {
      title: "Admissions · FAQ courte",
      category: "Recrutement étudiants",
      rating: 4.3,
      monthlyUsage: 13,
      variables: "{formation},{modalite}",
      body: "Rédige une FAQ sociale compacte sur {formation} et la modalité {modalite}.",
      author: "Thomas L.",
    },
    {
      title: "Alumni · appel à témoignages",
      category: "Alumni",
      rating: 4.7,
      monthlyUsage: 7,
      variables: "{promotion},{canal}",
      body: "Prépare un appel à témoignages pour la promotion {promotion} à diffuser sur {canal}.",
      author: "Laure R.",
    },
  ]);

  db.insert(personas).values([
    {
      name: "Lycéens 16-20",
      audienceSize: "720 ciblables",
      performance: "+42% engagement",
      toneOfVoice: "Direct, inspirant, concret, tutoiement assumé.",
      preferredPlatforms: "Instagram Reel,TikTok,Stories",
      vocabularyYes: "atelier, projet, portfolio, créer, campus",
      vocabularyNo: "procédure, institution, administratif",
      bestHour: "18:30",
    },
    {
      name: "Parents",
      audienceSize: "310 ciblables",
      performance: "+18% clic brochure",
      toneOfVoice: "Rassurant, structuré, orienté débouchés.",
      preferredPlatforms: "LinkedIn,Email,Facebook",
      vocabularyYes: "accompagnement, insertion, diplôme, encadrement",
      vocabularyNo: "slang, jargon, promesse vague",
      bestHour: "20:00",
    },
    {
      name: "Entreprises partenaires",
      audienceSize: "84 comptes",
      performance: "12 nouveaux contrats",
      toneOfVoice: "Expert, crédible, orienté collaboration et talent.",
      preferredPlatforms: "LinkedIn,Email",
      vocabularyYes: "alternance, collaboration, studio, compétences",
      vocabularyNo: "buzzword, hype, superlatif",
      bestHour: "09:00",
    },
    {
      name: "Alumni",
      audienceSize: "4 200 diplômé·es",
      performance: "+31% taux d'ouverture",
      toneOfVoice: "Chaleureux, fier, communautaire.",
      preferredPlatforms: "Email,Instagram,LinkedIn",
      vocabularyYes: "promo, parcours, mentorat, réseau",
      vocabularyNo: "corporate froid, distance",
      bestHour: "12:15",
    },
  ]);
}

main()
  .then(() => {
    sqlite.close();
  })
  .catch((error) => {
    sqlite.close();
    console.error(error);
    process.exit(1);
  });
