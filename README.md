# Sereine - Meditation & respiration guidee

Sereine est une application web mobile-first pour apprendre la meditation et construire une pratique simple, douce et reguliere.

Le projet est volontairement leger : HTML, CSS et JavaScript vanilla, sans backend, sans compte utilisateur et sans dependance externe. Les donnees de progression restent sur l'appareil dans `localStorage`.

## Fonctionnalites actuelles

- **Parcours debutant** : 14 seances progressives avec scripts guides chronometres.
- **Pratique au quotidien** : second parcours debloque apres le parcours debutant.
- **Sessions express** : seances courtes pour stress, calme, reunion, entretien, sommeil, mauvaise nouvelle et pause mentale.
- **Bibliotheque emotionnelle** : seances adaptees a plusieurs etats comme stress, anxiete, fatigue, colere, tristesse, agitation, concentration, sommeil et motivation.
- **Respiration guidee animee** : coherence cardiaque, respiration carree, apaisement 4-6, sommeil 4-7-8, energie 3-3.
- **Accueil avec progression lisible** : objectif, prochaine etape, routine choisie et bilan de la semaine.
- **Journal** : statistiques, calendrier de pratique, badges, export/import et reinitialisation locale.
- **Onboarding** : pedagogie, objectif, duree et moment d'ancrage.
- **Confort d'usage** : mode clair/sombre, navigation clavier, `prefers-reduced-motion`, labels ARIA principaux.

## Structure du projet

```text
/index.html      Interface et vues principales
/style.css       Styles mobile-first
/app.js          Logique applicative, navigation, lecteur, stockage
/data.js         Contenu editorial : seances, scripts, respirations
/manifest.json   Manifest PWA partiel
/favicon.svg     Favicon SVG
```

Les dossiers `assets/audio`, `assets/icons` et `assets/images` peuvent etre ajoutes plus tard, mais ne sont pas requis pour lancer l'application.

## Lancer en local

Depuis la racine du projet :

```bash
python -m http.server 4173
```

Puis ouvrir :

```text
http://localhost:4173
```

L'application peut aussi etre ouverte comme fichier statique, mais un petit serveur local est preferable pour tester le manifest et le comportement navigateur.

## Deploiement sur GitHub Pages

1. Pousser les fichiers a la racine du depot.
2. Aller dans **Settings -> Pages**.
3. Choisir **Deploy from a branch**.
4. Selectionner `main` et `/root`.
5. Attendre la publication GitHub Pages.

Tous les chemins sont relatifs, ce qui facilite l'hebergement sous une URL de type :

```text
https://<compte>.github.io/<depot>/
```

## Donnees utilisateur

Les donnees sont stockees localement dans le navigateur avec la cle :

```text
sereine-v1
```

Cela inclut :

- preferences d'onboarding ;
- theme ;
- seances terminees ;
- historique ;
- badges.

L'app ne synchronise rien entre appareils. Pour conserver une progression, utiliser l'export JSON depuis le Journal.

Reinitialisation manuelle :

```js
localStorage.removeItem("sereine-v1")
```

## Audio

Aucun fichier audio n'est obligatoire :

- les sons de debut et de fin sont synthetises via la Web Audio API ;
- les seances affichent un script guide chronometre a l'ecran.

Pour ajouter une voix plus tard, deposer un fichier :

```text
assets/audio/<id>.mp3
```

Exemples :

```text
assets/audio/p1.mp3
assets/audio/x5.mp3
```

Si le fichier existe, le lecteur tente de le lire a la place du guidage texte.

## PWA et mode hors ligne

Le projet contient un `manifest.json`, mais il ne contient pas encore de service worker.

Consequence :

- l'application peut etre hebergee et utilisee sur GitHub Pages ;
- le manifest prepare une installation partielle selon le navigateur ;
- le fonctionnement hors ligne n'est pas garanti ;
- le cache depend du navigateur, pas d'une strategie controlee par l'app.

Pour une utilisation personnelle sur GitHub Pages, un service worker n'est pas indispensable. Il devient utile si l'on veut :

- ouvrir l'app sans reseau apres une premiere visite ;
- fiabiliser l'installation mobile ;
- accelerer les chargements ;
- controler les mises a jour de fichiers.

Il ajoute aussi de la complexite :

- risque de garder une ancienne version en cache ;
- besoin de versionner le cache ;
- besoin de tester les mises a jour ;
- debugging parfois moins intuitif sur mobile.

## Modifier le contenu

Tout le contenu editorial est dans `data.js`.

Formats principaux :

- scripts guides : `[secondes_depuis_debut, "texte"]` ;
- seances du parcours : `DATA.parcours` ;
- seances express : `DATA.express` ;
- etats emotionnels : `DATA.emotions` ;
- protocoles de respiration : `DATA.respiration`.

Pour ajouter une seance, garder le dernier timestamp inferieur a `duree * 60`.

## Limites connues

- Pas de service worker : offline non garanti.
- Les icones PNG referencees par le manifest doivent etre ajoutees si l'on veut une installation mobile propre.
- Pas de voix audio incluse.
- Pas de backend ni de synchronisation multi-appareils.
- Les donnees locales peuvent etre perdues si le navigateur est nettoye.

## Roadmap courte

- Ajouter les icones PWA reelles.
- Ajouter un service worker seulement si l'usage offline devient important.
- Ajouter quelques audios pilotes.
- Renforcer les pages d'aide, confidentialite et cadre bien-etre.
- Ajouter des tests simples sur stockage, progression et import/export.
