/* ============================================================
   SEREINE — app.js
   Logique : état, onboarding, navigation, recommandations,
   lecteur de méditation, moteur de respiration, journal.
   Aucune dépendance. localStorage uniquement.
   ============================================================ */

"use strict";

/* ============================================================
   1. ÉTAT & STOCKAGE
   ============================================================ */
const STORE_KEY = "sereine-v1";

const etatDefaut = {
  onboarded: false,
  prefs: { objectif: null, duree: 5, moment: null },
  theme: null,                  // null = suit le système
  parcoursModeFait: [],         // ids des séances mode d'emploi terminées
  parcours1Fait: [],            // ids des séances du parcours débutant terminées
  parcours2Fait: [],            // ids des pratiques au quotidien terminées
  parcoursEmotionsFait: [],     // ids du parcours émotions difficiles terminés
  historique: [],               // { date, id, titre, minutes, stress, energie, humeur }
  humeurJour: null,             // { date: "YYYY-MM-DD", id }
  badges: []                    // ids des badges obtenus
};

let etat;

/* Méditation libre : item générique, durée mise à jour dynamiquement */
const ITEM_LIBRE = {
  id:         "libre",
  titre:      "Méditation libre",
  duree:      10,
  objectif:   "S'asseoir librement, sans guide ni objectif.",
  pedagogie:  "Pas d'instructions, pas d'objectif. Installez-vous, fermez les yeux, et soyez simplement là — à votre rythme, pour la durée que vous choisissez.",
  script:     [[0, "Installez-vous. Fermez les yeux. Respirez librement."]],
  conclusion: "Belle pratique libre. Vous étiez votre propre guide."
};

function chargerEtat() {
  try {
    const brut = localStorage.getItem(STORE_KEY);
    if (!brut) return { ...etatDefaut };

    const lu = JSON.parse(brut);
    const legacy = Array.isArray(lu.parcoursFait) ? lu.parcoursFait : [];
    const parcoursModeFait = [...new Set([
      ...(Array.isArray(lu.parcoursModeFait) ? lu.parcoursModeFait : []),
      ...legacy.filter(id => /^m\d+/.test(id))
    ])];
    const parcours1Fait = [...new Set([
      ...(Array.isArray(lu.parcours1Fait) ? lu.parcours1Fait : []),
      ...legacy.filter(id => /^p\d+/.test(id))
    ])];
    const parcours2Fait = [...new Set([
      ...(Array.isArray(lu.parcours2Fait) ? lu.parcours2Fait : []),
      ...legacy.filter(id => /^q\d+/.test(id))
    ])];
    const parcoursEmotionsFait = [...new Set([
      ...(Array.isArray(lu.parcoursEmotionsFait) ? lu.parcoursEmotionsFait : []),
      ...legacy.filter(id => /^d\d+/.test(id))
    ])];

    const migre = {
      ...etatDefaut,
      ...lu,
      parcoursModeFait,
      parcours1Fait,
      parcours2Fait,
      parcoursEmotionsFait,
      historique: normaliserHistorique(lu.historique),
      badges: nettoyerIds(lu.badges, "b")
    };
    delete migre.parcoursFait;
    return migre;
  } catch { return { ...etatDefaut }; }
}
function sauver() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(etat)); } catch { /* stockage indisponible */ }
}

/* Petits utilitaires */
const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
function dateLocaleISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
const aujourdHui = () => dateLocaleISO();
const mn = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const reduitMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function idSession() {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function entreeHistorique(item, minutes, type = null) {
  return {
    sessionId: idSession(),
    date: aujourdHui(),
    at: new Date().toISOString(),
    id: item.id,
    titre: item.titre,
    minutes,
    type
  };
}

/* ============================================================
   2. AUDIO — cloches synthétisées (Web Audio API)
   Aucun fichier requis. Si un mp3 existe dans assets/audio/
   avec l'id de la séance, il sera joué à la place du guidage texte.
   ============================================================ */
let audioCtx = null;

/**
 * Renvoie un AudioContext en état de marche.
 * - Le recrée s'il n'existe pas ou s'il a été "closed" (iOS peut fermer le
 *   contexte après une longue mise en arrière-plan : c'est la cause du
 *   "plus de son tant que je ne ferme/rouvre pas l'app").
 * - Tente toujours de le relancer s'il est "suspended" ou "interrupted".
 */
function ctxAudio() {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // iOS suspend/"interrompt" le contexte en arrière-plan : on le relance
    // automatiquement à chaque changement d'état.
    audioCtx.addEventListener("statechange", () => {
      if (audioCtx && audioCtx.state !== "running" && audioCtx.state !== "closed") {
        audioCtx.resume().catch(() => {});
      }
    });
  }
  if (audioCtx.state !== "running") audioCtx.resume().catch(() => {});
  return audioCtx;
}

/**
 * iOS Safari : (ré)active la sortie audio sur un geste utilisateur.
 * Un buffer silencieux d'1 sample fait repasser le contexte de
 * "suspended"/"interrupted" à "running". Sans ça, aucun son ne sort.
 *
 * Important : ce gestionnaire reste actif sur CHAQUE geste (et non une seule
 * fois comme avant). Le contexte peut être suspendu plusieurs fois dans une
 * même session (arrière-plan, écran verrouillé, autre app qui joue du son…) ;
 * il faut donc pouvoir le réveiller à n'importe quel moment, pas qu'au tout
 * premier tap.
 */
function reveillerAudio() {
  try {
    const ctx = ctxAudio();
    const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  } catch { /* audio indisponible */ }
}

/* Réveil de l'audio à chaque geste (touchend = iOS, click = desktop) */
["touchend", "click"].forEach(ev =>
  document.addEventListener(ev, reveillerAudio, { passive: true })
);

/* Reprendre l'audio quand l'app revient au premier plan (iOS PWA, verrou écran).
   ctxAudio() recrée le contexte s'il a été fermé entre-temps. */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    try { ctxAudio(); } catch { /* ignore */ }
  }
});

/** Cloche de début : superposition de deux sinus, tonalité douce. */
function cloche(volume = .6) {
  let ctx;
  try { ctx = ctxAudio(); } catch { return; }
  const jouer = () => {
    try {
      const t = ctx.currentTime + 0.04; // légère avance : démarrage plus fiable
      [[523.25, 1], [784, .4]].forEach(([freq, gainRel]) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(volume * gainRel * .25, t + .02);
        g.gain.exponentialRampToValueAtTime(.0001, t + 3.5);
        osc.connect(g).connect(ctx.destination);
        osc.start(t); osc.stop(t + 3.6);
      });
    } catch { /* audio indisponible : silencieux */ }
  };
  // Si le contexte n'est pas encore actif, jouer APRÈS sa reprise : sinon le son,
  // planifié sur un contexte suspendu, est perdu (cause du "pas de son" résiduel).
  if (ctx.state === "running") jouer();
  else ctx.resume().then(jouer).catch(() => {});
}

/**
 * Bol tibétain de fin de séance.
 * Synthèse par partiels non harmoniques, déclin long (≈ 7 s).
 * Accompagné d'une vibration douce si l'appareil le supporte.
 */
function bolTibetain(volume = .6) {
  let ctx;
  try { ctx = ctxAudio(); } catch { ctx = null; }
  if (ctx) {
    const jouer = () => {
      try {
        const t = ctx.currentTime + 0.04;
        // Partielle fondamentale + harmoniques inharmoniques typiques des bols
        const partiels = [
          [396,   1.00],   // fondamentale
          [871,   0.45],   // × 2.20
          [1703,  0.18],   // × 4.30
          [3089,  0.07],   // × 7.80
        ];
        partiels.forEach(([freq, rel]) => {
          const osc = ctx.createOscillator();
          const g   = ctx.createGain();
          osc.type  = "sine";
          osc.frequency.value = freq;
          // Attaque quasi instantanée (frappe de mailloche), déclin très lent
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(volume * rel * .32, t + .015);
          g.gain.exponentialRampToValueAtTime(.0001, t + 7.0);
          osc.connect(g).connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 7.1);
        });
      } catch { /* audio indisponible : silencieux */ }
    };
    if (ctx.state === "running") jouer();
    else ctx.resume().then(jouer).catch(() => {});
  }

  // Vibration douce (deux pulsations brèves, style "bol") — indépendante de l'audio
  try {
    if (navigator.vibrate) navigator.vibrate([100, 60, 100]);
  } catch { /* vibration indisponible */ }
}

/* ============================================================
   2a-bis. SON DE FIN FIABLE SUR iOS (ecran verrouille)
   ------------------------------------------------------------
   Sur iPhone, des que l ecran se verrouille : les timers JS gelent ET
   l AudioContext est suspendu. Le bol de fin declenche par le minuteur
   ne sonnait donc jamais sans regarder l ecran.

   1) Une boucle audio silencieuse (<audio>) lancee sur le geste de
      demarrage maintient la session media active : iOS ne suspend plus
      l AudioContext ecran eteint.
   2) Le bol de fin est planifie sur l horloge materielle de
      l AudioContext (osc.start(when)), independante du thread JS.
      Il sonne a l heure, ecran verrouille ou telephone en poche.
   ============================================================ */
const SILENCE_URI = "data:audio/wav;base64,UklGRmQfAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUAfAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let boucleSilence = null;

