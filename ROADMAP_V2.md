# ROADMAP_V2

## Snapshot du Sprint 2

Date d'audit: 23 avril 2026

Validations techniques réalisées:
- `npm run lint`
- `npm run build`

### Audit Health Score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3/4 | Les formulaires sont labellisés et les faux CTA ont été neutralisés, mais il manque encore une vraie couche auth/session et quelques repères de navigation avancés. |
| 2 | Performance | 3/4 | `/community` et `/inspiration` sont redevenues statiques, mais le générateur et le builder restent très client-heavy. |
| 3 | Responsive Design | 3/4 | Les écrans principaux s'adaptent correctement, avec une preview mobile explicite côté newsletter. |
| 4 | Theming | 2/4 | Une base de tokens existe, mais plusieurs couleurs restent codées en dur dans les composants. |
| 5 | Anti-Patterns | 3/4 | La navigation et les composants partagés réduisent les écarts entre écrans, même si le système visuel reste encore hétérogène. |
| **Total** | | **14/20** | **Good** |

### Verdict anti-patterns

Pass conditionnel. Le produit ne ressemble plus à une juxtaposition d'écrans isolés, mais il garde quelques traces de dette visuelle:
- fonts et styles globaux encore très spécifiques à l'itération précédente
- nombreuses valeurs visuelles locales plutôt qu'un design token exhaustif
- densité de cartes encore élevée dans certains écrans complexes

## Ce qui est livré

### Architecture et navigation

- Une navigation commune a été ajoutée sur tous les écrans via `components/studio-frame.tsx`.
- La route `/generator` existe désormais réellement et les liens depuis community/inspiration aboutissent.
- La page `/` conserve le même point d'entrée que `/generator`, avec support du pré-remplissage par query params.
- Les pages `/community` et `/inspiration` ne sont plus forcées en SSR dynamique pour des données seedées.

### Intégrations Requesty et robustesse API

- Le générateur de contenu utilise maintenant la même couche Requesty que le SEO, avec fallback local explicite.
- Les routes `/api/generator`, `/api/seo` et `/api/newsletter-drafts` renvoient des erreurs structurées et valident mieux les entrées.
- Les états provider/fallback sont visibles dans l'UI du générateur.

### Cohérence UI

- Les écrans générateur et newsletter réutilisent désormais des composants partagés (`Button`, `Input`, `Textarea`, `Panel`, `SectionHeading`, `Tag`).
- Les boutons placeholder non branchés ont été rendus explicites et non interactifs.
- Le fichier SQLite local est ignoré via `.gitignore` pour éviter les dérives de worktree.

## Audit par périmètre demandé

### 1. Cross-screen consistency

Statut: Partiellement résolu

Fait:
- navigation commune
- patterns UI partagés sur generator/newsletter/community/inspiration
- liens inter-modules fonctionnels

Reste:
- système visuel encore partiellement hybride entre styles historiques et composants UI

### 2. Requesty integration

Statut: Partiellement résolu

Fait:
- mutualisation effective entre générateur et SEO
- fallback local explicite
- meilleure remontée d'erreurs

Reste:
- aucun module brand guardian
- aucun module veille connecté au même client

### 3. Auth integration

Statut: Non démarré

Constat:
- aucune protection de route
- aucun RBAC
- aucune session affichée

### 4. DB integrity

Statut: Partiel

Fait:
- persistance SQLite simple pour les brouillons newsletter
- pas de N+1 visible sur le périmètre actuel

Reste:
- pas de migrations versionnées
- pas de seeds DB structurées
- schéma encore centré sur un seul use case

### 5. New routes

Statut: Résolu côté UX

Fait:
- `/newsletter`, `/community`, `/inspiration` fonctionnent
- elles sont accessibles depuis la navigation commune
- les liens vers le générateur sont opérationnels

### 6. TypeScript

Statut: Bon

Fait:
- pas de `any` détecté
- interfaces partagées pour les modèles clés
- build TypeScript propre

### 7. Performance

Statut: Bon

Fait:
- routes seedées rendues statiques
- frontières serveur/client cohérentes sur community/inspiration/newsletter

Reste:
- generator et newsletter builder restent volumineux côté client

### 8. Accessibility

Statut: Bon avec réserves

Fait:
- labels de formulaires présents
- messages d'erreur visibles
- placeholders non branchés neutralisés

Reste:
- pas de skip link
- pas de système d'auth donc aucun parcours session à valider

### 9. Build

Statut: Résolu

Résultat:
- `npm run lint` propre
- `npm run build` propre

### 10. Visual fidelity

Statut: Bloqué

Constat:
- aucun fichier `standalone.html` n'est présent dans le repo
- la comparaison de fidélité visuelle n'a donc pas pu être menée

## Findings par sévérité

### P1

- Auth/RBAC/session totalement absents alors que l'audit demandait des routes protégées.
- L'intégration Requesty reste incomplète tant que brand guardian et veille ne sont pas implémentés.

### P2

- Absence de migrations DB versionnées et de seeds structurées.
- Référence `standalone.html` manquante pour la validation visuelle.
- Design tokens encore incomplets, avec plusieurs couleurs codées directement dans les composants.

### P3

- Pas de suite de tests automatisés au-delà de `lint` et `build`.
- Certaines vues restent denses en cartes et pourraient être simplifiées dans une passe de polish.

## Ce qui reste placeholder

- Import réel de sources d'inspiration par URL
- Connexion CRM / ajout de contacts community
- Veille réelle et scraping
- Brand guardian
- APIs sociales réelles
- Auth et permissions

## Intégrations restantes à prévoir

- provider auth + middleware + session UI
- API CRM / ATS pour alumni, partenaires et opportunités
- connecteurs sociaux pour publication ou brouillons
- pipeline de veille réelle avec scraping, parsing et ingestion
- migrations DB, seeds, backups et stratégie multi-environnement

## Priorités Sprint 3

1. Authentification, RBAC et affichage de session
2. Modules brand guardian et veille branchés sur le client Requesty partagé
3. Import réel community/inspiration via APIs ou scraping encadré
4. Migrations DB, seeds et normalisation du stockage au-delà de `newsletter_drafts`
5. Tests de non-régression sur routes, API handlers et parcours critiques

## Notes positives à conserver

- La base TypeScript est propre et lisible.
- Les nouvelles routes ont maintenant un parcours de navigation cohérent.
- Le fallback local protège l'usage du studio même sans provider distant.
- Le build de production reste vert après les corrections d'audit.
