export type TemplateSeed = {
  slug: string;
  name: string;
  description: string;
  kind: "formation" | "event" | "audience" | "general";
  formation?: string;
  eventName?: string;
  audience?: string;
  platform: string;
  tone: string;
  visualStyle: string;
  duration: string;
  cta: string;
  structure: string[];
  assets: string[];
  briefSeed: string;
};

export const TEMPLATE_SEEDS: TemplateSeed[] = [
  {
    slug: "kit-jpo-mai-instagram-reel",
    name: "JPO Mai · Reel teaser Instagram",
    description:
      "Reel vertical 30s pour annoncer la JPO de mai et donner envie de venir au campus.",
    kind: "event",
    eventName: "JPO Mai",
    audience: "Lycéens 16-20",
    platform: "Instagram Reel",
    tone: "Inspirant & accessible",
    visualStyle: "Dynamique & créatif",
    duration: "30s",
    cta: "Inscris-toi à la JPO du 17 mai sur fonderie-image.org/jpo",
    structure: [
      "Hook 2s : plan motion énergique avec date à l'écran",
      "Plan ateliers : sérigraphie, motion, photo (3 plans rapides)",
      "Voix off étudiant·e : pourquoi je suis venu·e",
      "Final : date, lieu, QR code inscription",
    ],
    assets: [
      "showreel_etudiants_2025.mp4",
      "rushs_motion_DCDG_mars26.mp4",
      "QR_inscription_JPO.png",
    ],
    briefSeed:
      "Reel Instagram 30s pour la JPO du 17 mai 2026. Cible lycéens 16-20 ans, ton inspirant, mise en avant des ateliers motion design et sérigraphie, CTA inscription sur le site.",
  },
  {
    slug: "kit-jpo-mai-linkedin-parents",
    name: "JPO Mai · Post LinkedIn parents",
    description:
      "Post LinkedIn rassurant pour parents intéressés par les formations CFI.",
    kind: "event",
    eventName: "JPO Mai",
    audience: "Parents",
    platform: "LinkedIn",
    tone: "Direct & factuel",
    visualStyle: "Editorial",
    duration: "Post statique",
    cta: "Réservez votre créneau de visite individuelle",
    structure: [
      "Accroche : 'À quoi ressemble vraiment une école d'image en 2026 ?'",
      "3 chiffres clés : insertion, alternance, network",
      "Témoignage parent ou alumni",
      "CTA inscription JPO + lien direct",
    ],
    assets: [
      "infographie_insertion_2025.png",
      "portrait_alumni_refika.jpg",
      "campus_bagnolet_drone.jpg",
    ],
    briefSeed:
      "Post LinkedIn pour les parents. Présenter la JPO du 17 mai 2026, ton rassurant et factuel, avec chiffres d'insertion et témoignage alumni. CTA visite individuelle.",
  },
  {
    slug: "kit-parcoursup-tiktok-lyceens",
    name: "Parcoursup · TikTok lycéens",
    description:
      "Format TikTok 60s pour rassurer les lycéens en plein dossier Parcoursup.",
    kind: "event",
    eventName: "Parcoursup",
    audience: "Lycéens 16-20",
    platform: "TikTok",
    tone: "Direct & factuel",
    visualStyle: "Documentaire",
    duration: "60s",
    cta: "Pose tes questions Parcoursup en DM",
    structure: [
      "Hook : 'Parcoursup te stresse ? Voilà 3 choses utiles.'",
      "Étape 1 : comment formuler ses voeux",
      "Étape 2 : ce qui compte vraiment dans ton dossier",
      "Étape 3 : comment nous contacter",
    ],
    assets: [
      "screencast_parcoursup_voeux.mp4",
      "interview_responsable_recrutement.mp4",
    ],
    briefSeed:
      "TikTok 60s pour rassurer les lycéens en pleine procédure Parcoursup. Ton direct, format conseil pratique, CTA DM pour poser des questions.",
  },
  {
    slug: "kit-annecy-festival-instagram-story",
    name: "Festival Annecy · Story Instagram",
    description:
      "Stories Instagram pendant le Festival d'Annecy pour valoriser la présence CFI.",
    kind: "event",
    eventName: "Festival Annecy",
    audience: "Lycéens 16-20",
    platform: "Instagram Story",
    tone: "Chaleureux & alumni",
    visualStyle: "Documentaire",
    duration: "5 stories x 8s",
    cta: "Swipe up pour suivre nos étudiants en live",
    structure: [
      "Story 1 : arrivée à Annecy, équipe CFI",
      "Story 2 : stand CFI au festival",
      "Story 3 : étudiants devant un film projeté",
      "Story 4 : interview alumni présent",
      "Story 5 : CTA inscriptions Mastère DCDG",
    ],
    assets: [
      "stand_cfi_annecy_2025.jpg",
      "rushes_annecy_jour1.mp4",
      "interview_alumni_annecy.mp4",
    ],
    briefSeed:
      "Série de stories Instagram pendant le Festival d'Annecy. Ton chaleureux, immersif, valoriser présence des étudiants et alumni. CTA inscriptions Mastère DCDG.",
  },
  {
    slug: "kit-motion-design-portfolio-reel",
    name: "Motion Design · Reel portfolio étudiant",
    description:
      "Reel portfolio pour mettre en avant un projet d'étudiant Motion Design.",
    kind: "formation",
    formation: "Motion Design",
    audience: "Lycéens 16-20",
    platform: "Instagram Reel",
    tone: "Inspirant & accessible",
    visualStyle: "Dynamique & créatif",
    duration: "30s",
    cta: "Découvre la formation Motion Design sur fonderie-image.org",
    structure: [
      "Hook : extrait motion 2s plein écran",
      "Plan étudiant·e en train d'animer (capture After Effects)",
      "Citation courte sur le projet",
      "Logo CFI + lien formation",
    ],
    assets: [
      "rushs_motion_DCDG_mars26.mp4",
      "screencast_after_effects.mp4",
      "logo_cfi_animé.aep",
    ],
    briefSeed:
      "Reel portfolio Motion Design 30s. Mettre en avant un projet étudiant, capture After Effects + plan étudiant·e, ton inspirant. CTA page formation.",
  },
  {
    slug: "kit-design-graphique-carrousel-process",
    name: "Design Graphique · Carrousel process",
    description:
      "Carrousel Instagram qui montre le process créatif d'un projet de design graphique.",
    kind: "formation",
    formation: "Design Graphique",
    audience: "Lycéens 16-20",
    platform: "Instagram Carrousel",
    tone: "Editorial & expert",
    visualStyle: "Editorial",
    duration: "8 slides",
    cta: "Postule en BTS Design Graphique avant le 30 juin",
    structure: [
      "Slide 1 : visuel final du projet",
      "Slides 2-4 : recherches, croquis, moodboard",
      "Slides 5-6 : mises en page, typographies",
      "Slide 7 : retour pédagogique du/de la prof",
      "Slide 8 : CTA candidatures",
    ],
    assets: [
      "projet_etudiant_typo_v3.pdf",
      "moodboard_session_atelier.jpg",
      "portrait_prof_design_graphique.jpg",
    ],
    briefSeed:
      "Carrousel Instagram 8 slides montrant le process créatif d'un projet Design Graphique. Ton éditorial expert, visuels recherchés. CTA candidatures BTS.",
  },
  {
    slug: "kit-numerique-linkedin-entreprises",
    name: "Numérique · Post LinkedIn entreprises",
    description:
      "Post LinkedIn pour positionner la formation numérique auprès d'entreprises partenaires.",
    kind: "formation",
    formation: "Direction Artistique Numérique",
    audience: "Entreprises partenaires",
    platform: "LinkedIn",
    tone: "Expert & corporate",
    visualStyle: "Editorial",
    duration: "Post statique",
    cta: "Recrutez vos prochains DA via partenariats@cfi.fr",
    structure: [
      "Accroche : compétences techniques + créatives en un seul profil",
      "Description du parcours numérique CFI",
      "2 chiffres : alternance, taux insertion 6 mois",
      "CTA recrutement alternants",
    ],
    assets: [
      "infographie_competences_numerique.png",
      "portrait_alternant_studio.jpg",
    ],
    briefSeed:
      "Post LinkedIn pour entreprises partenaires sur la formation Direction Artistique Numérique. Ton expert corporate, mettre en avant alternance et insertion. CTA recrutement.",
  },
  {
    slug: "kit-serigraphie-tiktok-atelier",
    name: "Sérigraphie · TikTok atelier",
    description:
      "TikTok 30s qui montre l'atelier sérigraphie en pleine action, ton brut et craftsman.",
    kind: "formation",
    formation: "Sérigraphie",
    audience: "Lycéens 16-20",
    platform: "TikTok",
    tone: "Direct & factuel",
    visualStyle: "Documentaire",
    duration: "30s",
    cta: "Viens essayer la sérigraphie en JPO du 17 mai",
    structure: [
      "Hook 2s : geste précis sur écran sérigraphique",
      "Time-lapse impression complète",
      "Voix off étudiant·e : 'pourquoi j'aime la sérigraphie'",
      "Final : invitation JPO",
    ],
    assets: [
      "atelier_serigraphie_04.jpg",
      "timelapse_impression_atelier.mp4",
    ],
    briefSeed:
      "TikTok 30s atelier sérigraphie. Ton direct factuel, esthétique documentaire brute, time-lapse impression. CTA JPO du 17 mai.",
  },
  {
    slug: "kit-audience-parents-email-rentree",
    name: "Audience Parents · Email rentrée",
    description:
      "Email parents pour la rentrée : modalités, dates clés, accompagnement.",
    kind: "audience",
    audience: "Parents",
    platform: "Email",
    tone: "Chaleureux & alumni",
    visualStyle: "Editorial",
    duration: "Email texte + 2 visuels",
    cta: "Réservez votre créneau d'accueil le 6 septembre",
    structure: [
      "Sujet : 'Bienvenue à la Fonderie · les infos pratiques rentrée'",
      "Bloc 1 : dates clés rentrée + accueil parents",
      "Bloc 2 : interlocuteurs CFI (vie étudiante, scolarité)",
      "Bloc 3 : conseils logement et transports Bagnolet",
      "CTA inscription créneau d'accueil",
    ],
    assets: [
      "calendrier_rentree_2026.pdf",
      "campus_bagnolet_acces.jpg",
    ],
    briefSeed:
      "Email parents rentrée 2026. Ton chaleureux et rassurant, infos pratiques (dates, interlocuteurs, accès Bagnolet). CTA réservation créneau accueil 6 septembre.",
  },
  {
    slug: "kit-audience-alumni-newsletter-portrait",
    name: "Audience Alumni · Newsletter portrait",
    description:
      "Newsletter mensuelle alumni : portrait d'un·e diplômé·e et opportunités réseau.",
    kind: "audience",
    audience: "Alumni",
    platform: "Email",
    tone: "Chaleureux & alumni",
    visualStyle: "Portrait atelier",
    duration: "Newsletter 4 blocs",
    cta: "Recommande un·e étudiant·e pour notre programme mentorat",
    structure: [
      "Bloc portrait alumni du mois",
      "Bloc projet récent à découvrir",
      "Bloc opportunités emploi promo CFI",
      "CTA mentorat ou parrainage",
    ],
    assets: [
      "portrait_alumni_refika.jpg",
      "rushs_projet_alumni_studio.mp4",
    ],
    briefSeed:
      "Newsletter alumni mensuelle, portrait d'un·e diplômé·e + opportunités réseau et mentorat. Ton chaleureux et fier. CTA recommander étudiant·e mentorat.",
  },
  {
    slug: "kit-audience-entreprises-case-study",
    name: "Audience Entreprises · Case study LinkedIn",
    description:
      "Case study LinkedIn montrant un workshop CFI x studio partenaire.",
    kind: "audience",
    audience: "Entreprises partenaires",
    platform: "LinkedIn",
    tone: "Expert & corporate",
    visualStyle: "Editorial",
    duration: "Post long format + 4 visuels",
    cta: "Co-construisons votre prochain workshop : partenariats@cfi.fr",
    structure: [
      "Accroche : nom du studio + projet réalisé",
      "Contexte du brief studio + objectif pédagogique",
      "Process : 5 jours, 12 étudiant·es, 3 livrables",
      "Résultats : visuels finaux + verbatim studio",
      "CTA co-construction workshop",
    ],
    assets: [
      "case_study_workshop_publicis.pdf",
      "photos_session_atelier_workshop.jpg",
    ],
    briefSeed:
      "Case study LinkedIn workshop CFI x studio partenaire. Ton expert corporate, structure brief / process / résultats. CTA co-construction workshop.",
  },
  {
    slug: "kit-audience-lyceens-story-compte-a-rebours",
    name: "Audience Lycéens · Story compte à rebours JPO",
    description:
      "Stories Instagram à J-7, J-3, J-1 pour la JPO, format compte à rebours interactif.",
    kind: "audience",
    audience: "Lycéens 16-20",
    platform: "Instagram Story",
    tone: "Inspirant & accessible",
    visualStyle: "Dynamique & créatif",
    duration: "3 stories x 8s",
    cta: "Active le rappel JPO du 17 mai",
    structure: [
      "Story J-7 : sticker compte à rebours + photo campus",
      "Story J-3 : sondage 'tu viens ?' + plan rapide ateliers",
      "Story J-1 : preview programme + sticker rappel",
    ],
    assets: [
      "campus_bagnolet_drone.jpg",
      "atelier_motion_setup.jpg",
    ],
    briefSeed:
      "Série de 3 stories Instagram J-7, J-3, J-1 pour JPO 17 mai 2026. Ton inspirant accessible, sticker compte à rebours et sondage. CTA rappel.",
  },
];