function demarrerKeepAlive() {
  try {
    if (!boucleSilence) {
      boucleSilence = new Audio(SILENCE_URI);
      boucleSilence.loop = true;
      boucleSilence.preload = "auto";
    }
    boucleSilence.currentTime = 0;
    boucleSilence.play().catch(() => {});
    if ("mediaSession" in navigator) {
      try { navigator.mediaSession.playbackState = "playing"; } catch { /* ignore */ }
    }
  } catch { /* keep-alive indisponible */ }
}

function arreterKeepAlive() {
  try { if (boucleSilence) boucleSilence.pause(); } catch { /* ignore */ }
  if ("mediaSession" in navigator) {
    try { navigator.mediaSession.playbackState = "none"; } catch { /* ignore */ }
  }
}

/* Bol de fin planifie sur l horloge audio (survit au verrouillage). */
let bolProgramme = null;

function annulerBolProgramme() {
  if (!bolProgramme) return;
  bolProgramme.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch { /* ignore */ } });
  bolProgramme = null;
}

function programmerBol(delaiSec, volume = .6) {
  annulerBolProgramme();
  try {
    const ctx = ctxAudio();
    const t0 = ctx.currentTime + Math.max(0, delaiSec);
    const partiels = [[396, 1.00], [871, 0.45], [1703, 0.18], [3089, 0.07]];
    bolProgramme = partiels.map(([freq, rel]) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type  = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(volume * rel * .32, t0 + .015);
      g.gain.exponentialRampToValueAtTime(.0001, t0 + 7.0);
      osc.connect(g).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 7.1);
      return osc;
    });
  } catch { /* audio indisponible */ }
}

/* Aucun fichier mp3 n'est fourni (tout l'audio est synthétisé). On désactive
   donc la tentative de chargement réseau qui échouait à chaque séance et
   ajoutait un délai inutile. Passer à true si des mp3 sont ajoutés un jour. */
const AUDIO_MP3 = false;

/** Tente de charger un mp3 (assets/audio/<id>.mp3). Renvoie un <audio> ou null. */
function chargerMp3(id) {
  if (!AUDIO_MP3) return Promise.resolve(null);
  return new Promise(resolve => {
    const a = new Audio(`assets/audio/${id}.mp3`);
    a.addEventListener("canplaythrough", () => resolve(a), { once: true });
    a.addEventListener("error", () => resolve(null), { once: true });
    setTimeout(() => resolve(null), 1500); // hors-ligne / absent
  });
}

/* ============================================================
   2b. WAKE LOCK — maintenir l'écran allumé pendant les séances
   API Screen Wake Lock (supportée sur iOS 16.4+ et Chrome Android)
   ============================================================ */
let wakeLockSentinel = null;
let wakeLockVoulu = false; // true tant qu'une séance est en cours

async function activerWakeLock() {
  wakeLockVoulu = true;
  try {
    if ("wakeLock" in navigator) {
      wakeLockSentinel = await navigator.wakeLock.request("screen");
      // iOS/Android libèrent le verrou en arrière-plan : on l'oublie proprement
      // pour pouvoir le réacquérir au retour au premier plan.
      wakeLockSentinel.addEventListener("release", () => { wakeLockSentinel = null; });
    }
  } catch { /* non supporté ou refusé */ }
}

function libererWakeLock() {
  wakeLockVoulu = false;
  if (wakeLockSentinel) {
    wakeLockSentinel.release().catch(() => {});
    wakeLockSentinel = null;
  }
}

// Réacquérir le verrou au retour au premier plan, tant qu'une séance est active.
document.addEventListener("visibilitychange", () => {
  if (wakeLockVoulu && !wakeLockSentinel && document.visibilityState === "visible") {
    activerWakeLock();
  }
});

/* ============================================================
   3. NAVIGATION ENTRE VUES
   ============================================================ */
