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
  parcoursFait: [],             // ids des séances du parcours terminées
  historique: [],               // { date, id, titre, minutes, stress, energie, humeur }
  humeurJour: null,             // { date: "YYYY-MM-DD", id }
  badges: []                    // ids des badges obtenus
};

let etat = chargerEtat();

function chargerEtat() {
  try {
    const brut = localStorage.getItem(STORE_KEY);
    return brut ? Object.assign({}, etatDefaut, JSON.parse(brut)) : { ...etatDefaut };
  } catch { return { ...etatDefaut }; }
}
function sauver() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(etat)); } catch { /* stockage indisponible */ }
}

/* Petits utilitaires */
const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const aujourdHui = () => new Date().toISOString().slice(0, 10);
const mn = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const reduitMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   2. AUDIO — cloches synthétisées (Web Audio API)
   Aucun fichier requis. Si un mp3 existe dans assets/audio/
   avec l'id de la séance, il sera joué à la place du guidage texte.
   ============================================================ */
let audioCtx = null;
function ctxAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

/** Cloche douce : superposition de deux sinus avec longue décroissance. */
function cloche(volume = .6, grave = false) {
  try {
    const ctx = ctxAudio();
    const t = ctx.currentTime;
    [[grave ? 392 : 523.25, 1], [grave ? 587 : 784, .4]].forEach(([freq, gainRel]) => {
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
}

/** Tente de charger un mp3 (assets/audio/<id>.mp3). Renvoie un <audio> ou null. */
function chargerMp3(id) {
  return new Promise(resolve => {
    const a = new Audio(`assets/audio/${id}.mp3`);
    a.addEventListener("canplaythrough", () => resolve(a), { once: true });
    a.addEventListener("error", () => resolve(null), { once: true });
    setTimeout(() => resolve(null), 1500); // hors-ligne / absent
  });
}

/* ============================================================
   3. NAVIGATION ENTRE VUES
   ============================================================ */
function montrerVue(nom) {
  $$(".vue").forEach(v => v.classList.add("hidden"));
  const vue = $(`#vue-${nom}`);
  vue.classList.remove("hidden");
  vue.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
  $$(".nav-item").forEach(b => b.classList.toggle("nav-actif", b.dataset.vue === nom));
  const navVisible = ["accueil", "parcours", "respiration", "biblio", "journal"].includes(nom);
  $(".navbas").style.display = navVisible ? "" : "none";
  if (nom === "accueil") rendreAccueil();
  if (nom === "parcours") rendreParcours();
  if (nom === "respiration") rendreRespiration();
  if (nom === "biblio") rendreBiblio();
  if (nom === "journal") rendreJournal();
}

$$(".nav-item").forEach(b => b.addEventListener("click", () => montrerVue(b.dataset.vue)));
$$("[data-retour]").forEach(b => b.addEventListener("click", () => montrerVue("accueil")));

/* ---------- Thème ---------- */
function appliquerTheme() {
  const prefereSombre = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const sombre = etat.theme ? etat.theme === "sombre" : prefereSombre;
  document.documentElement.dataset.theme = sombre ? "sombre" : "clair";
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
function prochaineSeanceParcours() {
  return DATA.parcours.find(s => !etat.parcoursFait.includes(s.id)) || null;
}

/** Retrouve un contenu jouable par type + id. */
function trouverContenu(type, id) {
  if (type === "parcours") return { type, item: id ? DATA.parcours.find(s => s.id === id) : prochaineSeanceParcours() };
  if (type === "express")  return { type, item: DATA.express.find(s => s.id === id) };
  if (type === "resp")     return { type, item: DATA.respiration.find(r => r.id === id) };
  if (type === "emotion")  return { type: "meditation", item: DATA.emotions.find(e => e.id === id)?.meditation };
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

  // Sinon : prochaine séance du parcours
  const prochaine = prochaineSeanceParcours();
  if (prochaine) {
    // Peu de temps déclaré → proposer une alternative courte si la séance est longue
    if (prochaine.duree > etat.prefs.duree + 3) {
      return {
        type: "resp", item: DATA.respiration.find(r => r.id === "coherence"),
        raison: `Vous avez peu de temps aujourd'hui. La séance ${prochaine.num} (${prochaine.duree} min) vous attendra : essayez une respiration courte.`
      };
    }
    return { type: "parcours", item: prochaine, raison: "Votre prochaine étape du parcours." };
  }

  // Parcours terminé → rotation selon l'objectif initial
  const mapObjectif = { stress: "stress", dormir: "sommeil", concentration: "concentration", calme: "stress", decouvrir: "motivation" };
  const emo = DATA.emotions.find(e => e.id === (mapObjectif[etat.prefs.objectif] || "stress"));
  return { type: "meditation", item: emo.meditation, raison: "Parcours terminé : pratique libre adaptée à votre objectif." };
}

/* ============================================================
   6. VUE ACCUEIL
   ============================================================ */
function rendreAccueil() {
  /* Salutation selon l'heure */
  const h = new Date().getHours();
  $("#salutation").textContent = h < 5 ? "Bonne nuit" : h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";

  /* Héros : progression + recommandation */
  const faits = etat.parcoursFait.length;
  const prochaine = prochaineSeanceParcours();
  $("#heroNum").textContent = prochaine ? prochaine.num : 14;
  const circ = 2 * Math.PI * 52;
  $("#ringProgress").style.strokeDashoffset = circ * (1 - faits / DATA.parcours.length);

  const reco = recommandation();
  $("#heroEyebrow").textContent = reco.type === "parcours" ? "Votre prochaine étape" : "Recommandé pour vous";
  $("#heroTitre").textContent = reco.item.titre;
  $("#heroMeta").textContent =
    reco.type === "parcours" ? `Séance ${reco.item.num} · ${reco.item.duree} min`
    : reco.type === "resp" ? `Respiration · ${reco.item.duree} min`
    : `${reco.item.duree} min`;
  $("#heroBtn").onclick = () => ouvrirPrepa(reco.type, reco.item);

  /* Micro-apprentissage du jour (stable sur la journée) */
  const graine = parseInt(aujourdHui().replaceAll("-", ""), 10);
  $("#microAccueil").textContent = "💡 " + DATA.micro[graine % DATA.micro.length];

  /* Humeurs */
  const cont = $("#humeurs");
  cont.innerHTML = "";
  DATA.humeurs.forEach(hm => {
    const b = document.createElement("button");
    b.className = "humeur" + (etat.humeurJour?.date === aujourdHui() && etat.humeurJour.id === hm.id ? " actif" : "");
    b.innerHTML = `<span>${hm.icone}</span><span>${hm.label}</span>`;
    b.addEventListener("click", () => {
      etat.humeurJour = { date: aujourdHui(), id: hm.id };
      sauver(); rendreAccueil();
    });
    cont.appendChild(b);
  });

  /* Recommandations selon l'humeur */
  const recoBloc = $("#humeurReco");
  if (etat.humeurJour?.date === aujourdHui()) {
    const r = DATA.recoHumeur[etat.humeurJour.id];
    recoBloc.classList.remove("hidden");
    recoBloc.innerHTML = `<p>${r.msg}</p><div class="humeur-reco-boutons"></div>`;
    const btns = recoBloc.querySelector(".humeur-reco-boutons");
    r.sugg.forEach(([type, id]) => {
      const c = trouverContenu(type, id);
      if (!c?.item) return;
      const b = document.createElement("button");
      b.className = "btn btn-secondaire";
      b.textContent = `${c.item.titre} · ${c.item.duree} min`;
      b.addEventListener("click", () => ouvrirPrepa(c.type, c.item));
      btns.appendChild(b);
    });
  } else {
    recoBloc.classList.add("hidden");
  }

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
  const ol = $("#parcoursListe");
  ol.innerHTML = "";
  DATA.parcours.forEach((s, i) => {
    const fait = etat.parcoursFait.includes(s.id);
    const debloque = fait || i === 0 || etat.parcoursFait.includes(DATA.parcours[i - 1].id);
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.className = "parcours-item" + (fait ? " fait" : "");
    b.disabled = !debloque;
    b.innerHTML = `
      <span class="parcours-num">${fait ? "✓" : s.num}</span>
      <span class="parcours-info">
        <span class="parcours-titre">${s.titre}</span><br>
        <span class="parcours-meta">${s.duree} min · ${s.objectif}</span>
      </span>
      <span class="parcours-etat">${debloque ? "›" : "🔒"}</span>`;
    if (debloque) b.addEventListener("click", () => ouvrirPrepa("parcours", s));
    li.appendChild(b);
    ol.appendChild(li);
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

function ouvrirPrepa(type, item) {
  /* Les respirations ont leur propre écran dédié */
  if (type === "resp") { lancerSouffle(item); return; }

  seanceCourante = { type, item };
  $("#prepaType").textContent =
    type === "parcours" ? `Parcours · séance ${item.num}` :
    type === "express" ? "Session express" : "Méditation";
  $("#prepaTitre").textContent = item.titre;
  $("#prepaMeta").textContent = `${item.duree} min` + (item.objectif ? ` · ${item.objectif}` : "");
  $("#prepaPedagogie").textContent = item.pedagogie || "";
  montrerVue("prepa");
}

$("#prepaCommencer").addEventListener("click", () => lancerLecteur(seanceCourante));

/* ---------- Lecteur ---------- */
const lecteur = { timer: null, ecoule: 0, total: 0, enPause: false, mp3: null };

async function lancerLecteur({ item }) {
  const guidage = $("#optGuidage").checked;
  const sons = $("#optSons").checked;
  const volume = $("#optVolume").value / 100;

  lecteur.ecoule = 0;
  lecteur.total = item.duree * 60;
  lecteur.enPause = false;
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

  /* mp3 éventuel : assets/audio/<id>.mp3 */
  lecteur.mp3 = await chargerMp3(item.id);
  if (lecteur.mp3) { lecteur.mp3.volume = volume; lecteur.mp3.play().catch(() => {}); }

  if (sons) cloche(volume, false);
  lecteur.timer = setInterval(tickLecteur, 1000);
  tickLecteur(true);
}

function tickLecteur(premier = false) {
  if (lecteur.enPause) return;
  if (!premier) lecteur.ecoule++;

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
  $("#lecteurPause").textContent = lecteur.enPause ? "▶" : "⏸";
  $("#lecteurPause").setAttribute("aria-label", lecteur.enPause ? "Reprendre" : "Mettre en pause");
  $("#lecteurHalo").classList.toggle("pause", lecteur.enPause);
  if (lecteur.mp3) lecteur.enPause ? lecteur.mp3.pause() : lecteur.mp3.play().catch(() => {});
});

$("#lecteurQuitter").addEventListener("click", () => {
  /* Arrêt anticipé : la séance compte quand même (jamais culpabiliser) */
  if (lecteur.ecoule >= 30) finirLecteur(true);
  else { stopLecteur(); montrerVue("accueil"); }
});

function stopLecteur() {
  clearInterval(lecteur.timer);
  if (lecteur.mp3) { lecteur.mp3.pause(); lecteur.mp3 = null; }
}

function finirLecteur(anticipe = false) {
  stopLecteur();
  if (lecteur.sons) cloche(lecteur.volume, true);
  const minutes = Math.max(1, Math.round(lecteur.ecoule / 60));
  ouvrirFin(seanceCourante, minutes, anticipe);
}

/* ============================================================
   11. MOTEUR DE RESPIRATION
   ============================================================ */
const souffle = { timer: null, actif: false };

function lancerSouffle(proto) {
  seanceCourante = { type: "resp", item: proto };
  souffle.actif = true;
  souffle.ecoule = 0;
  souffle.total = proto.duree * 60;

  $("#souffleTitre").textContent = `${proto.icone} ${proto.titre}`;
  $("#souffleTemps").textContent = mn(0);
  montrerVue("souffle");
  cloche(.5, false);

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
    souffle.ecoule++;
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
  if (!souffle.actif) return;
  souffle.actif = false;
  cloche(.5, true);
  const minutes = Math.max(1, Math.round(souffle.ecoule / 60));
  ouvrirFin(seanceCourante, minutes, anticipe);
}

$("#souffleStop").addEventListener("click", () => finirSouffle(souffle.ecoule < souffle.total));
$("#souffleQuitter").addEventListener("click", () => {
  clearInterval(souffle.timer);
  if (souffle.ecoule >= 30) { souffle.actif = true; finirSouffle(true); }
  else { souffle.actif = false; montrerVue("accueil"); }
});

/* ============================================================
   12. FIN DE SÉANCE
   ============================================================ */
const ressentis = { stress: null, energie: null, humeur: null };

function ouvrirFin({ type, item }, minutes, anticipe) {
  /* Message positif (jamais culpabilisant, même en cas d'arrêt anticipé) */
  $("#finMessage").textContent = anticipe
    ? "Chaque minute compte. Bien joué d'avoir pris ce temps."
    : DATA.felicitations[Math.floor(Math.random() * DATA.felicitations.length)];
  $("#finConclusion").textContent = item.conclusion || "";

  /* Échelles de ressenti 1 à 5 */
  ressentis.stress = ressentis.energie = ressentis.humeur = null;
  $$(".ressenti-echelle").forEach(ech => {
    ech.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
      const b = document.createElement("button");
      b.className = "ressenti-pt";
      b.textContent = i;
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.addEventListener("click", () => {
        ressentis[ech.dataset.champ] = i;
        ech.querySelectorAll(".ressenti-pt").forEach(x => { x.classList.remove("actif"); x.setAttribute("aria-checked", "false"); });
        b.classList.add("actif");
        b.setAttribute("aria-checked", "true");
      });
      ech.appendChild(b);
    }
  });

  /* Enregistrement de la séance */
  const dejaFaits = etat.parcoursFait.length;
  etat.historique.push({ date: aujourdHui(), id: item.id, titre: item.titre, minutes });
  if (type === "parcours" && !anticipe && !etat.parcoursFait.includes(item.id)) {
    etat.parcoursFait.push(item.id);
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
  const prochaine = prochaineSeanceParcours();
  $("#finReco").textContent =
    type === "parcours" && prochaine && etat.parcoursFait.length > dejaFaits
      ? `Prochaine étape débloquée : séance ${prochaine.num} — ${prochaine.titre}.`
      : prochaine
        ? `Votre prochaine étape du parcours : séance ${prochaine.num} — ${prochaine.titre}.`
        : "Parcours terminé : explorez la pratique libre selon vos états.";

  montrerVue("fin");
}

$("#finTerminer").addEventListener("click", () => {
  /* Sauvegarde des ressentis sur la dernière entrée */
  const derniere = etat.historique[etat.historique.length - 1];
  if (derniere) Object.assign(derniere, ressentis);
  sauver();
  montrerVue("accueil");
});

/* ============================================================
   13. JOURNAL DE PROGRESSION
   ============================================================ */
function statsGlobales() {
  const minutes = etat.historique.reduce((a, e) => a + e.minutes, 0);
  const joursDistincts = new Set(etat.historique.map(e => e.date)).size;
  return { sessions: etat.historique.length, minutes, joursDistincts };
}

function rendreJournal() {
  const s = statsGlobales();

  /* Minutes cette semaine (lundi → aujourd'hui) */
  const maintenant = new Date();
  const lundi = new Date(maintenant);
  lundi.setDate(maintenant.getDate() - ((maintenant.getDay() + 6) % 7));
  const lundiStr = lundi.toISOString().slice(0, 10);
  const minSemaine = etat.historique.filter(e => e.date >= lundiStr).reduce((a, e) => a + e.minutes, 0);

  $("#statsGrille").innerHTML = `
    <div class="stat"><div class="stat-valeur">${s.sessions}</div><div class="stat-label">séances</div></div>
    <div class="stat"><div class="stat-valeur">${s.minutes} min</div><div class="stat-label">temps total médité</div></div>
    <div class="stat"><div class="stat-valeur">${minSemaine} min</div><div class="stat-label">cette semaine</div></div>
    <div class="stat"><div class="stat-valeur">${etat.parcoursFait.length}/14</div><div class="stat-label">parcours débutant</div></div>`;

  /* Graphique des ressentis : moyenne des 7 dernières entrées notées */
  const notes = etat.historique.filter(e => e.stress || e.energie || e.humeur).slice(-7);
  const graph = $("#graphRessentis");
  if (!notes.length) {
    graph.innerHTML = `<p class="graph-vide">Notez vos ressentis en fin de séance pour voir votre évolution ici.</p>`;
  } else {
    const moy = champ => {
      const vals = notes.map(e => e[champ]).filter(Boolean);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    };
    const series = [
      ["Stress", moy("stress"), "var(--bleu)"],
      ["Énergie", moy("energie"), "var(--sauge)"],
      ["Humeur", moy("humeur"), "var(--lavande)"]
    ];
    graph.innerHTML = series.map(([label, val, couleur]) => `
      <div class="graph-col">
        <span class="graph-val">${val ? val.toFixed(1) : "–"}</span>
        <div class="graph-barre" style="height:${(val / 5) * 100}%;background:${couleur}"></div>
        <span class="graph-label">${label}</span>
      </div>`).join("");
  }

  /* Calendrier du mois en cours */
  const cal = $("#calendrier");
  const annee = maintenant.getFullYear(), mois = maintenant.getMonth();
  const joursPratiques = new Set(etat.historique.map(e => e.date));
  const nbJours = new Date(annee, mois + 1, 0).getDate();
  const premierJour = (new Date(annee, mois, 1).getDay() + 6) % 7; // lundi = 0
  let html = ["L", "M", "M", "J", "V", "S", "D"].map(j => `<span class="cal-entete">${j}</span>`).join("");
  for (let i = 0; i < premierJour; i++) html += `<span></span>`;
  for (let j = 1; j <= nbJours; j++) {
    const dateStr = `${annee}-${String(mois + 1).padStart(2, "0")}-${String(j).padStart(2, "0")}`;
    const classes = ["cal-jour"];
    if (joursPratiques.has(dateStr)) classes.push("pratique");
    if (dateStr === aujourdHui()) classes.push("aujourdhui");
    html += `<span class="${classes.join(" ")}">${j}</span>`;
  }
  cal.innerHTML = html;

  /* Badges */
  $("#badges").innerHTML = DATA.badges.map(b => {
    const ok = etat.badges.includes(b.id) || b.test(s);
    return `<div class="badge ${ok ? "" : "verrouille"}"><span>${b.icone}</span><span>${b.titre}</span></div>`;
  }).join("");
}

/* ============================================================
   14. DÉMARRAGE
   ============================================================ */
appliquerTheme();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", appliquerTheme);

if (etat.onboarded) {
  $("#app").classList.remove("hidden");
  montrerVue("accueil");
} else {
  lancerOnboarding();
}
