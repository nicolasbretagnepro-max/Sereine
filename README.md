# Sereine — Méditation & respiration guidée

Application web mobile-first de méditation pour débutants. 100 % statique (HTML / CSS / JS vanilla), aucun backend, données en `localStorage`. Fonctionne hors connexion après le premier chargement (aucune ressource externe).

## Contenu

- **Parcours débutant** : 14 séances progressives avec scripts guidés complets (déblocage automatique).
- **Sessions express** : 7 séances d'urgence émotionnelle (1 à 5 min).
- **Bibliothèque émotionnelle** : 9 états (stress, anxiété, fatigue, colère, tristesse, agitation, concentration, sommeil, motivation), chacun avec une méditation dédiée + renvois adaptés.
- **Respiration guidée animée** : cohérence cardiaque, carrée 4-4-4-4, apaisement 4-6, sommeil 4-7-8, énergie 3-3.
- **Assistant quotidien** : humeur du jour → recommandations adaptées.
- **Journal** : statistiques, graphique des ressentis, calendrier de pratique, badges (gamification sans culpabilisation).
- **Onboarding** en 5 écrans (pédagogie, objectif, durée, moment d'ancrage).
- Modes clair/sombre, `prefers-reduced-motion` respecté, navigation clavier, aria-labels.

## Structure

```
/index.html
/style.css
/app.js          ← logique
/data.js         ← tout le contenu éditable (séances, scripts, textes)
/assets/audio/   ← optionnel : déposez ici des mp3
/assets/icons/
/assets/images/
```

## Audio

Aucun fichier audio n'est requis :
- Les **cloches de début/fin sont synthétisées** via la Web Audio API.
- Les séances affichent le **script guidé chronométré à l'écran**.

Pour ajouter une voix : déposez un fichier `assets/audio/<id>.mp3` (ex. `p1.mp3` pour la séance 1, `x5.mp3` pour "Difficulté à dormir"). Le lecteur le détecte automatiquement et remplace le guidage texte.

## Déploiement sur GitHub Pages

1. Créez un dépôt (ex. `sereine`) et poussez tous les fichiers à la racine :
   ```bash
   git init
   git add .
   git commit -m "Sereine v1"
   git branch -M main
   git remote add origin https://github.com/<votre-compte>/sereine.git
   git push -u origin main
   ```
2. Dans le dépôt : **Settings → Pages → Source : Deploy from a branch → main / (root)** → Save.
3. L'application est disponible sous `https://<votre-compte>.github.io/sereine/` après 1 à 2 minutes.

Aucune configuration de chemin nécessaire : tous les liens sont relatifs.

## Éditer le contenu

Tout le contenu est dans `data.js` :
- Scripts guidés : tableaux `[secondes_depuis_début, "texte"]`. Gardez le dernier timestamp inférieur à `duree * 60`.
- Ajoutez une séance express dans `DATA.express`, une émotion dans `DATA.emotions`, un protocole dans `DATA.respiration` : l'interface se met à jour automatiquement.

## Évolution PWA (prévue)

Pour passer en PWA installable : ajouter un `manifest.json` + un `service worker` de cache statique (les chemins étant relatifs et toutes les ressources locales, un simple cache-first sur `index.html`, `style.css`, `app.js`, `data.js` suffit).

## Réinitialiser les données

Console navigateur : `localStorage.removeItem("sereine-v1")` puis recharger.
