// @ts-check
// @adr [[ADR-JS]]
// @guide [[testbrief-generator]]

/* addons/testbrief.js — Testbrief-Generator-Addon für DIN-BriefNEO.
 *
 * Kapselt die gesamte Popkultur-Testdaten-Generierung und Adressbereinigung
 * als On-Demand-Addon. Wird erst geladen, wenn der Nutzer tatsächlich auf
 * „Testbrief würfeln" klickt.
 *
 * Grundsatz: Die JSON ist die Quelle der Wahrheit. Dieses Modul erfindet nichts,
 * es bereinigt und wählt aus. Fehlt ein Fakt, entfällt die Aussage.
 */

import { Events, eventBus } from '../../js/core.js';
import { applyLetterDate } from '../../js/persistence.js';
import { SalutationEngine } from '../../js/salutation.js';

/* =========================================================================================
 * 1. REGELN & HEURISTIKEN (ADRESS- & ANKERLEITER)
 * ========================================================================================= */

/** Wendungen, die eine Anschrift verneinen statt eine zu benennen. */
const KEINE_ANSCHRIFT = /kein(?:e|en|er)?\s*fest|unterwegs|unbekannt|wandernd|replizier/i;

/** Deutsche Straßen-Suffixe (Komposita am Wortende). */
const SUFFIX_DE = /(?:weg|straße|strasse|gasse|platz|allee|boulevard|ring|damm|ufer|steig|pfad)$/i;

/** Englische Straßen-Suffixe (eigenständige Wörter). */
const SUFFIX_EN = /\b(?:street|avenue|terrace|drive|lane|road|court|circle|square|row|boulevard|place|parkway|highway)\b/i;

/**
 * Vereinheitlicht Text für Vergleiche: klein, ohne Sonderzeichen.
 * @param {unknown} wert
 * @returns {string}
 */
