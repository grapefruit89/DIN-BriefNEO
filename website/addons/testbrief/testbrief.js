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
import { Field } from '../../js/field.js';
import { applyLetterDate } from '../../js/format.js';
import { SalutationEngine } from '../../js/salutation.js';
import { letterState, unsetMeta } from '../../js/state.js';
import { applyValue } from '../../js/state-binding.js';

/* =========================================================================================
 * 1. REGELN & HEURISTIKEN (ADRESS- & ANKERLEITER)
 * ========================================================================================= */

/** Wendungen, die eine Anschrift verneinen statt eine zu benennen. */
const KEINE_ANSCHRIFT = /kein(?:e|en|er)?\s*fest|unterwegs|unbekannt|wandernd|replizier/i;

/** Deutsche Straßen-Suffixe (Komposita am Wortende). */
const SUFFIX_DE = /(?:weg|straße|strasse|gasse|platz|allee|boulevard|ring|damm|ufer|steig|pfad)$/i;

/** Englische Straßen-Suffixe (eigenständige Wörter). */
const SUFFIX_EN = /\b(?:street|avenue|terrace|drive|lane|road|court|circle|square|row|boulevard|place|parkway|highway|plaza|way|alley)\b/i;

/**
 * Vereinheitlicht Text für Vergleiche: klein, ohne Sonderzeichen.
 * @param {unknown} wert
 * @returns {string}
 */