function montrerVue(nom) {
  $$(".vue").forEach(v => v.classList.add("hidden"));
  const vue = $(`#vue-${nom}`);
  vue.classList.remove("hidden");
  vue.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
  $$(".nav-item").forEach(b => {
    const actif = b.dataset.vue === nom;
    b.classList.toggle("nav-actif", actif);
    if (actif) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  const navVisible = ["accueil", "parcours", "respiration", "biblio", "journal"].includes(nom);
  $(".navbas").style.display = navVisible ? "" : "none";
  if (nom === "accueil") rendreAccueil();
  if (nom === "parcours") rendreParcours();
  if (nom === "respiration") rendreRespiration();
  if (nom === "biblio") rendreBiblio();
  if (nom === "journal") rendreJournal();
  if (nom === "guide") rendreGuideMediter();
}

$$(".nav-item").forEach(b => b.addEventListener("click", () => montrerVue(b.dataset.vue)));
$$("[data-retour]").forEach(b => b.addEventListener("click", () => montrerVue("accueil")));
$$("[data-retour-parcours]").forEach(b => b.addEventListener("click", () => montrerVue("parcours")));

/* ---------- Thème ---------- */
function appliquerTheme() {
  const prefereSombre = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const sombre = etat.theme ? etat.theme === "sombre" : prefereSombre;
  document.documentElement.dataset.theme = sombre ? "sombre" : "clair";
  const tb = $("#themeBtn");
  if (tb) {
    tb.setAttribute("aria-pressed", String(sombre));
    tb.setAttribute("aria-label", sombre ? "Passer au thème clair" : "Passer au thème sombre");
  }
}
$("#themeBtn").addEventListener("click", () => {
  const actuel = document.documentElement.dataset.theme;
  etat.theme = actuel === "sombre" ? "clair" : "sombre";
  sauver(); appliquerTheme();
});

/* ============================================================
   4. ONBOARDING
   ============================================================ */
function lancerOnboarding() {
  $("#onboarding").classList.remove("hidden");
  let ecran = 0;
  const total = 5;

  function montrer(n) {
    ecran = n;
    $$(".ob-screen").forEach(s => s.classList.toggle("hidden", +s.dataset.ob !== n));
    $("#obBar").style.width = `${((n + 1) / total) * 100}%`;
  }

  $$("[data-obnext]").forEach(b => b.addEventListener("click", () => montrer(ecran + 1)));

  /* Objectifs */
  DATA.objectifs.forEach(o => {
    const b = document.createElement("button");
    b.className = "choix";
    b.innerHTML = `<span>${o.icone}</span> ${o.label}`;
    b.addEventListener("click", () => { etat.prefs.objectif = o.id; sauver(); montrer(4); });
    $("#obObjectifs").appendChild(b);
  });

  /* Durées */
  DATA.durees.forEach(d => {
    const b = document.createElement("button");
    b.className = "choix choix-duree";
    b.textContent = `${d} min`;
    b.addEventListener("click", () => {
      etat.prefs.duree = d; sauver();
      $$("#obDurees .choix").forEach(x => x.classList.remove("actif"));
      b.classList.add("actif");
      verifFin();
    });
    $("#obDurees").appendChild(b);
  });

  /* Moments */
  DATA.moments.forEach(m => {
    const b = document.createElement("button");
    b.className = "choix";
    b.innerHTML = `<span>${m.icone}</span> ${m.label}`;
    b.addEventListener("click", () => {
      etat.prefs.moment = m.id; sauver();
      $$("#obMoments .choix").forEach(x => x.classList.remove("actif"));
      b.classList.add("actif");
      verifFin();
    });
    $("#obMoments").appendChild(b);
  });

  function verifFin() {
    $("#obFinish").disabled = !(etat.prefs.duree && etat.prefs.moment);
  }

  $("#obFinish").addEventListener("click", () => {
    etat.onboarded = true; sauver();
    $("#onboarding").classList.add("hidden");
    $("#app").classList.remove("hidden");
    montrerVue("accueil");
  });

  montrer(0);
}

/* ============================================================
   5. MOTEUR DE RECOMMANDATION
   ============================================================ */
function progressionPour(type) {
  if (type === "parcoursMode") return etat.parcoursModeFait;
  if (type === "parcours2") return etat.parcours2Fait;
  if (type === "parcoursEmotions") return etat.parcoursEmotionsFait;
  return etat.parcours1Fait;
}

function listePour(type) {
  if (type === "parcoursMode") return DATA.parcoursMode || [];
  if (type === "parcours2") return DATA.parcours2 || [];
  if (type === "parcoursEmotions") return DATA.parcoursEmotions || [];
  return DATA.parcours || [];
}

function prochaineSeance(type) {
  const liste = listePour(type);
  const faits = progressionPour(type);
  return liste.find(s => !faits.includes(s.id)) || null;
}

function prochaineSeanceParcours() {
  return prochaineSeance("parcours");
}

function prochaineSeanceParcours2() {
  return prochaineSeance("parcours2");
}

function seanceFaite(type, id) {
  return progressionPour(type).includes(id);
}

function marquerSeanceFaite(type, id) {
  const liste = progressionPour(type);
  if (!liste.includes(id)) liste.push(id);
}

function estDebloquee(type, liste, index) {
  const faits = progressionPour(type);
  return index === 0 || faits.includes(liste[index - 1].id) || faits.includes(liste[index].id);
}

/** Retrouve un contenu jouable par type + id. */
function trouverContenu(type, id) {
  if (type === "parcoursMode") return { type, item: id ? listePour(type).find(s => s.id === id) : prochaineSeance(type) };
  if (type === "parcours")  return { type, item: id ? DATA.parcours.find(s => s.id === id) : prochaineSeanceParcours() };
  if (type === "parcours2") return { type, item: id ? DATA.parcours2.find(s => s.id === id) : prochaineSeanceParcours2() };
  if (type === "parcoursEmotions") return { type, item: id ? listePour(type).find(s => s.id === id) : prochaineSeance(type) };
  if (type === "express")   return { type, item: DATA.express.find(s => s.id === id) };
  if (type === "resp")      return { type, item: DATA.respiration.find(r => r.id === id) };
  if (type === "emotion")   return { type: "meditation", item: DATA.emotions.find(e => e.id === id)?.meditation };
  return null;
}

/** Recommandation principale pour le héros de l'accueil. */
function recommandation() {
  const humeur = etat.humeurJour?.date === aujourdHui() ? etat.humeurJour.id : null;

  // Humeur difficile → priorité au besoin du moment
  if (humeur && humeur !== "bien") {
    const r = DATA.recoHumeur[humeur];
    const [type, id] = r.sugg[0];
    const c = trouverContenu(type, id);
    if (c?.item) return { ...c, raison: r.msg };
  }

  // Nouveau départ recommandé : comprendre concrètement comment méditer
  const prochaineMode = prochaineSeance("parcoursMode");
  if (prochaineMode) {
    return { type: "parcoursMode", item: prochaineMode, raison: "Apprendre concrètement comment méditer." };
  }

  // Prochaine séance du parcours 1
  const prochaine = prochaineSeanceParcours();
  if (prochaine) {
    if (prochaine.duree > etat.prefs.duree + 3) {
      return {
        type: "resp", item: DATA.respiration.find(r => r.id === "coherence"),
        raison: `Vous avez peu de temps aujourd'hui. La séance ${prochaine.num} (${prochaine.duree} min) vous attendra : essayez une respiration courte.`
      };
    }
    return { type: "parcours", item: prochaine, raison: "Votre prochaine étape du parcours." };
  }

  // Parcours 1 terminé → parcours 2 : pleine conscience au quotidien
  const prochaine2 = prochaineSeanceParcours2();
  if (prochaine2) {
    return { type: "parcours2", item: prochaine2, raison: "Nouveau parcours : la pleine conscience dans la vie ordinaire." };
  }

  // Tout terminé → pratique libre selon l'objectif
  const mapObjectif = { stress: "stress", dormir: "sommeil", concentration: "concentration", calme: "stress", decouvrir: "motivation" };
  const emo = DATA.emotions.find(e => e.id === (mapObjectif[etat.prefs.objectif] || "stress"));
  return { type: "meditation", item: emo.meditation, raison: "Parcours terminés : pratique libre adaptée à votre objectif." };
}

/* ============================================================
   6. VUE ACCUEIL
   ============================================================ */
function rendreAncreDuJour() {
  const el = $("#ancreDuJour");
  if (!el || !DATA.ancresJour) return;
  const h = new Date().getHours();
  const periode = h < 12 ? "matin" : h < 18 ? "apresmidi" : "soir";
  const ancres = DATA.ancresJour[periode];
  const graine = parseInt(aujourdHui().replaceAll("-", ""), 10);
  const ancre = ancres[graine % ancres.length];
  el.innerHTML = `<span class="ancre-jour-icone" aria-hidden="true">${ancre.icone}</span><p class="ancre-jour-texte">${ancre.texte}</p>`;
  el.classList.remove("hidden");
}

function rendreAccueil() {
  /* Salutation selon l'heure */
  const h = new Date().getHours();
  $("#salutation").textContent = h < 5 ? "Bonne nuit" : h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";

  /* Héros : progression parcours 1 + recommandation */
  const p1Faits = etat.parcours1Fait.length;
  const prochaine = prochaineSeanceParcours();
  $("#heroNum").textContent = prochaine ? prochaine.num : 14;
  const circ = 2 * Math.PI * 52;
  $("#ringProgress").style.strokeDashoffset = circ * (1 - p1Faits / DATA.parcours.length);

  const reco = recommandation();
  $("#heroEyebrow").textContent =
    reco.type === "parcoursMode" ? "Mode d'emploi" :
    reco.type === "parcours"  ? "Votre prochaine étape" :
    reco.type === "parcoursEmotions" ? "Émotions difficiles" :
    reco.type === "parcours2" ? "Pratique au quotidien" : "Recommandé pour vous";
  $("#heroTitre").textContent = reco.item.titre;
  $("#heroMeta").textContent =
    reco.type === "parcoursMode" ? `Base ${reco.item.num} · ${reco.item.duree} min` :
    reco.type === "parcours"  ? `Séance ${reco.item.num} · ${reco.item.duree} min` :
    reco.type === "parcours2" ? `Étape ${reco.item.num} · ${reco.item.duree} min` :
    reco.type === "parcoursEmotions" ? `Étape ${reco.item.num} · ${reco.item.duree} min` :
    reco.type === "resp"      ? `Respiration · ${reco.item.duree} min` :
    `${reco.item.duree} min`;
  $("#heroBtn").onclick = () => ouvrirPrepa(reco.type, reco.item);

  /* Le bandeau "💡" d'aphorismes a été retiré de l'accueil : peu actionnable et
     redondant avec l'onboarding et la pédagogie affichée avant chaque séance.
     On garde un seul bloc utile : la micro-pratique du jour (ci-dessous). */
  const micro = $("#microAccueil");
  if (micro) { micro.textContent = ""; micro.classList.add("hidden"); }

  /* Ancre du jour */
  rendreAncreDuJour();

  /* Méditation libre */
  const libreBtn = $("#libreBtn");
  if (libreBtn) libreBtn.onclick = () => ouvrirPrepa("libre", { ...ITEM_LIBRE });

  /* Express */
  const ex = $("#expressListe");
  ex.innerHTML = "";
  DATA.express.forEach(s => {
    const b = document.createElement("button");
    b.className = "express-item";
    b.innerHTML = `<span class="ic">${s.icone}</span><span class="ti">${s.titre}</span><span class="du">${s.duree} min</span>`;
    b.addEventListener("click", () => ouvrirPrepa("express", s));
    ex.appendChild(b);
  });

  /* Rappel d'ancrage comportemental (ton positif, jamais culpabilisant) */
  const moment = DATA.moments.find(m => m.id === etat.prefs.moment);
  const dejaFaitAujourdhui = etat.historique.some(e => e.date === aujourdHui());
  const anc = $("#ancrage");
  if (moment && moment.id !== "perso" && !dejaFaitAujourdhui) {
    anc.classList.remove("hidden");
    anc.textContent = `${moment.icone} Votre moment méditation : ${moment.label.toLowerCase()}. Quelques minutes suffisent.`;
  } else if (dejaFaitAujourdhui) {
    anc.classList.remove("hidden");
    anc.textContent = "🌸 Séance du jour faite. Revenez quand vous voulez, sans obligation.";
  } else {
    anc.classList.add("hidden");
  }
}

/* ============================================================
   7. VUE PARCOURS
   ============================================================ */
function rendreParcours() {
  const cont = $("#parcoursSections");
  if (!cont) return;
  cont.innerHTML = "";

  const guideBtn = $("#guideMediterBtn");
  if (guideBtn) guideBtn.onclick = () => montrerVue("guide");

  cont.appendChild(sectionParcours({
    type: "parcoursMode",
    titre: "Mode d'emploi",
    promesse: "Savoir exactement quoi faire : posture, souffle, pensées, émotions.",
    meta: "8 bases · 3 à 6 min",
    liste: DATA.parcoursMode,
    faits: etat.parcoursModeFait,
    labelProchaine: "Prochaine base"
  }));

  cont.appendChild(sectionParcours({
    type: "parcours",
    titre: "Débutant",
    promesse: "Apprendre les bases et construire une pratique solide.",
    meta: "14 séances · 3 à 12 min",
    liste: DATA.parcours,
    faits: etat.parcours1Fait,
    labelProchaine: "Prochaine séance"
  }));

  if (DATA.parcours2) {
    cont.appendChild(sectionParcours({
      type: "parcours2",
      titre: "Au quotidien",
      promesse: "Faire entrer la pleine conscience dans les gestes ordinaires.",
      meta: "7 pratiques · 2 à 5 min · yeux ouverts",
      liste: DATA.parcours2,
      faits: etat.parcours2Fait,
      labelProchaine: "Prochaine pratique"
    }));
  }

  if (DATA.parcoursEmotions) {
    cont.appendChild(sectionParcours({
      type: "parcoursEmotions",
      titre: "Émotions difficiles",
      promesse: "Traverser stress, anxiété, colère ou tristesse sans se laisser emporter.",
      meta: "8 séances · 4 à 7 min",
      liste: DATA.parcoursEmotions,
      faits: etat.parcoursEmotionsFait,
      labelProchaine: "Prochaine séance"
    }));
  }
}

function sectionParcours({ type, titre, promesse, meta, liste, faits, labelProchaine }) {
  const section = document.createElement("section");
  section.className = "parcours-section";
  const prochaine = liste.find(s => !faits.includes(s.id)) || liste[liste.length - 1];
  const termine = faits.length >= liste.length;
  const index = liste.findIndex(s => s.id === prochaine.id);
  const debloque = termine || estDebloquee(type, liste, index);

  const faitsCount = Math.min(faits.length, liste.length);
  // Unité d'étape déduite du libellé ("Prochaine séance" -> "séance", etc.)
  const unite = (labelProchaine || "étape").replace(/^Prochaine\s+/i, "").trim() || "étape";
  const uniteCap = unite.charAt(0).toUpperCase() + unite.slice(1);
  const position = index + 1; // numéro de la prochaine étape (1-based)
  const statut = termine ? "Terminé" : faitsCount === 0 ? "À commencer" : "En cours";
  const statutClasse = termine ? "termine" : faitsCount === 0 ? "neuf" : "encours";

  section.innerHTML = `
    <div class="parcours-section-entete">
      <div>
        <h2 class="parcours-section-titre">${titre}</h2>
        <p class="parcours-section-sous">${promesse}</p>
      </div>
      <span class="parcours-progression statut-${statutClasse}">${statut} · ${faitsCount}/${liste.length}</span>
    </div>
    <button class="parcours-prochaine${termine ? " fait" : ""}" ${debloque ? "" : "disabled"}>
      <span class="parcours-prochaine-label">${termine ? "Parcours terminé" : labelProchaine}</span>
      <span class="parcours-prochaine-position">${termine ? `${liste.length} / ${liste.length} étapes` : `${uniteCap} ${position} sur ${liste.length}`}</span>
      <span class="parcours-prochaine-titre">${prochaine.titre}</span>
      <span class="parcours-prochaine-meta">${meta} · ${prochaine.duree} min</span>
      <span class="parcours-prochaine-objectif">${termine ? "Vous pouvez refaire cette étape ou choisir une pratique libre." : prochaine.objectif}</span>
    </button>
    <details class="parcours-details">
      <summary>Toutes les étapes</summary>
      <ol class="parcours-liste"></ol>
    </details>`;

  const bouton = section.querySelector(".parcours-prochaine");
  if (debloque) bouton.addEventListener("click", () => ouvrirPrepa(type, prochaine));

  const ol = section.querySelector(".parcours-liste");
  liste.forEach((s, i) => {
    const fait = seanceFaite(type, s.id);
    const itemDebloque = fait || estDebloquee(type, liste, i);
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.className = "parcours-item" + (fait ? " fait" : "");
    b.disabled = !itemDebloque;
    b.innerHTML = `
      <span class="parcours-num">${fait ? "✓" : s.num}</span>
      <span class="parcours-info">
        <span class="parcours-titre">${s.titre}</span><br>
        <span class="parcours-meta">${s.duree} min · ${s.objectif}</span>
      </span>
      <span class="parcours-etat">${itemDebloque ? "›" : "🔒"}</span>`;
    if (itemDebloque) b.addEventListener("click", () => ouvrirPrepa(type, s));
    li.appendChild(b);
    ol.appendChild(li);
  });

  return section;
}

function rendreGuideMediter() {
  const cont = $("#guideMediterContenu");
  if (!cont || !DATA.commentMediter) return;
  cont.innerHTML = "";
  DATA.commentMediter.forEach(point => {
    const article = document.createElement("article");
    article.className = "guide-point";
    article.innerHTML = `
      <span class="guide-point-icone" aria-hidden="true">${point.icone}</span>
      <div>
        <h2>${point.titre}</h2>
        <p>${point.texte}</p>
      </div>`;
    cont.appendChild(article);
  });
}

/* ============================================================
   8. VUE RESPIRATION (liste)
   ============================================================ */
function rendreRespiration() {
  const cont = $("#respListe");
  cont.innerHTML = "";
  DATA.respiration.forEach(r => {
    const rythme = r.phases.map(p => p[1]).join(" / ");
    const b = document.createElement("button");
    b.className = "resp-item";
    b.innerHTML = `
      <div class="resp-haut"><span class="ic">${r.icone}</span><span class="ti">${r.titre}</span><span class="resp-rythme">${rythme}</span></div>
      <p class="resp-texte">${r.pedagogie}</p>
      <p class="resp-benef"><strong>Pour :</strong> ${r.benefices} <strong>·</strong> ${r.reco}</p>`;
    b.addEventListener("click", () => lancerSouffle(r));
    cont.appendChild(b);
  });
}

/* ============================================================
   9. BIBLIOTHÈQUE ÉMOTIONNELLE
   ============================================================ */
function rendreBiblio() {
  const grille = $("#emotionsGrille");
  const detail = $("#emotionDetail");
  detail.classList.add("hidden");
  grille.classList.remove("hidden");
  $("#vue-biblio .vue-intro").classList.remove("hidden");
  grille.innerHTML = "";
  DATA.emotions.forEach(e => {
    const b = document.createElement("button");
    b.className = "emotion-tuile";
    b.innerHTML = `<span>${e.icone}</span><span>${e.titre}</span>`;
    b.addEventListener("click", () => rendreEmotionDetail(e));
    grille.appendChild(b);
  });
}

function rendreEmotionDetail(e) {
  const grille = $("#emotionsGrille");
  const detail = $("#emotionDetail");
  grille.classList.add("hidden");
  $("#vue-biblio .vue-intro").classList.add("hidden");
  detail.classList.remove("hidden");
  detail.className = "emotion-detail";
  detail.innerHTML = `
    <div class="entete-detail">
      <button class="btn-icone" id="emoRetour" aria-label="Retour aux états">←</button>
      <h2>${e.icone} ${e.titre}</h2>
    </div>
    <div class="detail-liste" id="emoListe"></div>`;
  $("#emoRetour").addEventListener("click", rendreBiblio);

  const liste = $("#emoListe");
  /* Méditation dédiée */
  const m = e.meditation;
  liste.appendChild(itemDetail("🧘", m.titre, `${m.duree} min`, () => ouvrirPrepa("meditation", m)));
  /* Liens express / respiration */
  e.liens.forEach(id => {
    const ex = DATA.express.find(s => s.id === id);
    if (ex) { liste.appendChild(itemDetail(ex.icone, ex.titre, `${ex.duree} min`, () => ouvrirPrepa("express", ex))); return; }
    const r = DATA.respiration.find(s => s.id === id);
    if (r) liste.appendChild(itemDetail(r.icone, `Respiration : ${r.titre}`, `${r.duree} min`, () => lancerSouffle(r)));
  });
}

function itemDetail(ic, ti, du, action) {
  const b = document.createElement("button");
  b.className = "detail-item";
  b.innerHTML = `<span class="ic">${ic}</span><span class="ti">${ti}</span><span class="du">${du}</span>`;
  b.addEventListener("click", action);
  return b;
}

/* ============================================================
   10. PRÉPARATION → LECTEUR DE MÉDITATION
   ============================================================ */
let seanceCourante = null;   // { type, item }

/**
 * Génère un résumé des instructions clés du script pour que l'utilisateur
 * puisse lire comment se comporter AVANT de fermer les yeux.
 */
function rendreRecapInstructions(item) {
  const el = $("#prepaInstructions");
  if (!el) return;

  if (!item.script || item.script.length === 0) {
    el.innerHTML = "";
    return;
  }

  const tousTextes = item.script.map(([, texte]) => texte);
  const nb = tousTextes.length;

  // Sélectionner 4 à 6 messages représentatifs (début, milieu, fin)
  let indices;
  if (nb <= 5) {
    indices = tousTextes.map((_, i) => i);
  } else if (nb <= 8) {
    indices = [0, Math.floor(nb * .33), Math.floor(nb * .66), nb - 1];
  } else {
    indices = [0, Math.floor(nb * .2), Math.floor(nb * .45), Math.floor(nb * .7), nb - 1];
  }

  // Dédoublonner et garder l'ordre
  const messages = [...new Set(indices)].map(i => tousTextes[i]);

  el.innerHTML = `
    <details class="prepa-recap">
      <summary>Aperçu des instructions (${item.duree} min)</summary>
      <ol class="prepa-recap-liste">
        ${messages.map(m => `<li>${m}</li>`).join("")}
      </ol>
    </details>`;
}

function ouvrirPrepa(type, item) {
  if (type === "resp") { lancerSouffle(item); return; }

  seanceCourante = { type, item };
  $("#prepaType").textContent =
    type === "parcoursMode" ? `Mode d'emploi · base ${item.num}` :
    type === "parcours"  ? `Parcours · séance ${item.num}` :
    type === "parcours2" ? `Au quotidien · étape ${item.num}` :
    type === "parcoursEmotions" ? `Émotions difficiles · étape ${item.num}` :
    type === "express"   ? "Session express" :
    type === "libre"     ? "Méditation libre" : "Méditation";
  $("#prepaTitre").textContent = item.titre;

  /* Sélecteur de durée : visible uniquement pour la méditation libre */
  const dureeLibreEl = $("#prepaDureeLibre");
  const estLibre = type === "libre";
  if (dureeLibreEl) {
    dureeLibreEl.classList.toggle("hidden", !estLibre);
    if (estLibre) {
      /* Sélectionner la durée mémorisée dans les prefs (ou 10 min par défaut) */
      const disponibles = [5, 10, 15, 20, 30];
      const prefDuree   = etat.prefs.duree || 10;
      const defaut      = disponibles.reduce((p, c) => Math.abs(c - prefDuree) < Math.abs(p - prefDuree) ? c : p);
      $$(".duree-btn").forEach(b => b.classList.toggle("actif", +b.dataset.duree === defaut));
      seanceCourante.item = { ...item, duree: defaut };
    }
  }

  $("#prepaMeta").textContent = estLibre
    ? `${seanceCourante.item.duree} min · libre`
    : `${item.duree} min` + (item.objectif ? ` · ${item.objectif}` : "");
  $("#prepaPedagogie").textContent = item.pedagogie || "";

  /* Récap des instructions — vide pour la libre (pas de script à lire) */
  rendreRecapInstructions(estLibre ? { ...item, script: [] } : item);

  montrerVue("prepa");
}

$("#prepaCommencer").addEventListener("click", () => lancerLecteur(seanceCourante));

/* ---------- Lecteur ---------- */
const lecteur = { timer: null, ecoule: 0, total: 0, enPause: false, mp3: null, fini: false };

async function lancerLecteur({ item }) {
  /* iOS Safari : activer l'AudioContext dans la pile synchrone du geste utilisateur.
     Après un await, iOS ne considère plus l'appel comme issu d'un geste direct
     et bloque toute tentative de lecture audio. */
  try { ctxAudio(); } catch { /* ignore si Web Audio indisponible */ }
  /* iOS : boucle silencieuse pour garder la session audio active ecran verrouille. */
  demarrerKeepAlive();

  const guidage = $("#optGuidage").checked;
  const sons = $("#optSons").checked;
  const volume = $("#optVolume").value / 100;

  lecteur.fini   = false;
  lecteur.ecoule = 0;
  lecteur.total = item.duree * 60;
  lecteur.enPause = false;
  lecteur.debut = Date.now();   // horodatage de départ (horloge réelle)
  lecteur.pauseMs = 0;          // durée totale passée en pause (ms)
  lecteur.pauseDebut = null;    // début de la pause en cours (ms) ou null
  lecteur.item = item;
  lecteur.guidage = guidage;
  lecteur.sons = sons;
  lecteur.volume = volume;

  $("#lecteurTitre").textContent = item.titre;
  $("#lecteurScript").textContent = "";
  $("#lecteurTemps").textContent = mn(0);
  $("#lecteurProgress").style.width = "0%";
  $("#lecteurPause").textContent = "⏸";
  $("#lecteurPause").setAttribute("aria-label", "Mettre en pause");
  $("#lecteurHalo").classList.remove("pause");
  montrerVue("lecteur");

  // Maintenir l'écran allumé pendant la séance
  await activerWakeLock();

  /* mp3 éventuel : assets/audio/<id>.mp3 */
  lecteur.mp3 = await chargerMp3(item.id);
  if (lecteur.mp3) { lecteur.mp3.volume = volume; lecteur.mp3.play().catch(() => {}); }

  if (sons) {
    cloche(volume);
    programmerBol(lecteur.total, volume); // bol de fin sur horloge audio (iOS verrouille)
  }
  lecteur.timer = setInterval(tickLecteur, 1000);
  tickLecteur(true);
}

function tickLecteur(premier = false) {
  if (lecteur.enPause) return;
  // Temps écoulé mesuré sur l'horloge réelle (Date.now), et non sur le nombre
  // de ticks : un setInterval est gelé ou ralenti quand l'écran est verrouillé
  // ou l'app en arrière-plan. L'ancien comptage "+1 par tick" sous-estimait
  // donc le temps réel (d'où l'impression de bug sur le calcul du temps).
  const ecouleReel = Math.floor((Date.now() - lecteur.debut - lecteur.pauseMs) / 1000);
  lecteur.ecoule = Math.min(lecteur.total, Math.max(0, ecouleReel));

  $("#lecteurTemps").textContent = `${mn(lecteur.ecoule)} / ${mn(lecteur.total)}`;
  $("#lecteurProgress").style.width = `${(lecteur.ecoule / lecteur.total) * 100}%`;

  /* Affichage du script guidé : dernière ligne dont le temps est passé */
  if (lecteur.guidage && !lecteur.mp3 && lecteur.item.script) {
    const ligne = [...lecteur.item.script].reverse().find(([t]) => t <= lecteur.ecoule);
    const texte = ligne ? ligne[1] : "";
    const el = $("#lecteurScript");
    if (el.textContent !== texte) {
      el.classList.add("fondu");
      setTimeout(() => { el.textContent = texte; el.classList.remove("fondu"); }, reduitMotion ? 0 : 400);
    }
  }

  if (lecteur.ecoule >= lecteur.total) finirLecteur();
}

$("#lecteurPause").addEventListener("click", () => {
  lecteur.enPause = !lecteur.enPause;
  // Comptabiliser la durée de pause pour ne pas la compter comme du temps médité.
  if (lecteur.enPause) {
    lecteur.pauseDebut = Date.now();
  } else if (lecteur.pauseDebut) {
    lecteur.pauseMs += Date.now() - lecteur.pauseDebut;
    lecteur.pauseDebut = null;
  }
  $("#lecteurPause").textContent = lecteur.enPause ? "▶" : "⏸";
  $("#lecteurPause").setAttribute("aria-label", lecteur.enPause ? "Reprendre" : "Mettre en pause");
  $("#lecteurHalo").classList.toggle("pause", lecteur.enPause);
  if (lecteur.mp3) lecteur.enPause ? lecteur.mp3.pause() : lecteur.mp3.play().catch(() => {});
  // L horloge audio ne se met pas en pause : annuler puis replanifier le bol.
  if (lecteur.enPause) annulerBolProgramme();
  else if (lecteur.sons) programmerBol(Math.max(0, lecteur.total - lecteur.ecoule), lecteur.volume);
});

$("#lecteurQuitter").addEventListener("click", () => {
  /* Toujours revenir à l'accueil immédiatement.
     Si ≥ 30 s pratiquées : son de fin + sauvegarde silencieuse (sans écran de fin). */
  if (lecteur.fini) return;        // déjà traité (évite double appel)
  lecteur.fini = true;
  clearInterval(lecteur.timer);
  annulerBolProgramme();
  arreterKeepAlive();
  libererWakeLock();
  if (lecteur.mp3) { lecteur.mp3.pause(); lecteur.mp3 = null; }

  if (lecteur.ecoule >= 30) {
    try { if (lecteur.sons) bolTibetain(lecteur.volume); } catch { /* ignore */ }
    try {
      const minutes = Math.max(1, Math.round(lecteur.ecoule / 60));
      etat.historique.push(entreeHistorique(seanceCourante.item, minutes, seanceCourante.type));
      sauver();
    } catch { /* ignore */ }
  }
  montrerVue("accueil");
});

function stopLecteur() {
  clearInterval(lecteur.timer);
  if (lecteur.mp3) { lecteur.mp3.pause(); lecteur.mp3 = null; }
  libererWakeLock();
}

function finirLecteur(anticipe = false) {
  if (lecteur.fini) return;    // évite double déclenchement tick + bouton
  lecteur.fini = true;
  stopLecteur();
  if (anticipe) {
    // Arret manuel : annuler le bol futur, en jouer un immediat.
    annulerBolProgramme();
    if (lecteur.sons) bolTibetain(lecteur.volume);
    arreterKeepAlive();
  } else {
    // Fin naturelle : le bol planifie sonne maintenant ; laisser la
    // boucle silencieuse tourner le temps qu il resonne (8 s).
    setTimeout(arreterKeepAlive, 8000);
  }
  const minutes = Math.max(1, Math.round(lecteur.ecoule / 60));
  ouvrirFin(seanceCourante, minutes, anticipe);
}

/* ============================================================
   11. MOTEUR DE RESPIRATION
   ============================================================ */
const souffle = { timer: null, actif: false };

async function lancerSouffle(proto) {
  seanceCourante = { type: "resp", item: proto };
  souffle.actif = true;
  souffle.ecoule = 0;
  souffle.debut = Date.now();   // horloge réelle (cf. fix temps du lecteur)
  souffle.total = proto.duree * 60;
  /* iOS : debloquer l audio dans la pile du geste + boucle silencieuse. */
  try { ctxAudio(); } catch { /* ignore */ }
  demarrerKeepAlive();

  $("#souffleTitre").textContent = `${proto.icone} ${proto.titre}`;
  $("#souffleTemps").textContent = mn(0);
  montrerVue("souffle");
  cloche(.5);
  programmerBol(souffle.total, .5); // bol de fin sur horloge audio (iOS verrouille)

  // Maintenir l'écran allumé pendant l'exercice de respiration
  await activerWakeLock();

  const cercle = $("#souffleCercle");
  const consigne = $("#souffleConsigne");
  const compte = $("#souffleCompte");

  let phaseIdx = 0;
  let phaseRestant = proto.phases[0][1];

  function appliquerPhase() {
    const [label, dur] = proto.phases[phaseIdx];
    consigne.textContent = label;
    phaseRestant = dur;
    /* Animation : le cercle grandit à l'inspiration, rétrécit à l'expiration, stable en rétention */
    if (!reduitMotion) {
      cercle.style.transitionDuration = dur + "s";
      if (/inspir/i.test(label)) cercle.style.transform = "scale(1.9)";
      else if (/expir|vide/i.test(label)) cercle.style.transform = "scale(1)";
      /* rétention : on ne change rien, le cercle reste où il est */
    }
  }
  cercle.style.transform = "scale(1)";
  appliquerPhase();

  souffle.timer = setInterval(() => {
    souffle.ecoule = Math.min(souffle.total, Math.floor((Date.now() - souffle.debut) / 1000));
    phaseRestant--;
    compte.textContent = phaseRestant > 0 ? phaseRestant : "";
    $("#souffleTemps").textContent = `${mn(souffle.ecoule)} / ${mn(souffle.total)}`;

    if (phaseRestant <= 0) {
      phaseIdx = (phaseIdx + 1) % proto.phases.length;
      appliquerPhase();
    }
    if (souffle.ecoule >= souffle.total) finirSouffle();
  }, 1000);
}

function finirSouffle(anticipe = false) {
  clearInterval(souffle.timer);
  libererWakeLock();
  if (!souffle.actif) return;
  souffle.actif = false;
  if (anticipe) {
    annulerBolProgramme();
    bolTibetain(.5);          // bol immediat (arret manuel)
    arreterKeepAlive();
  } else {
    setTimeout(arreterKeepAlive, 8000); // laisser resonner le bol planifie
  }
  const minutes = Math.max(1, Math.round(souffle.ecoule / 60));
  ouvrirFin(seanceCourante, minutes, anticipe);
}

$("#souffleStop").addEventListener("click", () => finirSouffle(souffle.ecoule < souffle.total));
$("#souffleQuitter").addEventListener("click", () => {
  clearInterval(souffle.timer);
  libererWakeLock();
  if (souffle.ecoule >= 30) { souffle.actif = true; finirSouffle(true); }
  else { souffle.actif = false; annulerBolProgramme(); arreterKeepAlive(); montrerVue("accueil"); }
});

/* Au retour au premier plan : recaler la séance en cours sur l'horloge réelle.
   Si la durée totale a été atteinte pendant que l'écran était verrouillé,
   la séance se termine proprement (le temps enregistré reste juste). */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  if (lecteur.timer && !lecteur.fini && !lecteur.enPause) tickLecteur();
  if (souffle.timer && souffle.actif) {
    souffle.ecoule = Math.min(souffle.total, Math.floor((Date.now() - souffle.debut) / 1000));
    $("#souffleTemps").textContent = `${mn(souffle.ecoule)} / ${mn(souffle.total)}`;
    if (souffle.ecoule >= souffle.total) finirSouffle();
  }
});

