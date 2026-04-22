# ROADMAP

## 1. Intégrations à brancher

| Item | Ce qui est en place | Ce qu'il faut brancher | API / service cible | Priorité |
| --- | --- | --- | --- | --- |
| Générateur de contenu | `app/generator` appelle `app/api/generate`, qui repose aujourd'hui sur `lib/generator-mock.ts` avec des réponses déterministes. | Remplacer le mock par un service de génération réel, gérer les clés, le streaming, les timeouts, les retries, la journalisation des prompts et le coût par génération. | OpenAI Responses API via un backend Next ou service Python dédié | P0 |
| Analyse Brand Guardian | `app/brand-guardian` appelle `app/api/brand-analysis`, qui s'appuie sur `lib/brand-guardian-mock.ts` et des heuristiques locales. | Brancher un moteur réel d'analyse ton/charte, stocker les analyses, versionner les règles de marque et remonter des diagnostics exploitables slide par slide. | Service LLM + règles métiers internes + stockage SQL | P0 |
| Données veille concurrentielle | `app/competitive` utilise des jeux de données statiques dans `components/screens/competitive/competitive-data.ts`. | Collecter des posts réels, métriques d'engagement, dates, formats et fréquences de publication avec refresh planifié. | APIs Meta, LinkedIn, TikTok ou agrégateur social tiers | P0 |
| Calendrier éditorial réel | `app/calendar` mélange des données DB et des constantes de démo pour les vues et suggestions. | Connecter les événements aux contenus, aux campagnes, aux deadlines et aux temps forts réels avec filtres persistés et édition. | Base SQL existante + table `campaigns`/`events` + éventuelle synchro Google Calendar | P0 |
| Authentification et rôles | Aucune authentification utilisateur n'existe; l'app fonctionne en mode mono-instance locale. | Ajouter login, sessions, rôles éditeur/reviewer/admin, protection des routes API et audit trail par utilisateur. | Auth.js, Clerk ou Supabase Auth | P0 |
| Persistance workflow kanban | Le kanban dispose d'API CRUD (`app/api/kanban`) et d'une DB SQLite locale. | Passer sur une base partagée, ajouter historique de transitions, commentaires, pièces jointes et verrouillage optimiste pour usage multi-utilisateur. | Postgres + Drizzle + stockage objet | P0 |
| Analytics produit | Aucun tracking d'usage n'est présent côté front ou API. | Instrumenter les parcours clés: création brief, génération, validation brand, favoris prompts, création carte, ouverture route, conversion export. | PostHog, Plausible ou Mixpanel | P1 |
| Notifications | Aucun système d'alerte n'existe pour review, échéances, échec de génération ou contenu publié. | Ajouter notifications in-app et email avec préférences utilisateur, digest quotidien et alertes sur échéances critiques. | Resend / SendGrid + file de jobs + centre de notifications interne | P1 |
| Export contenu | Le produit montre des variantes et analyses mais ne permet pas d'exporter un livrable exploitable. | Exporter briefs, scripts, calendriers et checklists en PDF, DOCX, CSV et copier vers CMS/social composer. | Génération serveur PDF/DOCX + CSV + clipboard/export endpoints | P1 |
| Intégration réseaux sociaux | Les écrans couvrent Instagram, TikTok, LinkedIn et email, mais sans publication réelle. | Ajouter brouillons, planification, publication, statuts de sync et récupération des métriques par canal. | Meta Graph API, LinkedIn API, TikTok API, Brevo/Mailchimp | P1 |
| Bibliothèque assets médias | Les assets du générateur sont simulés, sans bibliothèque centrale d'images/vidéos. | Connecter un DAM léger avec upload, tags, recherche, variantes et rattachement aux campagnes. | Cloudinary, UploadThing, S3 compatible | P1 |
| Base de connaissances prompts | Les prompts sont persistés en DB SQLite et éditables, mais sans gouvernance ni historique. | Ajouter versioning, approbation, tags métier, ownership, rollback et scoring de performance par prompt. | Base SQL existante + analytics + tables de versions | P1 |
| Sync CRM / admissions | Les contenus Parcoursup et JPO restent déconnectés des données d'inscriptions ou leads. | Connecter les campagnes aux sources admissions pour mesurer la contribution contenu -> lead -> candidature. | HubSpot, Airtable, Salesforce ou CRM admissions interne | P2 |
| Data warehouse et reporting | Les écrans affichent des KPIs éditoriaux mais sans pipeline de données consolidé. | Centraliser événements produit, social metrics, génération, validation et publication dans un schéma analytique. | BigQuery / Postgres analytics + dbt ou jobs ETL | P2 |