function normiere(wert) {
  return String(wert ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Felder, die keine PLZ-/Ort-Erkennung ausloesen duerfen (Testbrief-Daten sind fiktiv). */
const SPERRE_FELDER = new Set(['empfaenger-ort', 'empfaenger-firma', 'absender-ort', 'rucksendeangabe']);

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
  /* Kein Nicht-Objekt-Zweig: `char?.plz` ist bei null/String bereits leer, die
     Funktion kehrt oben zurueck (toter Zweig, entfernt 2026-11-12). */
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
  /* Der Empfaenger braucht Name + Ort. Die Strasse ist bewusst NICHT
     Bedingung: `resolveStrasse` verwirft Scheinanschriften ("keine feste
     Anschrift") und liefert dann '', obwohl die Figur gueltig ist — ein
     Strassen-Kriterium wuerde solche Figuren ausschliessen, statt die Zeile
     leer zu lassen. Der Name ist Bedingung, weil ein Brief ohne Empfaengername
     unbrauchbar ist (gesehen 2026-11-12: "Paddington Bär", Name leer). */
  return Boolean(h?.name && resolveOrt(h));
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
  const name = String(char?.name || char?.buergerlicherName || '').trim();
  if (!name) return '';
  const anker = waehleAnker(char);
  if (anker && !istNamenslangform(anker.text, name)) {
    if (anker.art === 'alias') return `${name}, auch bekannt als „${anker.text}“`;
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
 * 2b. BRIEFKERN — FLOSKEL-BAUKASTEN & FÜNFZEHN SZENARIEN (NEUFASSUNG)
 * ========================================================================================= */

/**
 * Erzeugt ein stabiles, absurdes Aktenzeichen aus dem Thema.
 * Deterministisch (kein Math.random), damit derselbe Brief bei gleichem Thema
 * dasselbe Aktenzeichen trägt – und der Textvergleich im Test hält.
 * @param {string} thema
 * @returns {string}
 */
export function aktenzeichen(thema) {
  const s = String(thema ?? '');
  let h = 7;
  for (const c of s) h = (h * 31 + (c.codePointAt(0) ?? 0)) % 10000;
  const woerter = ['MORDOR', 'HANDTUCH', 'BANANE', 'TODESSTERN', 'AKTENORDNER', 'SONSTIGES'];
  return `${String(h).padStart(4, '0')}-${woerter[h % woerter.length]}/${String((h * 7) % 1000).padStart(3, '0')}`;
}

export const FLOSKELN = {
  einleitung: [
    'ich nehme Bezug auf Ihr Schreiben vom 3., Ihr Schreiben vom 4. sowie auf das Schreiben, das Sie mir versehentlich zweimal geschickt haben, und stelle fest:',
    'in der vorbezeichneten Angelegenheit ist die Akte inzwischen so umfangreich, dass sie einen eigenen Aktenschrank benötigt; ich fasse daher zusammen:',
    'nach Durchsicht aller 47 Seiten, von denen 46 Blankoseiten waren, teile ich Ihnen mit:',
    'ich hatte gehofft, diese Angelegenheit erledige sich von selbst. Sie hat sich nicht erledigt. Daher:',
    'unter Bezugnahme auf mein Schreiben, Ihr Schweigen und die daraus entstandene Rechtslage erkläre ich:',
    'die zuständige Sachbearbeitung hat mir mitgeteilt, sie sei nicht zuständig, und mich an Sie verwiesen; Sie haben mich an sie zurückverwiesen. Ich wende mich daher an den verbleibenden Empfänger:',
    'ich erlaube mir, den Vorgang in der gebotenen Kürze und der erforderlichen Ausführlichkeit zugleich darzustellen:'
  ],
  schluss: [
    'Ich bitte um Antwort innerhalb von zwei Wochen. Innerhalb von drei Wochen bitte ich um eine Erklärung, warum nicht innerhalb von zwei Wochen geantwortet wurde.',
    'Für Rückfragen stehe ich zur Verfügung, allerdings nur schriftlich, nur dienstags und nur zu Fragen, die ich bereits beantwortet habe.',
    'Sollte dieses Schreiben unbeantwortet bleiben, werde ich es als Zustimmung werten. Das ist rechtlich nicht haltbar, aber ich versuche es.',
    'Ich verbleibe mit der Bitte um ordnungsgemäße Ablage in der dafür vorgesehenen, mir unbekannten Ablage.',
    'Bitte bestätigen Sie den Eingang dieses Schreibens. Die Bestätigung der Bestätigung erhalten Sie selbstverständlich ebenfalls.',
    'Ich danke für die zügige Erledigung und weise vorsorglich darauf hin, dass „zügig“ hier nicht als dehnbarer Begriff verstanden werden sollte.',
    'Dieses Schreiben ergeht in dreifacher Ausfertigung: eine für Sie, eine für die Akte und eine für die Akte über die Akte.'
  ]
};

/**
 * Reichert einen Text optional um Einleitungs- und/oder Schlussfloskel an.
 * @param {string} text
 * @param {string | {einleitung?: boolean, schluss?: boolean}} [opt]
 * @param {() => number} [rnd]
 * @returns {string}
 */
export function floskele(text, opt = {}, rnd = Math.random) {
  const options = typeof opt === 'string' ? { [opt]: true } : (opt || {});
  let result = text;

  if (options.einleitung && FLOSKELN.einleitung.length > 0) {
    const idx = Math.floor(rnd() * FLOSKELN.einleitung.length);
    result = `${FLOSKELN.einleitung[idx]}\n\n${result}`;
  }

  if (options.schluss && FLOSKELN.schluss.length > 0) {
    const idx = Math.floor(rnd() * FLOSKELN.schluss.length);
    result = `${result}\n\n${FLOSKELN.schluss[idx]}`;
  }

  return result;
}

/**
 * @typedef {object} BriefKontext
 * @property {string} sName  Absender, wie er im Satz funktioniert
 * @property {string} sOrt   belegter Ort des Absenders
 * @property {string} rName  Empfänger, mit Namen angesprochen
 * @property {string} rOrt   belegter Ort des Empfängers
 * @property {string} thema  der Hook des Absenders
 */

/**
 * Wählt eine Betreff-Variante.
 * @param {Array<(t: string) => string>} varianten
 * @param {string} thema
 * @param {string} [fallback]
 * @param {() => number} [rnd]
 * @returns {string}
 */
function waehleBetreff(varianten, thema, fallback = '', rnd = Math.random) {
  const th = String(thema ?? '').trim();
  if (!th) return fallback;
  const tpl = varianten[Math.floor(rnd() * varianten.length)] ?? varianten[0];
  return tpl(th);
}

/**
 * @typedef {object} Szenario
 * @property {string} id
 * @property {string} kategorie
 * @property {(thema: string, rnd?: () => number) => string} betreff
 * @property {(k: BriefKontext) => string} text
 */

/**
 * Fünfzehn Briefgattungen. Reihenfolge und Kategorien sind Vertragsbestandteil:
 * `test/all.js` filtert mit rnd = 0 und erwartet bestimmte IDs.
 * @type {Szenario[]}
 */
export const SZENARIEN = [
  {
    id: 'kuendigung',
    kategorie: 'konfrontativ',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Außerordentliche Kündigung der Verwahrungsvereinbarung: ${th}`,
      (th) => `Fristlose Beendigung des Verwahrungsverhältnisses – Vorgang: ${th}`,
      (th) => `Kündigung, hilfsweise zum Monatsende, hauptsächlich sofort: ${th}`
    ], t, 'Außerordentliche Kündigung der Verwahrungsvereinbarung', rnd),
    text: (k) =>
      `hiermit kündige ich die zwischen uns bestehende Verwahrungsvereinbarung außerordentlich, fristlos und – damit keine Auslegungsspielräume bleiben – mit sofortiger Wirkung. Aktenzeichen: ${aktenzeichen(k.thema)}.\n\n` +
      `Verwahrt wurde bislang der Gegenstand „${k.thema}“. Absender dieses Schreibens: ${k.sName}; Standort: ${k.sOrt}. Die Verwahrung war als Übergangslösung gedacht, nicht als Dauerzustand mit eigener Postanschrift. Auf drei Aufforderungen, den ordnungsgemäßen Zustand herzustellen, haben Sie mit insgesamt null Stellungnahmen reagiert; ich verweise auf § 12 Abs. 1 Gegenstandsverwahrungs- und Rückgabeverordnung (GegaRüV), die diesen Fall nicht regelt, aber vortrefflich klingt.\n\n` +
      `Entgegengenommen wurde der Gegenstand seinerzeit unter der Anschrift „${k.rOrt}“; federführend war damals: ${k.rName}. Ich verlange die Rückgabe binnen 14 Tagen, montags zwischen 9:00 und 9:15 Uhr, mit Zustandsprotokoll in dreifacher Ausfertigung. Eine Rückgabe an einem anderen Wochentag gilt als nicht erfolgt.`
  },
  {
    id: 'beschwerde',
    kategorie: 'eskalierend',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Dienstaufsichtsbeschwerde wegen des Vorfalls: ${th}`,
      (th) => `Förmliche Rüge – wiederholte Pflichtverletzung im Umgang mit ${th}`,
      (th) => `Beschwerde, hiermit ernsthaft: ${th}`
    ], t, 'Dienstaufsichtsbeschwerde wegen wiederholter Pflichtverletzung', rnd),
    text: (k) =>
      `ich erhebe hiermit Beschwerde – nicht die kleine, die man nach drei Tagen vergisst, sondern die, die in der Akte bleibt.\n\n` +
      `Anlass ist der Umgang Ihrer Dienststelle mit dem Gegenstand „${k.thema}“. Ich habe die Vorfälle nummeriert, weil man mir sonst nicht glaubt: Vorfall 1 war ärgerlich, Vorfall 2 war vermeidbar, Vorfall 3 wurde von Ihnen als „Vorfall 1“ bezeichnet. Sachbearbeitung: ${k.rName}; Dienstort: ${k.rOrt}. Absenderseitig: ${k.sName}; ansässig in ${k.sOrt}. Nach § 7 Abs. 4 Verwaltungsvereinfachungsverschlimmerungsgesetz (VVVG) ist eine Beschwerde erst zulässig, wenn sie zweimal nicht bearbeitet wurde – diese Voraussetzung ist erfüllt.\n\n` +
      `Ich erwarte einen Maßnahmenkatalog bis Freitag, 12:00 Uhr, sowie die schriftliche Zusage, dass Vorfall 3 künftig als Vorfall 3 geführt wird.`
  },
  {
    id: 'schadensersatz',
    kategorie: 'semi-konfrontativ',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Schadensersatzforderung nach Beschädigung: ${th}`,
      (th) => `Geltendmachung von Ersatzansprüchen – Schadensfall ${th}`,
      (th) => `Zahlungsaufforderung mit Fristsetzung: ${th}`
    ], t, 'Geltendmachung von Ersatzansprüchen wegen Sachschadens', rnd),
    text: (k) =>
      `hiermit mache ich Schadensersatz geltend und bedaure, dass es so weit kommen musste.\n\n` +
      `Beschädigt wurde der Gegenstand „${k.thema}“ – nicht unerheblich, sondern so, dass ein Gutachten erforderlich wurde. Das Gutachten liegt bei (Anlage 1), das Gutachten über das Gutachten ebenfalls (Anlage 2), nachdem die erste Begutachtung zu dem Ergebnis kam, dass begutachtet werden müsse. Zustellanschrift der Gegenseite: „${k.rOrt}“; Zeichnung: ${k.rName}. Meine Wenigkeit: ${k.sName}; mein Standort: ${k.sOrt}. Der Schaden liegt deutlich über der Bagatellgrenze nach § 5 Abs. 3 Verordnung über die Ordnung des Sonstigen (SonstV).\n\n` +
      `Ich fordere Regulierung binnen 30 Tagen. Nach Ablauf dieser Frist ergeht Mahnbescheid, und ich verspreche Ihnen jetzt schon, dass er sorgfältig formatiert sein wird.`
  },
  {
    id: 'auskunft',
    kategorie: 'behoerdlich',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Auskunftsersuchen zum Verbleib: ${th}`,
      (th) => `Antrag auf Akteneinsicht und Sachstand – Vorgang ${th}`,
      (th) => `Amtliches Ersuchen um Auskunft, letztmalig höflich: ${th}`
    ], t, 'Auskunftsersuchen und Antrag auf Akteneinsicht', rnd),
    text: (k) =>
      `ich bitte um Auskunft zum Verbleib des Gegenstands „${k.thema}“ – um eine vollständige, nicht um die übliche. Aktenzeichen: ${aktenzeichen(k.thema)}.\n\n` +
      `Seit dem Vorfall fehlen Spur, Zwischenbericht und jeder Hinweis darauf, dass sich jemand zuständig gefühlt hätte. Auf Ihren Namen bin ich dabei gestoßen: ${k.rName}; Anschrift: ${k.rOrt}. Der Unterzeichnende – ${k.sName} – ist am Standort ${k.sOrt} erreichbar. Ich beantrage Akteneinsicht nach § 3 Abs. 11 Akteneinsichtsverwirrungsverordnung; die Verwaltungsgebühr von 12,50 € habe ich in Briefmarken beigelegt, da Ihr Formular keine anderen Zahlungswege vorsieht.\n\n` +
      `Ich setze eine Frist von zehn Werktagen. Nach fruchtlosem Ablauf behalte ich mir vor, die Auskunft erneut zu beantragen, diesmal mit Anwalt und schlechter Laune.`
  },
  {
    id: 'abmahnung',
    kategorie: 'semi-konfrontativ',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Abmahnung und Unterlassungsaufforderung: ${th}`,
      (th) => `Förmliche Abmahnung wegen unbefugter Verwendung: ${th}`,
      (th) => `Letzte außergerichtliche Aufforderung – Vorgang: ${th}`
    ], t, 'Förmliche Abmahnung und Unterlassungsaufforderung', rnd),
    text: (k) =>
      `hiermit mahne ich Sie ab – förmlich, schriftlich und mit dem Bedauern, das die Form verlangt.\n\n` +
      `Sie verwenden den Gegenstand „${k.thema}“ ohne Erlaubnis, ohne Anspruch und, soweit erkennbar, ohne Unrechtsbewusstsein. Festgestellt wurde das unter der Anschrift „${k.rOrt}“; verantwortlich zeichnet: ${k.rName}. Absender: ${k.sName}; Ort: ${k.sOrt}.\n\n` +
      `Ich fordere Sie auf, bis Ende der Woche eine strafbewehrte Unterlassungserklärung zu unterzeichnen. Die Vertragsstrafe bemesse ich in Anlehnung an § 14 Abs. 2 Intergalaktische Lärmschutzverordnung (ILärmSchV) auf die durchschnittliche Monatsmiete eines Todessterns, zahlbar sofort und ohne Abzug. Kommen Sie der Aufforderung nicht nach, eskaliere ich ohne weitere Vorwarnung; Warnungen spreche ich grundsätzlich nur einmal aus, das ist für uns beide effizienter.`
  },
  {
    id: 'kooperation',
    kategorie: 'kooperativ',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Vorschlag einer gemeinsamen Klärung: ${th}`,
      (th) => `Einladung zum Abstimmungsgespräch – Thema: ${th}`,
      (th) => `Kooperation statt weiterer Schreiben: ${th}`
    ], t, 'Vorschlag einer gemeinsamen Klärung', rnd),
    text: (k) =>
      `ich wende mich mit einem Vorschlag an Sie, der für beide Seiten unangenehm, aber machbar ist.\n\n` +
      `Seit geraumer Zeit beschäftigt uns der sachgerechte Umgang mit „${k.thema}“, und ich bin ehrlich genug zuzugeben, dass auch ich nicht mehr weiß, wer wem wann was zugesagt hat. Ihre Seite erreiche ich unter der Anschrift „${k.rOrt}“; als Zuständigen hat man mir dort genannt: ${k.rName}. Absender: ${k.sName}; Ort: ${k.sOrt}. Statt weiterer Schreiben schlage ich ein Gespräch vor: 45 Minuten, eine Tagesordnung, zwei Stühle, kein Beamer.\n\n` +
      `Als Termin schlage ich einen Dienstag in den kommenden zwei Wochen vor. Sollten Sie an einem Dienstag verhindert sein, schlage ich einen anderen Dienstag vor.`
  },
  {
    id: 'angebot',
    kategorie: 'kooperativ',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Unverbindliches Angebot zur Bereitstellung: ${th}`,
      (th) => `Leistungsumfang und Konditionen – ${th}`,
      (th) => `Angebot, freibleibend und ehrlich gemeint: ${th}`
    ], t, 'Unverbindliches Angebot über Dienstleistungen', rnd),
    text: (k) =>
      `gerne unterbreite ich Ihnen ein Angebot, das ich vorsorglich als unverbindlich bezeichne, damit wir beide etwas haben, worauf wir uns später nicht berufen können.\n\n` +
      `Gegenstand ist die Bereitstellung von „${k.thema}“ für Ihre Stelle unter der Anschrift „${k.rOrt}“, zu Händen von: ${k.rName}. Anbieter: ${k.sName}; Ort: ${k.sOrt}. Das Angebot umfasst drei Pakete: Paket A (Gegenstand, wie er ist), Paket B (Gegenstand, gereinigt) und Paket C (Gegenstand mit Bedienungsanleitung, die erfahrungsgemäß nicht gelesen wird). In allen drei Paketen ist eine Rechnung enthalten, die pünktlich kommt.\n\n` +
      `Das Angebot gilt vier Wochen. Danach gilt es weiter, allerdings mit dem Gesichtsverlust, den eine Nachfrage mit sich bringt.`
  },
  {
    id: 'bestellung',
    kategorie: 'geschaeftlich',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Verbindliche Bestellung: ${th}`,
      (th) => `Auftragserteilung gemäß Vereinbarung – Position: ${th}`,
      (th) => `Bestellung, hiermit rechtsverbindlich: ${th}`
    ], t, 'Verbindliche Bestellung gemäß Vereinbarung', rnd),
    text: (k) =>
      `hiermit bestelle ich verbindlich, unwiderruflich und in der Menge, die ich für angemessen halte.\n\n` +
      `Bestellt wird: 1 × „${k.thema}“, Lieferung an meinen Standort ${k.sOrt}, Rechnung an dieselbe Anschrift. Besteller: ${k.sName}. Die Bestellspezifikation liegt als Anlage bei; sie umfasst vier Seiten, von denen drei die Verpackung betreffen. Ihre Niederlassung unter der Anschrift „${k.rOrt}“ – Sachbearbeitung: ${k.rName} – bestätigt bitte schriftlich, dass sie lieferfähig ist. Nicht, dass sie liefern wird; dass sie könnte.\n\n` +
      `Ich erwarte eine Auftragsbestätigung binnen fünf Werktagen. Ohne Bestätigung gehe ich davon aus, dass die Bestellung erledigt ist – rechtlich falsch, praktisch bequem.`
  },
  {
    id: 'mahnung',
    kategorie: 'semi-konfrontativ',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Erste Mahnung wegen Zahlungsverzugs: ${th}`,
      (th) => `Zahlungserinnerung, Mahnstufe 1 von 14 – ${th}`,
      (th) => `Letzte Zahlungsaufforderung vor der zweiten: ${th}`
    ], t, 'Erste Mahnung wegen Zahlungsverzugs', rnd),
    text: (k) =>
      `bei Durchsicht meiner Unterlagen musste ich feststellen, dass ich die Unterlagen bereits dreimal durchgesehen habe und der Posten weiterhin offen ist.\n\n` +
      `Offen ist die Vergütung für die Überlassung von „${k.thema}“. Die Rechnung ging an Ihre Stelle unter der Anschrift „${k.rOrt}“, Bearbeitung: ${k.rName}. Gläubiger: ${k.sName}; Ort: ${k.sOrt}. Ich habe die Buchhaltung eingeschaltet; sie hat den Vorgang geprüft, für korrekt befunden und anschließend vergessen. Ich bitte daher um Begleichung binnen zehn Tagen auf das bekannte Konto, dessen Nummer Sie besser kennen als ich.\n\n` +
      `Sollte sich dieses Schreiben mit Ihrer Zahlung überschnitten haben, betrachten Sie es als gegenstandslos und mich als erleichtert.`
  },
  {
    id: 'widerspruch',
    kategorie: 'behoerdlich',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Förmlicher Widerspruch gegen den Bescheid: ${th}`,
      (th) => `Widerspruch und Antrag auf Aussetzung – Vorgang ${th}`,
      (th) => `Rechtsbehelf, form- und fristgerecht: ${th}`
    ], t, 'Förmlicher Widerspruch gegen den Bescheid', rnd),
    text: (k) =>
      `gegen den Bescheid im Vorgang „${k.thema}“ lege ich hiermit Widerspruch ein – formgerecht, fristgerecht und mit der gebotenen Missbilligung. Aktenzeichen: ${aktenzeichen(k.thema)}.\n\n` +
      `Der Bescheid stützt sich auf Ermittlungen, die keine waren: Zeugen wurden nicht vernommen, Unterlagen nicht gelesen, Rückfragen nicht gestellt. Zwei der Zeugen sind im Übrigen Drachen und standen die ganze Zeit daneben. Erlassen wurde der Bescheid unter der Anschrift „${k.rOrt}“; gezeichnet: ${k.rName}. Widerspruchsführer: ${k.sName}; Ort: ${k.sOrt}. Ich berufe mich auf § 22 Abs. 9 Bürokratieabbau-Bürokratieverordnung (BBV), die zur Vereinfachung die Vorlage des Formulars 12 b verlangt – beiliegend.\n\n` +
      `Ich beantrage die Aussetzung der Vollziehung und die Aufhebung des Bescheids. Hilfsweise beantrage ich einen verständlichen Bescheid; auch das wäre eine Verbesserung.`
  },
  {
    id: 'antrag',
    kategorie: 'behoerdlich',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Antrag auf behördliche Genehmigung: ${th}`,
      (th) => `Genehmigungsantrag nebst Anlagen – ${th}`,
      (th) => `Förmlicher Antrag, vollständig und hoffentlich ausreichend: ${th}`
    ], t, 'Antrag auf behördliche Genehmigung', rnd),
    text: (k) =>
      `hiermit beantrage ich die behördliche Genehmigung für „${k.thema}“ und versichere, alle zumutbaren Anstrengungen unternommen zu haben, das richtige Formular zu finden.\n\n` +
      `Antragsteller: ${k.sName}; Ort: ${k.sOrt}. Zuständig ist Ihre Stelle unter der Anschrift „${k.rOrt}“, nach eigener Auskunft: ${k.rName}. Die Unterlagen liegen bei: Anlage 1 bis 12; Anlage 13 fehlt, weil sie von Ihrer Stelle stammt; Anlage 14 ist ein Foto, das Anlage 13 zeigt, solange sie noch da war. Die gesetzlichen Voraussetzungen sind erfüllt – ich verweise auf § 19 Abs. 3 Zuständigkeitsvermutungsvermutung, wonach Zuständigkeit vermutet wird, solange sie nicht bestritten ist.\n\n` +
      `Ich ersuche um einen rechtsmittelfähigen Bescheid binnen drei Monaten. Ich bin in der Lage, drei Monate zu warten – aber nicht gern.`
  },
  {
    id: 'bewerbung',
    kategorie: 'persoenlich',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Initiativbewerbung mit Schwerpunkt: ${th}`,
      (th) => `Bewerbung um Mitwirkung im Bereich ${th}`,
      (th) => `Interessenbekundung, ernst gemeint: ${th}`
    ], t, 'Initiativbewerbung und Interessenbekundung', rnd),
    text: (k) =>
      `mit großem Interesse verfolge ich seit einiger Zeit, wie Ihre Stelle mit „${k.thema}“ umgeht, und ich bin überzeugt: Es braucht jemanden, der das anders macht.\n\n` +
      `Bewerber: ${k.sName}; Ort: ${k.sOrt}. Ich bringe Erfahrung im Umgang mit dem Gegenstand mit, Geduld im Umgang mit Formularen und die Bereitschaft, an Besprechungen teilzunehmen, deren Zweck sich erst in der vierten Stunde erschließt. Ihre Stelle unter der Anschrift „${k.rOrt}“ – Ansprechperson: ${k.rName} – würde von dieser Mischung profitieren, spätestens nach der Probezeit. Meine Gehaltsvorstellung orientiert sich an § 14 Abs. 2 Intergalaktische Lärmschutzverordnung, also an Ortsüblichkeit plus Zuschlag.\n\n` +
      `Über ein Gespräch freue ich mich. Kommt keines zustande, betrachte ich diese Bewerbung als Aktenbestand und mich als weiterhin interessiert.`
  },
  {
    id: 'dankesschreiben',
    kategorie: 'positiv',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Herzlichen Dank für die Unterstützung: ${th}`,
      (th) => `Dank und Anerkennung – Vorgang ${th}`,
      (th) => `Ein Lob, das Sie sich verdient haben: ${th}`
    ], t, 'Herzlichen Dank für die angenehme Zusammenarbeit', rnd),
    text: (k) =>
      `ich möchte die Gelegenheit nutzen, um mich zu bedanken – ausdrücklich, schriftlich und ohne Hintergedanken, was in dieser Korrespondenz eine Seltenheit ist.\n\n` +
      `Ihr Umgang mit „${k.thema}“ war so sorgfältig, dass ich zunächst einen Fehler vermutete. Ihre Stelle unter der Anschrift „${k.rOrt}“ hat den Vorgang bearbeitet, ohne ihn zu verlegen, zu verlieren oder an jemand anderen abzugeben; dafür gebührt Lob, und zwar zu Protokoll. Dankender: ${k.sName}; Ort: ${k.sOrt}. Namentlich gilt der Dank: ${k.rName} – offenbar hat dort jemand die Sache nicht als Zuständigkeitsfrage verstanden, sondern als Aufgabe.\n\n` +
      `Ich habe eine Urkunde in dreifacher Ausfertigung beigelegt: eine für Sie, eine für die Akte und eine für den Fall, dass die Akte verloren geht.`
  },
  {
    id: 'einladung',
    kategorie: 'positiv',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Förmliche Einladung zum Fachsymposium: ${th}`,
      (th) => `Einladung zur Fachtagung – Schwerpunktthema ${th}`,
      (th) => `Sie sind eingeladen, und zwar persönlich: ${th}`
    ], t, 'Förmliche Einladung zur Fachtagung', rnd),
    text: (k) =>
      `es ist mir eine Freude, Sie einzuladen, und eine besondere Freude, Ihnen die Tagesordnung vorab zuzusenden.\n\n` +
      `Die Tagung widmet sich dem Gegenstand „${k.thema}“ in ganzer Breite. Gastgeber: ${k.sName}; Tagungsort: ${k.sOrt}. Anmeldung bitte bei mir, nicht bei der Stelle unter der Anschrift „${k.rOrt}“, die erfahrungsgemäß weiterleitet; dort ist ${k.rName} für die Weiterleitung zuständig, was dort auch gern bestätigt wird. Tagesordnung: TOP 1 Begrüßung, TOP 2 Vortrag, TOP 3 Aussprache, TOP 4 Kaffeepause, TOP 5 Fortsetzung der Kaffeepause, TOP 6 Schlusswort.\n\n` +
      `Bitte teilen Sie mir bis Monatsende mit, ob Sie teilnehmen. Wer nicht absagt, gilt als angemeldet; wer absagt, erhält die Unterlagen trotzdem.`
  },
  {
    id: 'beschwerde_aufsicht',
    kategorie: 'eskalierend',
    betreff: (t, rnd = Math.random) => waehleBetreff([
      (th) => `Eskalationsanzeige an die Fachaufsicht: ${th}`,
      (th) => `Aufsichtsbeschwerde wegen Untätigkeit – Vorgang ${th}`,
      (th) => `Anzeige einer Anzeige: ${th}`
    ], t, 'Eskalationsanzeige an die zuständige Fachaufsicht', rnd),
    text: (k) =>
      `hiermit zeige ich an, dass ich anzeige – und zwar aus einem Grund, der sich in einem Satz zusammenfassen lässt: Es passiert nichts. Aktenzeichen: ${aktenzeichen(k.thema)}.\n\n` +
      `Im Vorgang „${k.thema}“ wurden drei Hinweise eingereicht, zweimal weitergeleitet und einmal als „erledigt“ vermerkt, ohne dass etwas erledigt worden wäre. Die Stelle unter der Anschrift „${k.rOrt}“ hat den Vorgang zuletzt an sich selbst verwiesen; gezeichnet: ${k.rName}. Anzeigender: ${k.sName}; Ort: ${k.sOrt}. Ich verweise auf § 88 Abs. 1 Satz 2 Formularvordruckverordnung (FVV), nach der ein Vorgang erst als ruhend gilt, wenn niemand mehr weiß, wo er liegt.\n\n` +
      `Ich fordere Abhilfe binnen fünf Werktagen sowie eine schriftliche Mitteilung darüber, wer ab wann zuständig war. Bleibt beides aus, fasse ich das als Zuständigkeit auf.`
  }
];