/* ============================================================
   12. FIN DE SÉANCE
   ============================================================ */
function ouvrirFin({ type, item }, minutes, anticipe) {
  /* Message positif (jamais culpabilisant, même en cas d'arrêt anticipé) */
  $("#finMessage").textContent = anticipe
    ? "Chaque minute compte. Bien joué d'avoir pris ce temps."
    : DATA.felicitations[Math.floor(Math.random() * DATA.felicitations.length)];
  $("#finConclusion").textContent = item.conclusion || "";

  /* Enregistrement de la séance */
  const dejaFaits = etat.parcoursModeFait.length + etat.parcours1Fait.length + etat.parcours2Fait.length + etat.parcoursEmotionsFait.length;
  etat.historique.push(entreeHistorique(item, minutes, type));
  if ((type === "parcoursMode" || type === "parcours" || type === "parcours2" || type === "parcoursEmotions") && !anticipe && !seanceFaite(type, item.id)) {
    marquerSeanceFaite(type, item.id);
  }
  sauver();

  /* Stats affichées */
  const totalMin = etat.historique.reduce((a, e) => a + e.minutes, 0);
  $("#finStats").innerHTML = `
    <div><strong>${minutes} min</strong>méditées</div>
    <div><strong>${etat.historique.length}</strong>séances au total</div>
    <div><strong>${totalMin} min</strong>cumulées</div>`;

  /* Nouveau badge ? */
  const stats = statsGlobales();
  const nouveau = DATA.badges.find(b => !etat.badges.includes(b.id) && b.test(stats));
  const badgeEl = $("#finBadge");
  if (nouveau) {
    etat.badges.push(nouveau.id); sauver();
    badgeEl.classList.remove("hidden");
    badgeEl.innerHTML = `${nouveau.icone} Nouveau badge : <strong>${nouveau.titre}</strong>`;
  } else badgeEl.classList.add("hidden");

  /* Prochaine recommandation */
  const prochaine  = prochaineSeanceParcours();
  const prochaine2 = prochaineSeanceParcours2();
  let finRecoTexte;
  const vientDeTerminer = etat.parcoursModeFait.length + etat.parcours1Fait.length + etat.parcours2Fait.length + etat.parcoursEmotionsFait.length > dejaFaits;

  if (type === "parcoursMode" && vientDeTerminer) {
    const suivante = prochaineSeance("parcoursMode");
    finRecoTexte = suivante
      ? `Prochaine base débloquée : ${suivante.titre}.`
      : "Mode d'emploi terminé — vous pouvez avancer dans le parcours débutant avec des repères solides.";
  } else if (type === "parcours" && vientDeTerminer) {
    if (prochaine) {
      finRecoTexte = `Prochaine étape débloquée : séance ${prochaine.num} — ${prochaine.titre}.`;
    } else if (prochaine2) {
      finRecoTexte = `Parcours débutant terminé 🎉 Nouveau parcours disponible : "${prochaine2.titre}".`;
    } else {
      finRecoTexte = "Tous les parcours terminés — explorez la pratique libre selon vos états.";
    }
  } else if (type === "parcours2" && vientDeTerminer) {
    finRecoTexte = prochaine2
      ? `Prochaine étape débloquée : ${prochaine2.titre}.`
      : "Pratique au quotidien terminée — vous savez désormais méditer partout.";
  } else if (type === "parcoursEmotions" && vientDeTerminer) {
    const suivante = prochaineSeance("parcoursEmotions");
    finRecoTexte = suivante
      ? `Prochaine étape débloquée : ${suivante.titre}.`
      : "Parcours émotions difficiles terminé — gardez ces outils pour les moments où ça déborde.";
  } else if (prochaine) {
    finRecoTexte = `Votre prochaine étape du parcours : séance ${prochaine.num} — ${prochaine.titre}.`;
  } else if (prochaine2) {
    finRecoTexte = `Pratique au quotidien disponible : ${prochaine2.titre}.`;
  } else {
    finRecoTexte = "Explorez la pratique libre selon vos états.";
  }
  $("#finReco").textContent = finRecoTexte;

  montrerVue("fin");
}

