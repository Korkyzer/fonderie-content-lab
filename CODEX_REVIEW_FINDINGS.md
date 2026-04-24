# CODEX_REVIEW_FINDINGS

Findings Codex encore valides collectés le 22 avril 2026 sur la branche `fix/codex-review-findings`.

Les commentaires déjà résolus ou devenus obsolètes après évolution du code ont été exclus.

## PR #11 · `fix: close final audit gaps`

| Fichier | Ligne | Sévérité | Problème | Fix suggéré |
| --- | ---: | --- | --- | --- |
| `app/prompts/prompts-client.tsx` | 288 | major | L’action `Utiliser` réutilisait une navigation qui injectait le contenu complet du prompt dans l’URL, avec risque de dépassement de longueur sur les gros templates. | Naviguer vers `/generator` avec le seul slug `prompt`, et laisser la page résoudre les données côté application. |

## PR #10 · `[FCL-11] Review Pair D fixes`

| Fichier | Ligne | Sévérité | Problème | Fix suggéré |
| --- | ---: | --- | --- | --- |
| `drizzle/0001_prompt_persona_backfill.sql` | 1 | critical | Le backfill n’était pas sûr pour les environnements ayant déjà appliqué l’ancien `0000`, ce qui provoquait des doublons de colonnes au prochain `db:migrate`. | Rendre l’exécution de `db:migrate` compatible avec les deux historiques en marquant `0001` comme déjà appliquée quand les colonnes existent déjà. |

## PR #7 · `[FCL-07] Bibliothèque de prompts + Audience Personas`

| Fichier | Ligne | Sévérité | Problème | Fix suggéré |
| --- | ---: | --- | --- | --- |
| `lib/data/personas.ts` | 31 | major | Le parsing CSV des listes personas cassait les valeurs contenant déjà des virgules, notamment les métriques `12,4%` dans `topContent`. | Passer les listes seedées en JSON sérialisé, puis parser ce format avec un fallback CSV pour la compatibilité locale. |