/**
 * Würfelt eine Briefgattung.
 * @param {() => number} [rnd] Zufallsquelle, damit die Auswahl testbar bleibt.
 * @param {string | null} [kategorie] Optionale Filterung nach Kategorie.
 * @returns {Szenario}
 */
export function waehleSzenario(rnd = Math.random, kategorie = null) {
  const pool = kategorie
    ? SZENARIEN.filter((s) => s.kategorie === kategorie)
    : SZENARIEN;
  const list = pool.length > 0 ? pool : SZENARIEN;
  return list[Math.floor(rnd() * list.length)] ?? list[0];
}

/**
 * Ermittelt den passenden Anlagen-Eintrag für ein Szenario.
 * Transaktionale/materielle Szenarien erhalten den Hook als reale DIN-Anlage.
 * @param {Szenario} [szenario]
 * @param {string} [themenHook]
 * @returns {string | null}
 */
export function resolveAnlagenEintrag(szenario, themenHook) {
  const th = String(themenHook ?? '').trim();
  if (!th) return null;
  switch (szenario?.id) {
    case 'kuendigung':
      return `1x ${th} (zur Rückgabe)`;
    case 'schadensersatz':
      return `1x Schadensdokumentation (${th})`;
    case 'bestellung':
      return `1x Bestellspezifikation (${th})`;
    case 'antrag':
      return `1x Nachweisdokumente (${th})`;
    default:
      return null;
  }
}