$("#finTerminer").addEventListener("click", () => {
  sauver();
  montrerVue("accueil");
});

/* ============================================================
   13. JOURNAL DE PROGRESSION
   ============================================================ */
function statsGlobales() {
  const minutes = etat.historique.reduce((a, e) => a + e.minutes, 0);
  const dates = [...new Set(etat.historique.map(e => e.date))].sort();
  const types = new Set(etat.historique.map(e => e.type || e.id).filter(Boolean));
  const retourApres = joursRetourMax(dates);
  return {
    sessions: etat.historique.length,
    minutes,
    joursDistincts: dates.length,
    parcoursMode: etat.parcoursModeFait.length,
    parcours1: etat.parcours1Fait.length,
    parcours2: etat.parcours2Fait.length,
    parcoursEmotions: etat.parcoursEmotionsFait.length,
    tousParcours:
      etat.parcoursModeFait.length >= (DATA.parcoursMode?.length || 0) &&
      etat.parcours1Fait.length >= DATA.parcours.length &&
      etat.parcours2Fait.length >= (DATA.parcours2?.length || 0) &&
      etat.parcoursEmotionsFait.length >= (DATA.parcoursEmotions?.length || 0),
    respirations: etat.historique.filter(e => e.type === "resp").length,
    express: etat.historique.filter(e => e.type === "express").length,
    libres: etat.historique.filter(e => e.type === "libre").length,
    types: types.size,
    retour7: retourApres >= 7,
    retour14: retourApres >= 14,
    retour30: retourApres >= 30
  };
}