function normiere(wert) {
  return String(wert ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Platzhalter, die „nichts" bedeuten. */
const PLATZHALTER = new Set(['', '-', 'unbekannt', 'n/a', 'keine']);

/** Generierte Scheinanschrift: „<Eigener Name>-Residenz 1" ist erfunden, nicht belegt. */
const SCHEINANSCHRIFT = /^(.*?)-?\s*residenz\s*\d*$/i;

/** Wörter, nach denen eine Zahl Bestandteil der Bezeichnung ist (Haus 1, Raum 401). */
const BEZEICHNUNG_MIT_ZAHL = /\b(?:haus|raum|zelle|nr|no|route|bezirk|deck|flügel|etage|tor|sektor|kabinett|quartier)\.?$/i;

/**
 * Entfernt Klammerzusätze, Aufzählungen hinter einem Schrägstrich und
 * führende Feldlabels. Das ist Bereinigung, keine Erfindung.
 * @param {unknown} wert
 * @returns {string}
 */
export function bereinigeOrtsangabe(wert) {
  let v = String(wert ?? '');
  v = v.replace(/\([^)]*\)/g, ' ');
  v = v.split('/')[0];
  v = v.replace(/^\s*(?:aufenthalt|standort|ort|adresse)\s*:\s*/i, '');
  v = v.replace(/\s+/g, ' ').trim();
  return v;
}

/**
 * Erkennt, ob ein bereinigter Wert eine Straßenadresse ist (Suffix vorhanden).
 * @param {string} wert
 * @returns {boolean}
 */
export function istStrassenadresse(wert) {
  const v = String(wert ?? '').trim();
  if (!v) return false;
  const token = v.split(/[\s,.-]+/).filter(Boolean);
  if (token.some((t) => SUFFIX_DE.test(t))) return true;
  return SUFFIX_EN.test(v);
}

/**
 * Erkennt die generierte Scheinanschrift „<Eigener Name>-Residenz <n>".
 * Kanonische Bezeichnungen wie „Hokage-Residenz" oder „Broflovski-Residenz"
 * bleiben erhalten, weil ihr Stamm nicht der Figurenname ist.
 * @param {string} teil
 * @param {any} char
 * @returns {boolean}
 */
function istScheinanschrift(teil, char) {
  const treffer = teil.match(SCHEINANSCHRIFT);
  if (!treffer) return false;
  const stamm = normiere(treffer[1]);
  if (!stamm) return false;
  return [char?.name, char?.buergerlicherName].some((n) => normiere(n) === stamm);
}

/**
 * Liefert die Straßenzeile einer Figur.
 * Straßenadressen bleiben unverändert; Gebäudenamen verlieren eine angehängte
 * Nummer, wenn die Nummer nicht zur Bezeichnung gehört. Scheinanschriften und
 * Verneinungen entfallen ganz.
 * @param {any} char
 * @returns {string}
 */
export function resolveStrasse(char) {
  const roh = String(char?.strasse ?? '').trim();
  if (!roh) return '';
  const tauglich = roh
    .split('/')
    .map(bereinigeOrtsangabe)
    .find((teil) => teil
      && !istScheinanschrift(teil, char)
      && !KEINE_ANSCHRIFT.test(teil)
      && !PLATZHALTER.has(teil.toLowerCase()));
  if (!tauglich) return '';
  if (istStrassenadresse(tauglich)) return tauglich;
  const ohneZahl = tauglich.match(/^(.+?)\s+\d+[a-zA-Z]?$/);
  if (ohneZahl && !BEZEICHNUNG_MIT_ZAHL.test(ohneZahl[1]) && ohneZahl[1].trim().split(/\s+/).length > 1) {
    return ohneZahl[1].trim();
  }
  return tauglich;
}

/**
 * Liefert die Ortszeile einer Figur (bereinigt, ohne Platzhalter).
 * @param {any} char
 * @returns {string}
 */
export function resolveOrt(char) {
  const roh = String(char?.ort ?? '').trim();
  if (!roh) return '';
  const sauber = bereinigeOrtsangabe(roh);
  if (!sauber || PLATZHALTER.has(sauber.toLowerCase())) return '';
  if (KEINE_ANSCHRIFT.test(sauber)) return '';
  return sauber;
}

/** @type {WeakMap<object, string>} */
let plzWahl = new WeakMap();

/**
 * Setzt die PLZ-Wahl zurück. Wird zu Beginn jedes Testbriefs aufgerufen:
 * Eine Figur mit mehreren belegten Postleitzahlen (die Springfields) würfelt
 * so pro Brief neu, bleibt innerhalb eines Briefes aber stabil.
 * @returns {void}
 */
export function plzNeuWuerfeln() {
  plzWahl = new WeakMap();
}

/**
 * Liefert eine Postleitzahl der Figur. Mehrere belegte Werte werden mit `|`
 * getrennt — der Brief wählt eine aus und merkt sie sich für diesen Durchlauf.
 * @param {any} char
 * @returns {string}
 */
export function resolvePlz(char) {
  const roh = String(char?.plz ?? '').trim();
  if (!roh) return '';
  const teile = roh.split('|').map((t) => t.trim()).filter(Boolean);
  if (teile.length === 0) return '';
  if (typeof char !== 'object' || char === null) return teile[0];
  const gemerkt = plzWahl.get(char);
  if (gemerkt !== undefined) return gemerkt;
  const gewaehlt = teile[Math.floor(Math.random() * teile.length)] ?? teile[0];
  plzWahl.set(char, gewaehlt);
  return gewaehlt;
}

/**
 * Liefert die Ortszeile für das Anschriftfeld — PLZ und Ort.
 * Bewusst getrennt von `resolveOrt`, weil dieses auch im Fließtext steht
 * („in Springfield") und dort keine Postleitzahl tragen darf.
 * @param {any} char
 * @returns {string}
 */
export function resolveOrtZeile(char) {
  const ort = resolveOrt(char);
  const plz = resolvePlz(char);
  if (!plz) return ort;
  if (!ort) return plz;
  return `${plz} ${ort}`;
}

/**
 * Prüft, ob ein `firma`-Wert eine einzelne Organisation benennt.
 * Sammelwerte mit `;`, `/` oder „formerly/ehemalig" sind Berufs-Blobs und
 * dürfen nicht als Arbeitgeber ausgegeben werden.
 * @param {unknown} wert
 * @returns {boolean}
 */
export function istOrganisation(wert) {
  const v = String(wert ?? '').trim();
  if (!v || PLATZHALTER.has(v.toLowerCase())) return false;
  if (/[;/]/.test(v)) return false;
  if (/\b(?:formerly|ehemalig|früher|ehem\.)\b/i.test(v)) return false;
  if (v.length > 60) return false;
  return true;
}

/**
 * Liefert den Firmennamen für die Empfängerzeile — oder leer.
 * Klammerzusätze entfallen („(freelance)", „(ehemalig)").
 * @param {any} char
 * @returns {string}
 */
export function resolveFirma(char) {
  const roh = String(char?.firma ?? '').trim();
  if (!istOrganisation(roh)) return '';
  return roh.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

/**
 * Prüft, ob ein Alias nur den eigenen Namen wiederholt („Ron" für Ron Weasley,
 * „Bruce Wayne" für Batman). Solche Werte tragen kein Thema.
 * @param {string} alias
 * @param {any} char
 * @returns {boolean}
 */
function istNamenswiederholung(alias, char) {
  const bekannt = new Set(
    [char?.name, char?.buergerlicherName]
      .flatMap((n) => String(n ?? '').toLowerCase().split(/\W+/))
      .filter(Boolean)
  );
  const teile = alias.toLowerCase().split(/\W+/).filter(Boolean);
  return teile.length > 0 && teile.every((t) => bekannt.has(t));
}

/**
 * Wählt den belastbarsten Anker für den Text.
 * Reihenfolge: alias → firma (nur wenn Organisation) → hooks.
 * @param {any} char
 * @param {() => number} [rnd] Zufallsquelle, damit die Auswahl testbar bleibt.
 * @returns {{ text: string, art: 'alias'|'firma'|'hook' } | null}
 */
export function waehleAnker(char, rnd = Math.random) {
  /** @type {unknown[]} */
  const rohAlias = Array.isArray(char?.alias) ? char.alias : [];
  const alias = rohAlias
    .map((a) => String(a ?? '').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((a) => a && !PLATZHALTER.has(a.toLowerCase()) && !istNamenswiederholung(a, char));
  if (alias.length > 0) {
    return { text: alias[Math.floor(rnd() * alias.length)] ?? alias[0], art: 'alias' };
  }
  const firma = resolveFirma(char);
  if (firma) return { text: firma, art: 'firma' };
  /** @type {unknown[]} */
  const rohHooks = Array.isArray(char?.hooks) ? char.hooks : [];
  const hooks = rohHooks.map((h) => String(h ?? '').trim()).filter(Boolean);
  if (hooks.length > 0) {
    return { text: hooks[Math.floor(rnd() * hooks.length)] ?? hooks[0], art: 'hook' };
  }
  return null;
}

/**
 * Prüft, ob eine Figur einen beschreibbaren Empfängerblock ergibt.
 * Eine belegte Ortsangabe genügt: die Straßenzeile darf leer bleiben, wenn keine
 * belegte Anschrift existiert (Priorität 5 der Adressleiter).
 * @param {any} h
 * @returns {boolean}
 */
export function istBriefbar(h) {
  return Boolean(resolveOrt(h));
}

/* =========================================================================================
 * 2. FIGUREN-POOL & ASYNCHRONES LAZY LOADING
 * ========================================================================================= */

/** @type {any[] | null} */
let heroesCache = null;

/**
 * Zieht das Thema des Briefes — den Hook der Figur.
 * Reihenfolge: Hook → Alias → Organisation → Franchise.
 *
 * Hooks stehen hier zuerst, weil sie die konkretesten Gegenstände liefern
 * („Handtuch", „Batmobil"). Die Personenbezeichnung bleibt davon unberührt:
 * `bezeichne` nutzt weiterhin `waehleAnker`, und dort gilt Alias vor Hook —
 * sonst stünde im Brief „Bruce Wayne, bekannt für Doppelleben".
 *
 * @param {any} char
 * @returns {string}
 */
export function getCharHook(char) {
  /** @type {unknown[]} */
  const roh = Array.isArray(char?.hooks) ? char.hooks : [];
  const hooks = roh.map((h) => String(h ?? '').trim()).filter(Boolean);
  if (hooks.length > 0) return zufall(hooks);
  const anker = waehleAnker(char);
  if (anker) return anker.text;
  const franchise = String(char?.franchise ?? '').trim();
  return franchise || 'einer dringenden Angelegenheit';
}

/**
 * Hat die Figur mindestens einen brauchbaren Hook?
 * @param {any} char
 * @returns {boolean}
 */
export function hatHooks(char) {
  /** @type {unknown[]} */
  const roh = Array.isArray(char?.hooks) ? char.hooks : [];
  return roh.some((h) => String(h ?? '').trim() !== '');
}

/**
 * Franchises, die dasselbe Universum bezeichnen, aber anders heißen.
 * Ohne diese Tabelle schriebe „Marvel" an „Marvel Comics".
 */
const FRANCHISE_ALIAS = {
  'marvel comics': 'marvel',
  'das lied von eis und feuer': 'game of thrones',
  'bioshock infinite': 'bioshock',
  'red dead redemption 2': 'red dead redemption'
};

/**
 * Vergleichsschlüssel für „anderes Franchise". Klammerzusätze entfallen,
 * bekannt gleiche Universen werden zusammengeführt.
 * @param {any} char
 * @returns {string}
 */
export function franchiseKey(char) {
  const roh = String(char?.franchise ?? '')
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return FRANCHISE_ALIAS[/** @type {keyof typeof FRANCHISE_ALIAS} */ (roh)] ?? roh;
}

/**
 * Nennt eine Figur so, dass der Zusatz im Satz funktioniert.
 * Ersetzt die frühere Klammerform „Name (Thema)": Ein Alias wird zu
 * „auch bekannt als", eine Organisation zu „von", ein Thema zu „bekannt für"
 * und das Franchise zu „bekannt aus". Wiederholt der Zusatz nur den Namen
 * („Bulma Brief" zu „Bulma"), entfällt er.
 * @param {any} char
 * @returns {string}
 */
export function bezeichne(char) {
  const name = String(char?.buergerlicherName || char?.name || '').trim();
  if (!name) return '';
  const anker = waehleAnker(char);
  if (anker && !istNamenslangform(anker.text, name)) {
    if (anker.art === 'alias') return `${name}, auch bekannt als „${anker.text}“`;
    // "bei" passt fuer Arbeitgeber und fuer Mitgliedschaften: "bei Allsafe
    // Cybersecurity" wie "bei X-Men". "von" klang bei Teams falsch.
    if (anker.art === 'firma') return `${name} bei ${anker.text}`;
    return `${name}, bekannt für ${anker.text}`;
  }
  const franchise = String(char?.franchise ?? '').trim();
  if (franchise && !istNamenslangform(franchise, name)) {
    return `${name}, bekannt aus ${franchise}`;
  }
  return name;
}

/**
 * Erkennt „Bulma Brief" als Langform von „Bulma" — kein Alternativname.
 * @param {unknown} kandidat
 * @param {string} name
 * @returns {boolean}
 */
function istNamenslangform(kandidat, name) {
  const a = normiere(kandidat);
  const b = normiere(name);
  if (!a || !b) return false;
  return a === b || a.startsWith(`${b} `) || b.startsWith(`${a} `);
}

/* =========================================================================================
 * 2b. BRIEFKERN — SECHS SZENARIEN
 * ========================================================================================= */

/**
 * @typedef {object} BriefKontext
 * @property {string} sName  Absender, wie er im Satz funktioniert
 * @property {string} sOrt   belegter Ort des Absenders
 * @property {string} rName  Empfänger, mit Namen angesprochen
 * @property {string} rOrt   belegter Ort des Empfängers
 * @property {string} thema  der Hook des Absenders
 */

/**
 * @typedef {object} Szenario
 * @property {string} id
 * @property {(thema: string) => string} betreff
 * @property {(k: BriefKontext) => string} text
 */

/**
 * Sechs Briefgattungen. Betreff und Text stammen aus demselben Szenario, damit
 * Überschrift und Inhalt nicht auseinanderlaufen (vorher wurden sie getrennt
 * gewürfelt und passten in der Hälfte der Fälle nicht zusammen).
 *
 * Jede Stelle, an der der Hook steht, ist Doppelpunkt-Nachtrag
 * („… zum Vorgang: Handtuch"). Hooks sind nackte Nomen ohne Artikel — nach
 * „im Umgang mit" wäre jeder Kasus falsch.
 *
 * @type {Szenario[]}
 */
const SZENARIEN = [
  {
    id: 'kuendigung',
    betreff: (t) => `Außerordentliche Kündigung: ${t}`,
    text: (k) =>
      `hiermit kündige ich die zwischen uns bestehende Vereinbarung fristlos und mit sofortiger Wirkung.\n\n` +
      `Anlass ist der Vorgang: ${k.thema}. Trotz mehrfacher Aufforderung haben Sie es unterlassen, den ordnungsgemäßen Zustand herzustellen. Als ${k.sName} kann ich Ihnen aus ${k.sOrt} mitteilen, dass mir eine weitere Zusammenarbeit mit Ihnen, ${k.rName}, nicht zumutbar ist.\n\n` +
      `Ich verlange die vollständige Rückgabe binnen 14 Tagen sowie eine schriftliche Bestätigung der Vertragsauflösung.`
  },
  {
    id: 'beschwerde',
    betreff: (t) => `Dienstaufsichtsbeschwerde: ${t}`,
    text: (k) =>
      `ich wende mich mit einer förmlichen Beschwerde an Sie, ${k.rName}.\n\n` +
      `Der Vorgang: ${k.thema} ist in einem Maße eskaliert, das jeder sachlichen Grundlage entbehrt. Ihre zuständige Stelle in ${k.rOrt} hat es versäumt, die offensichtlichen Mängel zu beseitigen. Als ${k.sName} sehe ich mich aus ${k.sOrt} gezwungen, die Aufsicht einzuschalten.\n\n` +
      `Ich erwarte einen Maßnahmenkatalog bis zum Ende der Woche.`
  },
  {
    id: 'schadensersatz',
    betreff: (t) => `Schadensersatzforderung: ${t}`,
    text: (k) =>
      `hiermit mache ich Schadensersatz wegen grober Fahrlässigkeit geltend, ${k.rName}.\n\n` +
      `Im Zusammenhang mit dem Vorgang: ${k.thema} ist ein Schaden entstanden, der die zumutbare Bagatellgrenze um ein Vielfaches überschreitet. Die von Ihnen in ${k.rOrt} zu verantwortenden Umstände sind dokumentiert und beigefügt.\n\n` +
      `Ich fordere Sie zur Regulierung binnen 30 Tagen auf; andernfalls ergeht Mahnbescheid.`
  },
  {
    id: 'auskunft',
    betreff: (t) => `Auskunftsersuchen: ${t}`,
    text: (k) =>
      `ich bitte um vollumfängliche Auskunft zum Sachverhalt: ${k.thema}.\n\n` +
      `Seit dem Vorfall in ${k.rOrt} sind bei mir als ${k.sName} erhebliche Rückfragen offen. Ich setze Ihnen, ${k.rName}, hiermit eine Frist von zehn Werktagen zur schriftlichen Stellungnahme.\n\n` +
      `Nach fruchtlosem Fristablauf behalte ich mir weitere Schritte ausdrücklich vor.`
  },
  {
    id: 'abmahnung',
    betreff: (t) => `Abmahnung und Unterlassungsaufforderung: ${t}`,
    text: (k) =>
      `hiermit mahne ich Sie, ${k.rName}, wegen des Vorgangs: ${k.thema} ab.\n\n` +
      `Die mir entstandenen Ausfallzeiten und Sachschäden überschreiten das zumutbare Maß erheblich. Ich fordere Sie auf, bis spätestens Ende der Woche eine strafbewehrte Unterlassungserklärung abzugeben.\n\n` +
      `Andernfalls werde ich die Angelegenheit ohne weitere Vorwarnung rechtlich eskalieren.`
  },
  {
    id: 'kooperation',
    betreff: (t) => `Angebot einer gemeinsamen Klärung: ${t}`,
    text: (k) =>
      `ich wende mich in einer wenig alltäglichen Angelegenheit an Sie, ${k.rName}.\n\n` +
      `Seit einiger Zeit beschäftigt mich der Vorgang: ${k.thema}, und ich halte eine gemeinsame Klärung für den vernünftigsten Weg. Von ${k.sOrt} aus würde ich als ${k.sName} es begrüßen, wenn wir die offenen Fragen in Ihrem Zuständigkeitsbereich in ${k.rOrt} gemeinsam durchgehen könnten.\n\n` +
      `Ich schlage einen Termin in den kommenden zwei Wochen vor und freue mich auf Ihre Rückmeldung.`
  }
];

/**
 * Würfelt eine Briefgattung.
 * @param {() => number} [rnd] Zufallsquelle, damit die Auswahl testbar bleibt.
 * @returns {Szenario}
 */
export function waehleSzenario(rnd = Math.random) {
  return SZENARIEN[Math.floor(rnd() * SZENARIEN.length)] ?? SZENARIEN[0];
}

/**
 * Betreff zum gewürfelten Szenario.
 * @param {string} themenHook
 * @param {Szenario} [szenario] Ohne Angabe wird gewürfelt (Altverhalten).
 * @returns {string}
 */
export function randomBetreff(themenHook, szenario = waehleSzenario()) {
  return szenario.betreff(themenHook);
}

/**
 * Erzeugt den Text aus demselben Szenario wie der Betreff.
 * Die Dritten sind Zeugen beziehungsweise Beteiligte, keine Mit-Absender —
 * ein Satz am Ende genügt, unabhängig davon, ob es 0 oder 3 sind.
 * @param {any} sender
 * @param {any} recipient
 * @param {any[]} dritte
 * @param {string} themenHook
 * @param {Szenario} [szenario]
 * @returns {string}
 */
export function generateNerdText(sender, recipient, dritte, themenHook, szenario = waehleSzenario()) {
  const kontext = {
    sName: bezeichne(sender) || 'die absendende Stelle',
    sOrt: resolveOrt(sender) || 'hier',
    rName: String(recipient?.name ?? '').trim() || 'die zuständige Stelle',
    rOrt: resolveOrt(recipient) || 'Ihrem Zuständigkeitsbereich',
    thema: themenHook
  };
  const text = szenario.text(kontext);
  const beteiligte = (dritte || []).map((d) => String(d?.name ?? '').trim()).filter(Boolean);
  if (beteiligte.length === 0) return text;
  return `${text}\n\nBeteiligt sind nach meinem Kenntnisstand: ${beteiligte.join(', ')}.`;
}

/**
 * Lädt die 325 konsolidierten Figuren einmalig asynchron (Lazy Load beim ersten Klick).
 * @returns {Promise<any[] | null>}
 */
async function loadHeroes() {
  if (heroesCache) return heroesCache;
  try {
    const res = await fetch(new URL('./charactere.json', import.meta.url));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    heroesCache = Array.isArray(data) ? data : (data.figuren || []);
    return heroesCache;
  } catch (err) {
    console.error('[TestData] Fehler beim Laden der Figuren:', err);
    return null;
  }
}

/**
 * Fisher-Yates-Shuffle.
 * @param {any[]} arr
 * @returns {any[]}
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Ein Element zufällig ziehen (ohne Ausschluss-Logik, ohne globalen Zustand).
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
function zufall(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Extrahiert den Nachnamen (letztes Wort vor eventuellen Klammern).
 * @param {string} fullName
 * @returns {string}
 */
function extractNachname(fullName) {
  if (!fullName) return '';
  const clean = fullName.replace(/\s*\([^)]*\)/g, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : clean;
}

/**
 * Leitet die Anrede ab: Prüft recipient.geschlecht (m/w/d), nutzt ansonsten
 * die SalutationEngine als Fallback und endet bei neutralem DIN-Standard.
 * @param {any} _sender
 * @param {any} recipient
 * @returns {string}
 */
function deriveAnrede(_sender, recipient) {
  if (recipient?.geschlecht) {
    const nachname = extractNachname(recipient.buergerlicherName || recipient.name);
    if (recipient.geschlecht === 'm') return `Sehr geehrter Herr ${nachname},`;
    if (recipient.geschlecht === 'w') return `Sehr geehrte Frau ${nachname},`;
    if (recipient.geschlecht === 'd') return `Sehr geehrte*r ${nachname},`;
  }
  const candidate = recipient.buergerlicherName || recipient.name || '';
  const derived = SalutationEngine.derive({ rawName: candidate, formality: 'formal' });
  if (derived && derived !== 'Sehr geehrte Damen und Herren,' && derived !== 'Guten Tag,') {
    return derived;
  }
  return 'Sehr geehrte Damen und Herren,';
}

/**
 * Setzt den Textinhalt eines Elements und feuert ein bubbelndes input-Event.
 * Absätze des Brieftexts werden zu `<p>`-Kindern: `generateNerdText` liefert
 * `\n\n`, und nur echte Blöcke lassen `orphans`/`widows` je Absatz greifen.
 * (Gemessen über 6 Textlängen: Ein-Block = 6 Witwen, `<p>` = 0 bei gleicher
 * Seitenzahl.) `white-space: pre-line` bleibt als Fallback für alte Drafts.
 * @param {string} id
 * @param {string} value
 */
export function setField(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (id === 'text' && typeof value === 'string' && value.includes('\n\n')) {
    const absaetze = value.split('\n\n').filter((absatz) => absatz.trim() !== '');
    el.replaceChildren(...absaetze.map((absatz) => {
      const p = document.createElement('p');
      p.textContent = absatz;
      return p;
    }));
  } else {
    el.textContent = value || '';
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/* =========================================================================================
 * 3. EXPORTIERTE HAUPTFUNKTION
 * ========================================================================================= */

/**
 * Würfelt eine vollständige Besetzung.
 *
 * - Absender: Figur mit eigenem Hook (Fallback: alle), denn der Absender
 *   liefert das Thema des Briefes.
 * - Empfänger: aus einem anderen Franchise, damit kein Universum an sich
 *   selbst schreibt.
 * - Dritte: 0..3 aus dem Rest; sie werden im Text zu Beteiligten.
 *
 * Ausgelagert, damit die Messung (`tools/testbrief-messung.mjs`) dieselbe
 * Logik prüft wie der Klick — keine zweite Wahrheit im Testcode.
 *
 * @param {any[]} heroes
 * @returns {{ sender: any, recipient: any, dritte: any[] }}
 */
export function waehleBesetzung(heroes) {
  const usable = heroes.filter(istBriefbar);
  const mitHooks = usable.filter(hatHooks);
  const senderPool = mitHooks.length > 0 ? mitHooks : usable;
  const sender = zufall(senderPool);

  const eigenesFranchise = franchiseKey(sender);
  const fremde = usable.filter((c) => c !== sender && franchiseKey(c) !== eigenesFranchise);
  const recipientPool = fremde.length > 0 ? fremde : usable.filter((c) => c !== sender);
  const recipient = zufall(recipientPool);

  const rest = usable.filter((c) => c !== sender && c !== recipient);
  const numDritte = Math.floor(Math.random() * 4);
  return { sender, recipient, dritte: shuffle(rest).slice(0, numDritte) };
}

/**
 * Befüllt alle Felder des Briefes mit zwei Pflichtfiguren und 0..3 Dritten.
 */
export async function wuerfelTestbrief() {
  const heroes = await loadHeroes();
  if (!heroes) return;
  plzNeuWuerfeln();
  const usableHeroes = heroes.filter(istBriefbar);
  if (usableHeroes.length < 5) {
    console.warn('[TestData] Nicht genug Charaktere mit vollständigen Adressen.');
    return;
  }

  // 1. Besetzung würfeln (ausgelagert, damit die Messung dieselbe Logik prüft).
  const { sender, recipient, dritte } = waehleBesetzung(usableHeroes);

  // 2. Thema: der Hook des Absenders, nicht ein Zufallstreffer aus der Besetzung.
  const themenHook = getCharHook(sender);
  const szenario = waehleSzenario();

  const senderName = sender.buergerlicherName || sender.name;
  const recipientName = recipient.buergerlicherName || recipient.name;

  // 4. Lucky-Luke-Fix: Keine erfundenen Fallbacks
  setField('absender-name', senderName);
  setField('absender-strasse', resolveStrasse(sender));
  setField('absender-ort', resolveOrtZeile(sender));
  setField('absender-tel', '+49 228 123456-78');
  setField('absender-mail', `${senderName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@beispiel.de`);

  const rucksendeTeile = [senderName, resolveStrasse(sender), resolveOrtZeile(sender)].filter(Boolean);
  setField('rucksendeangabe', rucksendeTeile.join(' • '));

  // 5. Empfänger
  // Firmenzeile nur bei einer einzelnen belegten Organisation — kein Berufs-Blob.
  setField('empfaenger-firma', resolveFirma(recipient));
  setField('empfaenger-name', recipientName);
  setField('empfaenger-strasse', resolveStrasse(recipient));
  setField('empfaenger-ort', resolveOrtZeile(recipient));

  // 6. Briefkern
  setField('betreff', randomBetreff(themenHook, szenario));
  setField('anrede', deriveAnrede(sender, recipient));
  setField('text', generateNerdText(sender, recipient, dritte, themenHook, szenario));
  setField('grussformel', 'Mit freundlichen Grüßen');
  setField('unterschrift', senderName);
  applyLetterDate();

  // 7. Zusatzblöcke & Postvermerk zurücksetzen
  const anlagenToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
  if (anlagenToggle) {
    anlagenToggle.checked = false;
    document.getElementById('anlagen-angabe')?.replaceChildren();
  }
  const fussToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-fuss'));
  if (fussToggle) {
    fussToggle.checked = false;
  }

  const postvermerkField = document.getElementById('vermerke');
  if (postvermerkField) {
    postvermerkField.textContent = '';
    postvermerkField.removeAttribute('data-visible');
  }
  const pvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
  if (pvSelect) pvSelect.value = '';
  const triggerLabel = document.getElementById('postvermerk-trigger-label');
  if (triggerLabel) triggerLabel.textContent = '— kein —';
  const triggerBtn = document.getElementById('btn-postvermerk-trigger');
  if (triggerBtn) triggerBtn.removeAttribute('data-active');

  // 8. Entwurf persistieren
  eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
}

export { wuerfelTestbrief as starteTestbrief };