/**
 * Ermittelt den passenden DIN-Postvermerk für ein Szenario.
 * @param {Szenario} [szenario]
 * @returns {string}
 */
export function resolvePostvermerk(szenario) {
  switch (szenario?.id) {
    case 'kuendigung':
    case 'abmahnung':
    case 'beschwerde_aufsicht':
      return 'Vertraulich';
    case 'bewerbung':
      return 'Persönlich / Vertraulich';
    case 'mahnung':
    case 'widerspruch':
    case 'schadensersatz':
      return 'Einschreiben Rückschein';
    case 'beschwerde':
    case 'antrag':
      return 'Einschreiben';
    default:
      return '';
  }
}

/**
 * Betreff zum gewürfelten Szenario.
 * @param {string} themenHook
 * @param {Szenario} [szenario] Ohne Angabe wird gewürfelt (Altverhalten).
 * @param {() => number} [rnd] Optionale Zufallsquelle
 * @returns {string}
 */
/* `szenario` behaelt seinen Default: ohne ihn ist der Wert `undefined` und
   TypeScript markiert jede Nutzung. Der Default ist also kein toter Code,
   sondern die Null-Absicherung (geprueft 2026-11-12). */
export function randomBetreff(themenHook, szenario = waehleSzenario(), rnd = Math.random) {
  return szenario.betreff(themenHook, rnd);
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
 * @param {() => number} [rnd]
 * @returns {string}
 */
export function generateNerdText(sender, recipient, dritte, themenHook, szenario = waehleSzenario(), rnd = Math.random) {
  const rBase = String(recipient?.name || recipient?.buergerlicherName || '').trim();
  const rFormal = recipient?.anredePraefix ? `${recipient.anredePraefix} ${extractNachname(rBase)}` : rBase;
  const kontext = {
    sName: bezeichne(sender) || 'die absendende Stelle',
    sOrt: resolveOrt(sender) || 'hier',
    rName: rFormal || 'die zuständige Stelle',
    rOrt: resolveOrt(recipient) || 'Ihrem Zuständigkeitsbereich',
    thema: themenHook
  };
  let text = szenario.text(kontext);

  // Floskeln einstreuen (~40% Chance bei formellen Tonalitäten)
  const isFormell = szenario.kategorie !== 'positiv' && szenario.kategorie !== 'kooperativ';
  if (isFormell) {
    const einleitungAktiv = rnd() < 0.4;
    const schlussAktiv = rnd() < 0.4;
    if (einleitungAktiv || schlussAktiv) {
      text = floskele(text, { einleitung: einleitungAktiv, schluss: schlussAktiv }, rnd);
    }
  }

  const beteiligte = (dritte || []).map((d) => String(d?.name ?? '').trim()).filter(Boolean);
  if (beteiligte.length === 0) return text;
  return `${text}\n\nEine gleichlautende Durchschrift dieses Vorgangs wird zur Kenntnisnahme an ${beteiligte.join(', ')} übermittelt.`;
}

export class Figurenkatalog {
  #schema;
  #data;

  /**
   * @param {{ _meta: { schema: string[] }, figuren: any[][] }} json
   */
  constructor(json) {
    this.#schema = Object.fromEntries(json._meta.schema.map((key, idx) => [key, idx]));
    this.#data = json.figuren;
  }

  get count() {
    return this.#data.length;
  }

  /**
   * @param {number} index
   * @returns {any}
   */
  get(index) {
    const row = this.#data[index];
    if (!row) return null;
    const s = this.#schema;
    const g = row[s.geschlecht];
    return {
      name: row[s.name],
      buergerlicherName: row[s.buergerlicherName],
      alias: row[s.alias],
      geschlecht: g,
      anredePraefix: g === 'f' ? 'Frau' : (g === 'm' ? 'Herr' : ''),
      firma: row[s.firma],
      strasse: row[s.strasse],
      plz: row[s.plz],
      ort: row[s.ort],
      franchise: row[s.franchise],
      medium: row[s.medium],
      rolle: row[s.rolle],
      hinweis: row[s.hinweis],
      hooks: row[s.hooks]
    };
  }

  getRandom() {
    const idx = Math.floor(Math.random() * this.#data.length);
    return this.get(idx);
  }
}

/**
 * DIN-5008 Anschriftfeld-Renderer.
 * Erzeugt lückenlose Anschriften ohne Leerzeilen bei fehlenden Lore-Feldern.
 * @param {any} figur
 * @returns {string[]}
 */
export function buildAnschriftLines(figur) {
  const lines = [];

  // 1. Firma (durchläuft resolveFirma: nur belegte Organisationen, keine Rollen-Blobs)
  const firma = resolveFirma(figur);
  if (firma) {
    lines.push(firma);
  }

  // 2. Name mit Präfix (Herr/Frau nur bei m/f, sonst reiner Name)
  // Verwendet bewusst den Alias (figur.name), nicht den bürgerlichen Namen, weil der Testbrief-Charakter
  // die Absurdität ist. „Herr Batman" ist grammatisch falsch und soll es sein.
  const nameZeile = figur.anredePraefix 
    ? `${figur.anredePraefix} ${figur.name}` 
    : figur.name;
  if (nameZeile?.trim()) {
    lines.push(nameZeile.trim());
  }

  // 3. Straße / Zustellangabe (durchläuft resolveStrasse: Scheinanschriften, Platzhalter & Verneinungen filtern)
  const strasse = resolveStrasse(figur);
  if (strasse) {
    lines.push(strasse);
  }

  // 4. PLZ & Ort (zentral über resolveOrtZeile inkl. plzWahl-Cache)
  const ortszeile = resolveOrtZeile(figur);
  if (ortszeile) {
    lines.push(ortszeile);
  }

  // DIN 5008: Maximal 7 Zeilen in der Empfängerzone, keine Leerzeilen
  return lines.filter((l) => l.length > 0).slice(0, 7);
}

/** @type {Figurenkatalog | null} */
let figurenkatalogCache = null;

/**
 * Lädt die 297 konsolidierten Figuren einmalig asynchron (Lazy Load beim ersten Klick).
 * @returns {Promise<any[] | null>}
 */
async function loadHeroes() {
  if (heroesCache) return heroesCache;
  try {
    const res = await fetch(new URL('./figuren.json', import.meta.url));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data._meta?.schema && Array.isArray(data.figuren)) {
      figurenkatalogCache = new Figurenkatalog(data);
      heroesCache = Array.from({ length: figurenkatalogCache.count }, (_, i) => figurenkatalogCache?.get(i));
    } else {
      heroesCache = Array.isArray(data) ? data : (data.figuren || []);
    }
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
 * @param {'formal' | 'polite' | 'casual' | string} [style]
 * @returns {string}
 */
function deriveAnrede(_sender, recipient, style = 'formal') {
  const rName = recipient?.name || recipient?.buergerlicherName || '';

  /* Geschlecht ist die EINZIGE Quelle fuer Herr/Frau: es steht in
     figuren.json (m 224 / f 58 / d 15, gemessen 2026-11-12) und wird nur hier
     abgeleitet. Kein zweiter Weg, kein manuelles Setzen - der frueher hier
     stehende Zusatzcheck auf `anredePraefix` sagte dasselbe noch einmal. */
  if (recipient?.geschlecht) {
    const nachname = extractNachname(rName);
    if (recipient.geschlecht === 'm') {
      return style === 'polite' ? `Guten Tag Herr ${nachname},` : `Sehr geehrter Herr ${nachname},`;
    }
    if (recipient.geschlecht === 'f' || recipient.geschlecht === 'w') {
      return style === 'polite' ? `Guten Tag Frau ${nachname},` : `Sehr geehrte Frau ${nachname},`;
    }
    if (recipient.geschlecht === 'd') {
      if (style === 'polite') return 'Guten Tag,';
      if (style === 'casual') return 'Hallo,';
      return 'Sehr geehrte Damen und Herren,';
    }
  }

  if (style === 'casual') {
    return rName ? `Hallo ${rName},` : 'Hallo,';
  }
  if (style === 'polite') {
    return 'Guten Tag,';
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
  /* Adressfelder bekommen eine Sperre gegen die PLZ-/Ort-Erkennung: sonst
   * zieht der echte Ortsindex den fiktiven Ort glatt ("Kleve" -> "47533 Kleve")
   * oder oeffnet das Vorschlags-Popover. Die Sperre faellt beim ersten echten
   * Tastendruck wieder weg (address.js, trackManualInput). */
  if (SPERRE_FELDER.has(id)) el.setAttribute('data-autofill-aus', 'true');
  if (id === 'text' && typeof value === 'string' && value.includes('\n\n')) {
    const absaetze = value.split('\n\n').filter((absatz) => absatz.trim() !== '');
    el.replaceChildren(...absaetze.map((absatz) => {
      const p = document.createElement('p');
      Field.setValue(p, absatz);
      return p;
    }));
  } else {
    Field.setValue(el, value || '');
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/* =========================================================================================
 * 3. KONTAKT-GENERATOREN & IMMERSION
 * ========================================================================================= */

/**
 * Erzeugt einen URL- und E-Mail-konformen Slug (Kleinbuchstaben, ASCII, Trennzeichen).
 * Umlaute werden transliteriert, Sonderzeichen entfernt.
 * @param {unknown} wert
 * @param {string} [sep]
 * @returns {string}
 */
export function slugify(wert, sep = '.') {
  let s = String(wert ?? '').toLowerCase();
  s = s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  s = s.replace(/[^a-z0-9]+/g, sep);
  const esc = sep === '.' ? '\\.' : sep;
  const reD = new RegExp(`${esc}+`, 'g');
  const reE = new RegExp(`^${esc}+|${esc}+$`, 'g');
  return s.replace(reD, sep).replace(reE, '');
}

/**
 * Bereinigt Strings für E-Mail-Komponenten (nur a-z0-9, Trenner vereinheitlichen).
 * Umlaute werden DIN-gerecht transliteriert, diakritische Zeichen entfernt.
 * @param {unknown} wert
 * @returns {string}
 */
export function emailSlug(wert) {
  return String(wert ?? '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
}

/**
 * Erzeugt hochgradig abwechslungsreiche Popkultur-Mailadressen aus allen
 * verfügbaren Feldern eines Charakters (Name, bürgerlicher Name, Alias, Firma, Franchise).
 *
 * @param {any} figur
 * @param {() => number} [rnd=Math.random]
 * @returns {string}
 */
export function generiereTestEmail(figur, rnd = Math.random) {
  const pick = (/** @type {any[]} */ arr) => arr[Math.floor(rnd() * arr.length)];

  // 1. Namensfragmente sammeln (Künstlername, bürgerlicher Name, Aliase)
  const bTeile = String(figur?.buergerlicherName || '').split(/\s+/).map(emailSlug).filter(Boolean);
  const nTeile = String(figur?.name || '').split(/\s+/).map(emailSlug).filter(Boolean);
  const namen = bTeile.length >= 2 ? bTeile : (nTeile.length >= 2 ? nTeile : (bTeile.length ? bTeile : nTeile));

  const rawAlias = Array.isArray(figur?.alias) ? figur.alias : [figur?.alias];
  const aliase = [...rawAlias, (figur?.buergerlicherName && figur?.name !== figur?.buergerlicherName ? figur?.name : null)]
    .filter(Boolean)
    .map(emailSlug)
    .filter(Boolean);

  // 2. Local-Part-Pool aufbauen (Initialen, Vor-/Nachname, Aliase)
  const localPool = [];

  if (namen.length >= 2) {
    const vorname = namen[0];
    const nachname = namen[namen.length - 1];
    localPool.push(
      `${vorname}.${nachname}`,         // clark.kent
      `${vorname[0]}.${nachname}`,       // c.kent
      `${vorname}.${nachname[0]}`,       // clark.k
      `${vorname[0]}${nachname}`,        // ckent
      `${nachname}.${vorname}`          // kent.clark
    );
  } else if (namen.length === 1) {
    localPool.push(namen[0]);
  }

  // Aliase (z. B. "superman", "dark-knight") einstreuen
  for (const al of aliase) {
    localPool.push(al.replace(/-/g, '.'), al.replace(/-/g, ''));
  }

  const localPart = localPool.length > 0 ? pick(localPool) : 'kontakt';

  // 3. Domain-Pool aufbauen (Firma, Franchise, Ort, Fiktionsanker)
  const domainPool = [];

  const firma = resolveFirma(figur);
  if (firma) {
    const fSlug = emailSlug(firma).replace(/-/g, '');
    if (fSlug) domainPool.push(fSlug, `${fSlug}-corp`, `${fSlug}-holding`);
  }

  if (figur?.franchise) {
    const frSlug = emailSlug(figur.franchise);
    if (frSlug) domainPool.push(frSlug, frSlug.replace(/-/g, ''), `${frSlug}-universe`);
  }

  if (figur?.ort) {
    const ortSlug = emailSlug(String(figur.ort).split(',')[0]);
    if (ortSlug) domainPool.push(`stadt-${ortSlug}`, ortSlug);
  }

  // Fallback, falls die Figur weder Firma, Franchise noch Ort besitzt
  if (domainPool.length === 0) {
    domainPool.push('hero-post', 'brief-zustellung', 'botendienst');
  }

  const domain = pick(domainPool);

  // 4. TLDs würfeln
  const tlds = ['com', 'org', 'net', 'de', 'io', 'xyz', 'app'];
  const tld = pick(tlds);

  // 5. DIN-Infoleisten-Schutz: Gesamtlänge darf 38 Zeichen nicht überschreiten
  const domainPart = `${domain}.${tld}`;
  const maxLocalLen = Math.max(4, 38 - 1 - domainPart.length);
  const safeLocal = localPart.length > maxLocalLen
    ? localPart.slice(0, maxLocalLen).replace(/[-.]+$/, '')
    : localPart;

  return `${safeLocal}@${domainPart}`;
}

/** @type {Record<string, string>} */
const T9_MAP = {
  A: '2', B: '2', C: '2',
  D: '3', E: '3', F: '3',
  G: '4', H: '4', I: '4',
  J: '5', K: '5', L: '5',
  M: '6', N: '6', O: '6',
  P: '7', Q: '7', R: '7', S: '7',
  T: '8', U: '8', V: '8',
  W: '9', X: '9', Y: '9', Z: '9'
};

const BNETZA_DRAMA_VORWAHLEN = [
  '+49 30 23125',
  '+49 40 66969',
  '+49 69 90009',
  '+49 221 4710',
  '+49 89 99998'
];

/**
 * Wandelt einen Text via ITU-T E.161 in T9-Ziffern um.
 * @param {string} str
 * @returns {string}
 */
export function toT9(str) {
  const clean = String(str || '')
    .toUpperCase()
    .replace(/Ä/g, 'AE')
    .replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE')
    .replace(/ß/g, 'SS')
    .replace(/[^A-Z]/g, '');
  return Array.from(clean).map((c) => T9_MAP[c] || '').join('');
}

/**
 * Erzeugt eine synthetische T9-Vanity-Telefonnummer mit offizieller BNetzA-Drama-Vorwahl.
 * Die ersten 3 Ziffern des Hauptnamens bilden die Basisnummer, bis zu 4 Folgeziffern
 * die DIN-5008-Durchwahl.
 * @param {any} figur
 * @param {() => number} [rnd]
 * @returns {string}
 */
export function generiereTestTelefon(figur, rnd = Math.random) {
  const vorwahl = BNETZA_DRAMA_VORWAHLEN[Math.floor(rnd() * BNETZA_DRAMA_VORWAHLEN.length)];
  const rohName = String(figur?.name || figur?.buergerlicherName || 'DIN').trim();
  const teile = rohName.split(/\s+/).filter(Boolean);
  const haupt = teile.length > 1 ? teile[teile.length - 1] : teile[0];
  let t9 = toT9(haupt || 'DIN');
  if (t9.length < 3) t9 = t9.padEnd(3, '0');
  const basis = t9.slice(0, 3);
  let durchwahl = t9.slice(3) || '0';
  if (durchwahl.length > 4) durchwahl = durchwahl.slice(0, 4);
  return `${vorwahl} ${basis}-${durchwahl}`;
}

/**
 * Erkennt, ob zwei Figuren dieselbe Person darstellen (gleicher Name, bürgerlicher Name oder Alias).
 * Verhindert Identitätskollisionen (z. B. Batman <-> Bruce Wayne).
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export function sindIdentisch(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const namenA = [a.name, a.buergerlicherName, ...(Array.isArray(a.alias) ? a.alias : [])]
    .map(normiere).filter(Boolean);
  const namenB = [b.name, b.buergerlicherName, ...(Array.isArray(b.alias) ? b.alias : [])]
    .map(normiere).filter(Boolean);
  return namenA.some((nA) => namenB.includes(nA));
}

/**
 * Erkennt eine zulässige Figurenbeziehung innerhalb desselben Franchises (Wonka-Regel):
 * Die Firma oder der Ort der einen Figur enthält den Namen oder ein Namenselement der anderen Figur.
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export function hatWonkaBezug(a, b) {
  if (!a || !b || sindIdentisch(a, b)) return false;
  const bezugA = normiere(a.firma || a.ort);
  const bezugB = normiere(b.firma || b.ort);
  const bTokens = [b.name, b.buergerlicherName, ...(Array.isArray(b.alias) ? b.alias : [])]
    .flatMap((s) => (s ? normiere(s).split(/\s+/) : []))
    .filter((w) => w.length >= 3 && !['herr', 'frau', 'prof', 'doktor', 'doctor'].includes(w));
  const aTokens = [a.name, a.buergerlicherName, ...(Array.isArray(a.alias) ? a.alias : [])]
    .flatMap((s) => (s ? normiere(s).split(/\s+/) : []))
    .filter((w) => w.length >= 3 && !['herr', 'frau', 'prof', 'doktor', 'doctor'].includes(w));

  return bTokens.some((t) => bezugA.includes(t)) || aTokens.some((t) => bezugB.includes(t));
}

/* =========================================================================================
 * 4. EXPORTIERTE HAUPTFUNKTION
 * ========================================================================================= */

/**
 * Würfelt eine vollständige Besetzung.
 *
 * - Absender: Figur mit eigenem Hook (Fallback: alle), denn der Absender
 *   liefert das Thema des Briefes.
 * - Empfänger: aus einem anderen Franchise (oder via Wonka-Regel bei Firmenbezug),
 *   damit kein Universum an sich selbst schreibt.
 * - Identitäts-Schutz: Schließt Figuren mit identischer Identität aus (z. B. Batman <-> Bruce Wayne).
 * - Dritte: 0..3 aus dem Rest; sie werden im Text zu Beteiligten.
 *
 * Ausgelagert, damit die Messung (`tools/testbrief-messung.mjs`) dieselbe
 * Logik prüft wie der Klick — keine zweite Wahrheit im Testcode.
 *
 * @param {any[]} heroes
 * @returns {{ sender: any, recipient: any, dritte: any[] }}
 */
/**
 * Name einer Figur - Schluessel fuer das Gedaechtnis der letzten Ziehungen.
 * @param {any} c
 * @returns {string}
 */
function figurenName(c) {
  return String(c?.name ?? c?.buergerlicherName ?? '');
}

/**
 * Zuletzt gezogene Figuren meiden, damit sich der Testbrief nicht wiederholt.
 * Reines Math.random() liefert zwar gleichverteilte Namen (gemessen: 183 von
 * 297 in 300 Ziehungen), aber dieselbe Figur zweimal in Folge wirkt wie ein
 * Fehler. Faellt der Pool leer aus, gilt die ungefilterte Liste.
 * @param {any[]} liste
 * @param {string[]} vermeide
 * @returns {any[]}
 */
function ohneZuletzt(liste, vermeide) {
  if (vermeide.length === 0) return liste;
  const frisch = liste.filter((c) => !vermeide.includes(figurenName(c)));
  return frisch.length > 0 ? frisch : liste;
}

/**
 * @param {any[]} heroes
 * @param {string[]} [vermeide] Namen der zuletzt gezogenen Figuren
 */
export function waehleBesetzung(heroes, vermeide = []) {
  const usable = heroes.filter(istBriefbar);
  const mitHooks = usable.filter(hatHooks);
  const senderPool = ohneZuletzt(mitHooks.length > 0 ? mitHooks : usable, vermeide);
  const sender = zufall(senderPool);

  const eigenesFranchise = franchiseKey(sender);
  const erlaubteEmpfaenger = usable.filter(
    (c) => c !== sender && !sindIdentisch(sender, c) && (franchiseKey(c) !== eigenesFranchise || hatWonkaBezug(sender, c))
  );
  /* Fallback-Kette: wenn die strenge Liste leer ist (kleiner Pool, ein
     Franchise), darf der Empfaenger nicht undefined werden — sonst schreibt
     fuelleBrief leere Felder und der Brief ist halb gefuellt. */
  /** @param {any[]} liste @returns {any[]} */
  const ohneSender = (liste) => liste.filter((c) => c !== sender && !sindIdentisch(sender, c));
  const basis =
    erlaubteEmpfaenger.length > 0
      ? erlaubteEmpfaenger
      : ohneSender(usable).length > 0
        ? ohneSender(usable)
        : ohneSender(heroes).length > 0
          ? ohneSender(heroes)
          : usable;
  const recipient = zufall(ohneZuletzt(basis, vermeide));

  const rest = usable.filter((c) => c !== sender && c !== recipient && !sindIdentisch(sender, c) && !sindIdentisch(recipient, c));
  const numDritte = Math.floor(Math.random() * 4);
  return { sender, recipient, dritte: shuffle(rest).slice(0, numDritte) };
}

/**
 * Befüllt alle Felder des Briefes mit zwei Pflichtfiguren und 0..3 Dritten.
 */
/**
 * Füllt alle Brief-Felder für eine feste Besetzung.
 *
 * Gemeinsame Endstrecke von „Testbrief würfeln" und den Demo-Knöpfen: Adressen,
 * Anrede, Betreff, Text, Rücksendeangabe und das Zurücksetzen der Zusatzblöcke
 * dürfen nur an einer Stelle stehen.
 *
 * @param {any} sender
 * @param {any} recipient
 * @param {any[]} dritte
 * @param {string} themenHook
 * @param {Szenario} szenario
 */
export function fuelleBrief(sender, recipient, dritte, themenHook, szenario) {
  // Verwendet bewusst den Alias (sender.name / recipient.name), nicht den bürgerlichen Namen,
  // weil der Testbrief-Charakter die Absurdität ist. „Herr Batman" ist grammatisch falsch und soll es sein.
  const senderName = sender.name || sender.buergerlicherName;
  const recipientName = recipient.name || recipient.buergerlicherName;

  /* Testbrief = Neustart: eine als "manuell" markierte Ruecksendezeile (der
     Nutzer hat sie einmal angefasst oder geleert) blockiert die Spiegelung -
     das Feld bliebe leer und zeigte nur seinen Platzhalter (gemeldet
     2026-11-12). Marker weg, Feld leeren, Zustand neu entscheiden lassen;
     erst danach die Absenderfelder schreiben, damit sync() sie fuellt. */
  const ruecksende = document.getElementById('rucksendeangabe');
  if (ruecksende) {
    unsetMeta(letterState, 'rucksendeangabe', 'herkunft');
    applyValue('rucksendeangabe', '', 'logic');
    eventBus.publish(Events.DOCUMENT_CHANGED, { origin: 'reset' });
  }

  // Kontakt-Immersion: Synthetische T9-Vanity-Rufnummer & Popkultur-Mail
  setField('absender-name', senderName);
  setField('absender-strasse', resolveStrasse(sender));
  setField('absender-ort', resolveOrtZeile(sender));
  setField('absender-tel', sender.telefon || generiereTestTelefon(sender));
  setField('absender-mail', sender.mail || generiereTestEmail(sender));

  /* Rücksendezeile bewusst NICHT selbst schreiben: initSenderSync spiegelt
   * sie aus Absender-Name/-Strasse/-Ort und setzt dabei die Initiale
   * ("U. Kisuke", nicht "Urahara Kisuke"). Vorher schrieb der Testbrief den
   * vollen Namen und die Spiegelung hielt das fuer Nutzertext (gemessen
   * 2026-11-12). */

  // Empfänger
  // Firmenzeile nur bei einer einzelnen belegten Organisation — kein Berufs-Blob.
  const recipientNameWithPrefix = recipient.anredePraefix
    ? `${recipient.anredePraefix} ${recipientName}`
    : recipientName;
  setField('empfaenger-firma', resolveFirma(recipient));
  setField('empfaenger-name', recipientNameWithPrefix);
  setField('empfaenger-strasse', resolveStrasse(recipient));
  setField('empfaenger-ort', resolveOrtZeile(recipient));

  // Briefkern
  const currentStyle = (/** @type {HTMLSelectElement | null} */ (document.getElementById('stil-select'))?.value) || 'formal';
  setField('betreff', randomBetreff(themenHook, szenario));
  setField('anrede', deriveAnrede(sender, recipient, currentStyle));
  setField('text', generateNerdText(sender, recipient, dritte, themenHook, szenario));
  setField('grussformel', SalutationEngine.getClosing(currentStyle));
  setField('unterschrift', senderName);
  applyLetterDate();

  // Auto-Text-Status für SalutationFeature sichern (kein fälschlicher dirty-Lock)
  unsetMeta(letterState, 'anrede', 'userSet');
  unsetMeta(letterState, 'grussformel', 'userSet');

  // Zusatzblöcke: Anlagen dynamisch steuern
  const anlagenToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
  const anlagenText = resolveAnlagenEintrag(szenario, themenHook);
  /* Ueber setField, wie alle anderen Felder: sonst gilt jede spaetere
     Ergaenzung dort (z. B. Sperren, Events) fuer Anlagen und Postvermerk
     nicht (Review 2026-11-12). */
  if (anlagenText) {
    if (anlagenToggle) anlagenToggle.checked = true;
    document.documentElement.setAttribute('data-anlagen', 'true');
    setField('anlagen-angabe', anlagenText);
  } else {
    if (anlagenToggle) anlagenToggle.checked = false;
    document.documentElement.setAttribute('data-anlagen', 'false');
    setField('anlagen-angabe', '');
  }

  const fussToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-fuss'));
  if (fussToggle) {
    fussToggle.checked = false;
  }
  document.documentElement.setAttribute('data-fuss', 'false');

  // Postvermerk dynamisch steuern
  const postvermerk = resolvePostvermerk(szenario);
  const postvermerkField = document.getElementById('vermerke');
  const pvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
  const triggerLabel = document.getElementById('postvermerk-trigger-label');
  const triggerBtn = document.getElementById('btn-postvermerk-trigger');

  if (postvermerk) {
    if (postvermerkField) {
      setField('vermerke', postvermerk);
    }
    if (pvSelect) pvSelect.value = postvermerk;
    if (triggerLabel) Field.setValue(triggerLabel, postvermerk);
    if (triggerBtn) triggerBtn.setAttribute('data-active', 'true');
  } else {
    if (postvermerkField) {
      setField('vermerke', '');
    }
    if (pvSelect) pvSelect.value = '';
    if (triggerLabel) Field.setValue(triggerLabel, '— kein —');
    if (triggerBtn) triggerBtn.removeAttribute('data-active');
  }

  // Briefzustand & Entwurf aktualisieren
  eventBus.publish(Events.DOCUMENT_CHANGED);
  eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
}

/* =========================================================================================
 * 5. MEHRSEITEN-DEMOTEXT (QA / BENCHMARK)
 * ========================================================================================= */

const DEMO_SAETZE = [
  'Wir bestätigen den Eingang Ihres Schreibens und danken Ihnen für die ausführliche Darstellung des Sachverhalts.',
  'Nach Prüfung der vorliegenden Unterlagen ergibt sich, dass die geltend gemachte Forderung dem Grunde nach besteht.',
  'Die Höhe der Forderung konnten wir anhand der übersandten Belege jedoch nur teilweise nachvollziehen.',
  'Wir bitten Sie daher, uns die fehlenden Nachweise bis zum Ende des laufenden Monats zukommen zu lassen.',
  'Sollten sich Rückfragen ergeben, erreichen Sie uns telefonisch zu den üblichen Geschäftszeiten.',
  'Bis zur Klärung bitten wir um Verständnis, dass wir keine weiteren Zahlungen veranlassen können.',
  'Die sorgfältige Bearbeitung Ihrer Angelegenheit hat für unser Haus oberste Priorität.',
  'Bitte beachten Sie auch die beigefügten Hinweise zur Einreichung ergänzender Unterlagen.',
];

/**
 * Erzeugt DOM-Absätze für langen Mehrseitentext ohne innerHTML (Law A61).
 * @returns {HTMLParagraphElement[]}
 */
export function erstelleLangenDemoText() {
  /** @type {HTMLParagraphElement[]} */
  const absaetze = [];
  for (let i = 0; i < 14; i++) {
    let p = '';
    const anzahl = 4 + (i % 3);
    for (let j = 0; j < anzahl; j++) {
      p += `${DEMO_SAETZE[(i + j) % DEMO_SAETZE.length]} `;
    }
    const pEl = document.createElement('p');
    Field.setValue(pEl, p.trim());
    absaetze.push(pEl);
  }
  return absaetze;
}

/**
 * Befüllt das Text-Feld mit Demo-Text ('lang' oder 'kurz').
 * @param {'lang' | 'kurz'} modus
 */
export function fuelleDemoText(modus) {
  const text = document.getElementById('text');
  if (!text) return;

  if (modus === 'lang') {
    text.replaceChildren(...erstelleLangenDemoText());
  } else {
    const p1 = document.createElement('p');
    Field.setValue(p1, 'Sehr geehrte Damen und Herren,');
    const p2 = document.createElement('p');
    Field.setValue(p2, 'dies ist ein kurzer Testbrief auf einer Seite. Nutzen Sie den Button „Langer Text“ oder tippen Sie weiteren Text ein, um den automatischen Umbruch auf Folgeseiten zu testen.');
    text.replaceChildren(p1, p2);
  }
  text.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Befüllt alle Felder mit einer gewürfelten Besetzung.
 */
/** Zuletzt gezogene Figuren (Ringpuffer, Session): der Testbrief soll sich
 * nicht wiederholen. 12 Namen reichen fuer "fuehlt sich frisch an", ohne den
 * Pool (295 Figuren mit Hooks) spuerbar zu verkleinern. */
const GEDaeCHTNIS = 12;
/** @type {string[]} */
let zuletztGewaehlt = [];

export async function wuerfelTestbrief() {
  const heroes = await loadHeroes();
  if (!heroes) return;
  plzNeuWuerfeln();
  const usableHeroes = heroes.filter(istBriefbar);
  if (usableHeroes.length < 5) {
    console.warn('[TestData] Nicht genug Charaktere mit vollständigen Adressen.');
    return;
  }

  const { sender, recipient, dritte } = waehleBesetzung(usableHeroes, zuletztGewaehlt);
  zuletztGewaehlt = [...new Set([figurenName(sender), figurenName(recipient), ...zuletztGewaehlt])]
    .slice(0, GEDaeCHTNIS);
  fuelleBrief(sender, recipient, dritte, getCharHook(sender), waehleSzenario());
}

export { wuerfelTestbrief as starteTestbrief };

/**
 * Einheitlicher Addon-Vertrag (B52): run(action, arg, ctx)
 * @param {string} [action]
 * @param {any} [arg]
 * @param {any} [_ctx]
 */
export async function run(action = 'start', arg = null, _ctx = {}) {
  if (action === 'demo' || action === 'fuelleDemoText') {
    return fuelleDemoText(arg || 'lang');
  }
  return wuerfelTestbrief();
}