function joursRetourMax(dates) {
  let max = 0;
  for (let i = 1; i < dates.length; i++) {
    const precedent = new Date(`${dates[i - 1]}T00:00:00`);
    const courant = new Date(`${dates[i]}T00:00:00`);
    const ecart = Math.round((courant - precedent) / 86400000);
    if (ecart > max) max = ecart;
  }
  return max;
}

function joursPratiquesMois(annee, mois) {
  const prefix = `${annee}-${String(mois + 1).padStart(2, "0")}-`;
  return new Set(etat.historique.filter(e => e.date?.startsWith(prefix)).map(e => e.date));
}

function meilleureSerieDouce(dates) {
  if (dates.length === 0) return 0;
  let meilleur = 1;
  let courant = 1;
  for (let i = 1; i < dates.length; i++) {
    const precedent = new Date(`${dates[i - 1]}T00:00:00`);
    const jour = new Date(`${dates[i]}T00:00:00`);
    const ecart = Math.round((jour - precedent) / 86400000);
    if (ecart <= 2) courant++;
    else courant = 1;
    if (courant > meilleur) meilleur = courant;
  }
  return meilleur;
}

function formatDateCourte(dateStr) {
  if (!dateStr) return "";
  const [annee, mois, jour] = dateStr.split("-").map(Number);
  return new Date(annee, mois - 1, jour).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function libelleTypePratique(type) {
  const labels = {
    parcoursMode: "Mode d'emploi",
    parcours: "Débutant",
    parcours2: "Au quotidien",
    parcoursEmotions: "Émotions",
    resp: "Respiration",
    express: "Express",
    libre: "Libre",
    meditation: "État émotionnel"
  };
  return labels[type] || "Variée";
}

function pratiqueLaPlusFrequente(historique) {
  if (!historique.length) return "—";
  const comptes = new Map();
  historique.forEach(e => {
    const type = e.type || "meditation";
    comptes.set(type, (comptes.get(type) || 0) + 1);
  });
  const [type] = [...comptes.entries()].sort((a, b) => b[1] - a[1])[0];
  return libelleTypePratique(type);
}

/* ---------- Calendrier de pratique (navigable par mois) ---------- */
let calVue = null; // { annee, mois } du mois affiché

function decalerMois({ annee, mois }, delta) {
  const d = new Date(annee, mois + delta, 1);
  return { annee: d.getFullYear(), mois: d.getMonth() };
}

/* Bornes de navigation : du premier mois ayant une séance jusqu'au mois courant. */
function bornesCalendrier() {
  const now = new Date();
  const max = { annee: now.getFullYear(), mois: now.getMonth() };
  const dates = etat.historique.map(e => e.date).filter(Boolean).sort();
  if (!dates.length) return { min: { ...max }, max };
  const [ya, ma] = dates[0].split("-").map(Number);
  return { min: { annee: ya, mois: ma - 1 }, max };
}

function rendreCalendrier() {
  const cal = $("#calendrier");
  if (!cal) return;
  if (!calVue) { const n = new Date(); calVue = { annee: n.getFullYear(), mois: n.getMonth() }; }

  const { annee, mois } = calVue;
  const b = bornesCalendrier();
  const idx    = annee * 12 + mois;
  const idxMin = b.min.annee * 12 + b.min.mois;
  const idxMax = b.max.annee * 12 + b.max.mois;
  const peutPrec = idx > idxMin;
  const peutSuiv = idx < idxMax;

  const joursPratiques = new Set(etat.historique.map(e => e.date));
  const nbJours    = new Date(annee, mois + 1, 0).getDate();
  const premierJour = (new Date(annee, mois, 1).getDay() + 6) % 7; // lundi = 0
  const nomMois = new Date(annee, mois, 1)
    .toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  let grille = ["L", "M", "M", "J", "V", "S", "D"].map(j => `<span class="cal-entete">${j}</span>`).join("");
  for (let i = 0; i < premierJour; i++) grille += `<span></span>`;
  for (let j = 1; j <= nbJours; j++) {
    const dateStr = `${annee}-${String(mois + 1).padStart(2, "0")}-${String(j).padStart(2, "0")}`;
    const classes = ["cal-jour"];
    if (joursPratiques.has(dateStr)) classes.push("pratique");
    if (dateStr === aujourdHui()) classes.push("aujourdhui");
    grille += `<span class="${classes.join(" ")}">${j}</span>`;
  }

  cal.innerHTML = `
    <div class="cal-nav">
      <button type="button" class="cal-fleche" id="calPrec" ${peutPrec ? "" : "disabled"} aria-label="Mois précédent">‹</button>
      <span class="cal-mois">${nomMois}</span>
      <button type="button" class="cal-fleche" id="calSuiv" ${peutSuiv ? "" : "disabled"} aria-label="Mois suivant">›</button>
    </div>
    <div class="cal-grille">${grille}</div>`;

  const prec = $("#calPrec"), suiv = $("#calSuiv");
  if (prec && peutPrec) prec.onclick = () => { calVue = decalerMois(calVue, -1); rendreCalendrier(); };
  if (suiv && peutSuiv) suiv.onclick = () => { calVue = decalerMois(calVue,  1); rendreCalendrier(); };
}

function rendreJournal() {
  const s = statsGlobales();

  /* Minutes cette semaine (lundi → aujourd'hui) */
  const maintenant = new Date();
  const lundi = new Date(maintenant);
  lundi.setDate(maintenant.getDate() - ((maintenant.getDay() + 6) % 7));
  const lundiStr = dateLocaleISO(lundi);
  const minSemaine = etat.historique.filter(e => e.date >= lundiStr).reduce((a, e) => a + e.minutes, 0);
  const datesPratique = [...new Set(etat.historique.map(e => e.date))].sort();
  const joursMois = joursPratiquesMois(maintenant.getFullYear(), maintenant.getMonth());
  const moyenne = s.sessions ? Math.round(s.minutes / s.sessions) : 0;
  const derniere = [...etat.historique].sort((a, b) => (b.at || b.date).localeCompare(a.at || a.date))[0] || null;
  const pratiqueFavorite = pratiqueLaPlusFrequente(etat.historique);

  const p1Faits = etat.parcours1Fait.length;
  const p2Faits = DATA.parcours2 ? etat.parcours2Fait.length : 0;
  const modeFaits = DATA.parcoursMode ? etat.parcoursModeFait.length : 0;
  const emotionsFaits = DATA.parcoursEmotions ? etat.parcoursEmotionsFait.length : 0;
  const totalEtapes = (DATA.parcoursMode?.length || 0) + DATA.parcours.length + (DATA.parcours2?.length || 0) + (DATA.parcoursEmotions?.length || 0);
  const totalFaits = modeFaits + p1Faits + p2Faits + emotionsFaits;

  $("#statsGrille").innerHTML = `
    <div class="stat"><div class="stat-valeur">${s.sessions}</div><div class="stat-label">séances</div></div>
    <div class="stat"><div class="stat-valeur">${s.minutes} min</div><div class="stat-label">temps total médité</div></div>
    <div class="stat"><div class="stat-valeur">${minSemaine} min</div><div class="stat-label">cette semaine</div></div>
    <div class="stat"><div class="stat-valeur">${totalFaits}/${totalEtapes}</div><div class="stat-label">étapes de parcours</div></div>`;

  const rythme = $("#rythmeDoux");
  if (rythme) {
    rythme.innerHTML = `
      <div class="rythme-carte"><span class="rythme-valeur">${joursMois.size}</span><span class="rythme-label">jour(s) de pratique ce mois-ci</span></div>
      <div class="rythme-carte"><span class="rythme-valeur">${meilleureSerieDouce(datesPratique)}</span><span class="rythme-label">meilleure période souple</span></div>
      <div class="rythme-carte large"><span class="rythme-valeur">${datesPratique.includes(aujourdHui()) ? "Déjà fait" : "Disponible"}</span><span class="rythme-label">${datesPratique.includes(aujourdHui()) ? "Votre pratique du jour est là. Revenez seulement si vous en avez envie." : "Une minute suffit pour garder le lien, sans obligation."}</span></div>`;
  }

  const histo = $("#historiqueRiche");
  if (histo) {
    histo.innerHTML = `
      <div class="historique-carte large"><span class="historique-valeur">${derniere ? derniere.titre : "Aucune séance"}</span><span class="historique-label">${derniere ? `Dernière pratique · ${derniere.minutes} min · ${formatDateCourte(derniere.date)}` : "Votre historique commencera après votre première pratique."}</span></div>
      <div class="historique-carte"><span class="historique-valeur">${moyenne || "—"}</span><span class="historique-label">minute(s) en moyenne</span></div>
      <div class="historique-carte"><span class="historique-valeur">${pratiqueFavorite}</span><span class="historique-label">pratique la plus fréquente</span></div>`;
  }

  const progression = $("#progressionParcours");
  if (progression) {
    const lignes = [
      ["Mode d'emploi", modeFaits, DATA.parcoursMode?.length || 0],
      ["Débutant", p1Faits, DATA.parcours.length],
      ["Au quotidien", p2Faits, DATA.parcours2?.length || 0],
      ["Émotions difficiles", emotionsFaits, DATA.parcoursEmotions?.length || 0]
    ].filter(([, , total]) => total > 0);
    progression.innerHTML = lignes.map(([titre, fait, total]) => {
      const pct = Math.min(100, Math.round((fait / total) * 100));
      return `
        <div class="progression-item">
          <div class="progression-haut">
            <span class="progression-titre">${titre}</span>
            <span class="progression-valeur">${fait}/${total}</span>
          </div>
          <div class="progression-barre"><div class="progression-remplie" style="width:${pct}%"></div></div>
        </div>`;
    }).join("");
  }

  /* Calendrier : on (ré)ouvre toujours sur le mois en cours, puis l'utilisateur
     peut remonter vers les mois précédents qui contiennent des séances. */
  { const n = new Date(); calVue = { annee: n.getFullYear(), mois: n.getMonth() }; }
  rendreCalendrier();

  /* Badges (cliquables : une courte explication s'affiche au clic) */
  const badgesEl = $("#badges");
  if (badgesEl) {
    badgesEl.innerHTML = DATA.badges.map(b => {
      const ok = etat.badges.includes(b.id) || b.test(s);
      return `<button type="button" class="badge ${ok ? "" : "verrouille"}" data-badge="${b.id}" aria-pressed="false">` +
        `<span aria-hidden="true">${b.icone}</span><span>${b.titre}</span></button>`;
    }).join("");

    const detail = $("#badgeDetail");
    badgesEl.querySelectorAll(".badge").forEach(btn => {
      btn.addEventListener("click", () => {
        const b = DATA.badges.find(x => x.id === btn.dataset.badge);
        if (!b || !detail) return;
        const ok = etat.badges.includes(b.id) || b.test(s);
        badgesEl.querySelectorAll(".badge").forEach(x => x.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        detail.classList.remove("hidden");
        detail.innerHTML =
          `<span class="badge-detail-titre">${b.icone} ${b.titre}</span>` +
          `<span class="badge-detail-texte">${b.desc || ""}</span>` +
          `<span class="badge-detail-etat ${ok ? "obtenu" : ""}">${ok ? "✓ Obtenu" : "À débloquer"}</span>`;
      });
    });
  }
}

/* ============================================================
   14. IMPORT / EXPORT DE PROFIL
   ============================================================ */

/**
 * Exporte l'état complet dans un fichier JSON téléchargeable.
 * Format : { version, exportedAt, etat }
 */
function exporterProfil() {
  const payload = {
    version: "sereine-v2",
    exportedAt: new Date().toISOString(),
    etat
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `sereine-${aujourdHui()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function tableau(src) {
  return Array.isArray(src) ? src : [];
}

function nettoyerIds(src, prefix) {
  const re = new RegExp(`^${prefix}\\d+$`);
  return [...new Set(tableau(src).filter(id => typeof id === "string" && re.test(id)))];
}

function normaliserHistorique(src) {
  return tableau(src)
    .map(entry => {
      if (!entry || typeof entry !== "object") return null;
      const id = typeof entry.id === "string" ? entry.id : null;
      const titre = typeof entry.titre === "string" ? entry.titre : "Séance";
      const minutes = Number(entry.minutes);
      const date = typeof entry.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(entry.date)
        ? entry.date
        : aujourdHui();
      if (!id || !Number.isFinite(minutes) || minutes <= 0) return null;
      return {
        sessionId: typeof entry.sessionId === "string" ? entry.sessionId : idSession(),
        date,
        at: typeof entry.at === "string" ? entry.at : `${date}T12:00:00.000Z`,
        id,
        titre,
        minutes: Math.max(1, Math.round(minutes)),
        type: typeof entry.type === "string" ? entry.type : null
      };
    })
    .filter(Boolean);
}

function cleHistorique(entry) {
  return entry.sessionId || `${entry.date}|${entry.id}|${entry.minutes}|${entry.titre}|${entry.at}`;
}

etat = chargerEtat();

/**
 * Affiche un message de retour sous les boutons import/export.
 * @param {string} texte
 * @param {boolean} erreur
 */
function msgImport(texte, erreur = false) {
  const el = $("#importMsg");
  if (!el) return;
  el.textContent = texte;
  el.className = "import-msg" + (erreur ? " import-msg-erreur" : " import-msg-ok");
  el.classList.remove("hidden");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add("hidden"), 5000);
}

/**
 * Importe un profil depuis un fichier JSON.
 * Fusionne intelligemment : union des séances, des badges et de l'historique.
 * Les préférences et le thème du fichier importé prennent le dessus.
 */
function importerProfil(fichier) {
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const parsed = JSON.parse(evt.target.result);

      // Validation de base
      if (!parsed || typeof parsed !== "object" || !parsed.version || !parsed.etat || typeof parsed.etat !== "object") {
        msgImport("❌ Fichier invalide ou corrompu.", true);
        return;
      }

      const src = parsed.etat;
      const dateExport = parsed.exportedAt
        ? new Date(parsed.exportedAt).toLocaleDateString("fr-FR")
        : "date inconnue";

      const legacyParcours = tableau(src.parcoursFait);
      const historiqueImporte = normaliserHistorique(src.historique);
      const nbSeances  = historiqueImporte.length;
      const srcParcoursMode = nettoyerIds(src.parcoursModeFait ?? legacyParcours, "m");
      const srcParcours1 = nettoyerIds(src.parcours1Fait ?? legacyParcours, "p");
      const srcParcours2 = nettoyerIds(src.parcours2Fait ?? legacyParcours, "q");
      const srcParcoursEmotions = nettoyerIds(src.parcoursEmotionsFait ?? legacyParcours, "d");
      const nbParcoursMode = srcParcoursMode.length;
      const nbParcours1 = srcParcours1.length;
      const nbParcours2 = srcParcours2.length;
      const nbParcoursEmotions = srcParcoursEmotions.length;
      const srcBadges = nettoyerIds(src.badges, "b");
      const nbBadges = srcBadges.length;

      const confirme = window.confirm(
        `Importer la sauvegarde du ${dateExport} ?\n\n` +
        `• ${nbSeances} séance(s) dans l'historique\n` +
        `• ${nbParcoursMode}/8 base(s) du mode d'emploi\n` +
        `• ${nbParcours1}/14 étape(s) du parcours débutant\n` +
        `• ${nbParcours2}/7 pratique(s) au quotidien\n` +
        `• ${nbParcoursEmotions}/8 étape(s) émotions difficiles\n` +
        `• ${nbBadges} badge(s)\n\n` +
        `Vos données actuelles seront fusionnées avec cette sauvegarde.`
      );
      if (!confirme) return;

      // Fusion : on part des données actuelles et on complète avec l'import
      const fusionne = { ...etatDefaut, ...etat };

      // Parcours : union des ids complétés, avec compatibilité anciens exports
      const setParcoursMode = new Set([...(etat.parcoursModeFait ?? []), ...srcParcoursMode]);
      const setParcours1 = new Set([...(etat.parcours1Fait ?? []), ...srcParcours1]);
      const setParcours2 = new Set([...(etat.parcours2Fait ?? []), ...srcParcours2]);
      const setParcoursEmotions = new Set([...(etat.parcoursEmotionsFait ?? []), ...srcParcoursEmotions]);
      fusionne.parcoursModeFait = [...setParcoursMode];
      fusionne.parcours1Fait = [...setParcours1];
      fusionne.parcours2Fait = [...setParcours2];
      fusionne.parcoursEmotionsFait = [...setParcoursEmotions];
      delete fusionne.parcoursFait;

      // Badges : union
      const setBadges = new Set([...(etat.badges ?? []), ...srcBadges]);
      fusionne.badges = [...setBadges];

      // Historique : union par sessionId, avec fallback robuste pour les anciens exports.
      const mapHisto = new Map();
      [...normaliserHistorique(etat.historique), ...historiqueImporte].forEach(entry => {
        const cle = cleHistorique(entry);
        if (!mapHisto.has(cle)) mapHisto.set(cle, entry);
      });
      fusionne.historique = [...mapHisto.values()].sort((a, b) => (a.at || a.date).localeCompare(b.at || b.date));

      // Préférences : celles de l'import priment si définies
      if (src.prefs) fusionne.prefs = { ...fusionne.prefs, ...src.prefs };
      if (src.theme != null) fusionne.theme = src.theme;
      if (src.onboarded)     fusionne.onboarded = true;

      etat = fusionne;
      sauver();
      appliquerTheme();
      rendreJournal();
      msgImport(`✓ Profil importé (${nbSeances} séances, ${nbParcoursMode + nbParcours1 + nbParcours2 + nbParcoursEmotions} étapes de parcours).`);

    } catch {
      msgImport("❌ Erreur de lecture — fichier corrompu ?", true);
    }
  };
  reader.readAsText(fichier);
}