## 2. Nouvelles features proposées

| Feature | Description | Valeur ajoutée pour CFI | Complexité |
| --- | --- | --- | --- |
| Collaboration temps réel | Édition simultanée des briefs, commentaires ancrés sur variantes et présence utilisateur sur un contenu. | Réduit les aller-retours entre communication, pédagogie et direction artistique. | L |
| Workflow d'approbation | États configurables avec reviewers assignés, SLA, blocages et validations finales avant publication. | Sécurise la conformité et fluidifie la chaîne éditoriale. | M |
| A/B testing éditorial | Générer puis comparer plusieurs hooks, CTA ou angles visuels, avec suivi des performances par segment. | Permet d'optimiser les messages recrutement et JPO sans intuition seule. | M |
| Templates visuels réutilisables | Kits de campagne par formation, événement ou audience avec structure, ton, assets et CTA préconfigurés. | Accélère la production tout en gardant une cohérence forte. | M |
| Planification sociale auto-publish | Calendrier glisser-déposer qui publie automatiquement selon canal et fuseau. | Fait gagner du temps à l'équipe et réduit les oublis de diffusion. | L |
| Assistant SEO contenu école | Suggestions de mots-clés, structure article, meta descriptions et maillage pour pages programmes et actualités. | Augmente la découvrabilité organique des formations et événements. | M |
| Newsletter builder | Construction visuelle de newsletters admissions, alumni et partenaires à partir des contenus déjà produits. | Réutilise les assets existants et ouvre un canal CRM à forte valeur. | M |
| Génération visuelle | Création d'images d'accroche, déclinaisons stories/carrousels et prompts visuels cohérents avec la charte. | Donne à CFI une capacité créative rapide pour campagnes courtes. | L |
| Scoreboard d'engagement | Tableau de bord par formation, persona, campagne et canal, avec vues hebdo et mensuelles. | Aide à arbitrer le mix éditorial selon ce qui performe vraiment. | M |
| Hub partenaires & alumni | Répertoire vivant pour publier appels à projets, offres, témoignages et demandes de mentorat. | Renforce la communauté et nourrit les contenus authentiques. | M |
| Brief-to-shoot planner | À partir d'un brief, générer une checklist de tournage/photo avec plans, accessoires, casting et timings. | Rend la production terrain plus fiable et plus rapide pour une petite équipe. | M |
| Mur de validation brand | Vue transverse de tous les contenus avec score de marque, risques ouverts et tendances de non-conformité. | Facilite le pilotage qualité sans ouvrir contenu par contenu. | S |
| Recommandations de timing | Suggestions d'horaires de publication selon audience, canal, saisonnalité et historique. | Augmente la portée des campagnes sans charge opérationnelle supplémentaire. | M |
| Repository de références créatives | Capture et annotation de références visuelles, hooks, trends et benchmark par école ou studio. | Nourrit la direction créative et évite des idées répétitives. | S |
| Générateur de campagne 360 | Création d'un kit complet à partir d'un objectif: calendrier, scripts, déclinaisons social, email et landing copy. | Offre une vraie vision produit différenciante pour l'équipe communication. | L |