function msgAudio(texte, erreur = false) {
  const el = $("#audioTestMsg");
  if (!el) return;
  el.textContent = texte;
  el.className = "import-msg" + (erreur ? " import-msg-erreur" : " import-msg-ok");
  el.classList.remove("hidden");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add("hidden"), 7000);
}

function testerAudioFin() {
  const btn = $("#testAudioBtn");
  try {
    if (btn) btn.disabled = true;
    ctxAudio();
    demarrerKeepAlive();
    cloche(.45);
    programmerBol(1.8, .55);
    msgAudio("Test lancé : vous devez entendre une cloche, puis le bol de fin.");
    setTimeout(() => {
      arreterKeepAlive();
      if (btn) btn.disabled = false;
    }, 9500);
  } catch {
    if (btn) btn.disabled = false;
    msgAudio("Impossible de lancer le test audio sur ce navigateur.", true);
  }
}

// Branchement des boutons (exécuté une seule fois)
(function brancherSauvegarde() {
  const exportBtn   = $("#exportBtn");
  const importInput = $("#importInput");
  const resetBtn    = $("#resetBtn");
  const testAudioBtn = $("#testAudioBtn");

  if (exportBtn)   exportBtn.addEventListener("click", exporterProfil);
  if (importInput) importInput.addEventListener("change", e => {
    if (e.target.files[0]) importerProfil(e.target.files[0]);
    e.target.value = "";
  });
  if (resetBtn) resetBtn.addEventListener("click", () => {
    if (!window.confirm("Effacer toute votre progression ? Cette action est irréversible.")) return;
    etat = { ...etatDefaut, onboarded: true };
    sauver();
    rendreJournal();
    msgImport("✓ Progression effacée.");
  });
  if (testAudioBtn) testAudioBtn.addEventListener("click", testerAudioFin);
})();

/* Sélecteur de durée — méditation libre (branché une seule fois au démarrage) */
$$(".duree-btn").forEach(b => b.addEventListener("click", () => {
  $$(".duree-btn").forEach(x => x.classList.remove("actif"));
  b.classList.add("actif");
  if (seanceCourante?.type === "libre") {
    const d = +b.dataset.duree;
    seanceCourante.item = { ...seanceCourante.item, duree: d };
    etat.prefs.duree    = d;       // mémoriser le choix
    $("#prepaMeta").textContent = `${d} min · libre`;
  }
}));

/* ============================================================
   15. DÉMARRAGE
   ============================================================ */
appliquerTheme();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", appliquerTheme);

if (etat.onboarded) {
  $("#app").classList.remove("hidden");
  montrerVue("accueil");
} else {
  lancerOnboarding();
}
