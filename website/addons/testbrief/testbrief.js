// @ts-check
// @adr [[ADR-JS]]

/* addons/testbrief.js — Testbrief-Generator-Addon für DIN-BriefNEO.
 *
 * Kapselt die gesamte Popkultur-Testdaten-Generierung und Adressbereinigung
 * als On-Demand-Addon. Wird erst geladen, wenn der Nutzer tatsächlich auf
 * „Testbrief würfeln" klickt.
 *
 * Grundsatz: Die JSON ist die Quelle der Wahrheit. Dieses Modul erfindet nichts,
 * es bereinigt und wählt aus. Fehlt ein Fakt, entfällt die Aussage.
 */

import { eventBus, Events } from '../../js/core.js';
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
/** @type {any[] | null} */
let heroesPool = null;
let heroIndex = 0;
/** @type {any | null} */
let lastHero = null;

/**
 * Zieht ein belegtes Thema für den Text.
 * Reihenfolge: Alias → einzelne Organisation → Hook → Franchise.
 * Erfundene Platzhalter entfallen; Franchise ist notfalls der einzige belegte Wert.
 * @param {any} char
 * @returns {string}
 */
export function getCharHook(char) {
  const anker = waehleAnker(char);
  if (anker) return anker.text;
  const franchise = String(char?.franchise ?? '').trim();
  return franchise || 'einer dringenden Angelegenheit';
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

/**
 * Generiert einen passenden Betreff zum gewürfelten Thema.
 * Doppelpunkt-Form: das Thema steht als Nachtrag, damit keine Kasus-Fehler
 * entstehen („bezüglich Netz" wäre falsch).
 * @param {string} themenHook
 * @returns {string}
 */
export function randomBetreff(themenHook) {
  const options = [
    `Dringende Mitteilung: ${themenHook}`,
    `Sachstand und Maßnahmenkatalog: ${themenHook}`,
    `Außerordentliche Kündigung: ${themenHook}`,
    `Fristsetzung und Aufforderung zur Stellungnahme: ${themenHook}`,
    `Kooperationsvereinbarung und Beistandspakt: ${themenHook}`
  ];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Erzeugt den Text anhand der gewürfelten Familie (n = 0..3 Dritte).
 * @param {any} sender
 * @param {any} recipient
 * @param {any[]} dritte
 * @param {string} themenHook
 * @returns {string}
 */
export function generateNerdText(sender, recipient, dritte, themenHook) {
  const n = dritte.length;
  const sName = bezeichne(sender);
  const sOrt = resolveOrt(sender) || 'hier';
  const rOrt = resolveOrt(recipient) || 'dort';

  if (n === 0) {
    const templatesA = [
      `hiermit kündige ich unsere bisherige Vereinbarung mit sofortiger Wirkung.\n\nDie jüngsten Entwicklungen rund um ${themenHook} machen eine Fortführung für mich schlicht unmöglich. Als ${sName} kann ich die damit verbundenen Risiken in ${sOrt} nicht länger verantworten.\n\nIch bitte um schriftliche Bestätigung über das Vertragsende und den Verbleib aller Unterlagen.`,
      `bezugnehmend auf unsere Situation unterbreite ich Ihnen einen dringenden Vorschlag zur Zusammenarbeit.\n\nDie Lage bezüglich ${themenHook} erfordert entschlossenes Handeln unserer beiden Seiten. Gerne stelle ich meine Erfahrungen als ${sName} zur Verfügung, um eine geordnete Lösung für ${rOrt} herbeizuführen.\n\nÜber eine kurzfristige Rückmeldung zur Abstimmung der nächsten Schritte freue ich mich.`,
      `ich wende mich heute mit einem formellen Auskunftsersuchen an Ihre Adresse.\n\nIn den vergangenen Tagen sind vermehrt Fragen zu ${themenHook} aufgetreten, die Ihre Zuständigkeit in ${rOrt} berühren. Zur Wahrung meiner berechtigten Interessen fordere ich Sie hiermit auf, den aktuellen Sachstand darzulegen.\n\nNach fruchtlosem Fristablauf behalte ich mir weitere Schritte vor.`
    ];
    return templatesA[Math.floor(Math.random() * templatesA.length)];
  }

  if (n === 1) {
    const d0Name = bezeichne(dritte[0]);
    const d0Ort = resolveOrt(dritte[0]) || 'seinem Quartier';
    const templatesB = [
      `ich muss Ihnen heute von einem besorgniserregenden Vorfall berichten.\n\n${d0Name} hat die Lage in Bezug auf ${themenHook} vollkommen eskaliert. Was zunächst harmlos schien, bedroht inzwischen die Ordnung von ${sOrt} bis nach ${rOrt}.\n\nIch ersuche Sie dringend um Beistand und eine gemeinsame Lagebesprechung.`,
      `auf Empfehlung von ${d0Name} trete ich heute direkt mit Ihnen in Kontakt.\n\nGemeinsam haben wir analysiert, dass ${themenHook} einer neuen Vereinbarung zwischen uns bedarf. Die Expertise aus ${d0Ort} belegt eindeutig, dass ein abgestimmtes Vorgehen unerlässlich ist.\n\nBitte teilen Sie mir zeitnah mit, wann Ihnen ein persönlicher Austausch möglich ist.`
    ];
    return templatesB[Math.floor(Math.random() * templatesB.length)];
  }

  if (n === 2) {
    const d0Name = bezeichne(dritte[0]);
    const d1Name = bezeichne(dritte[1]);
    const templatesC = [
      `die Ereignisse der letzten Tage zwingen mich zu diesem außerordentlichen Schreiben.\n\n${d0Name} und ${d1Name} haben wegen ${themenHook} einen offenen Konflikt begonnen. Die Auswirkungen sind mittlerweile bis in meine Wirkungsstätte spürbar.\n\nIch fordere Sie als Verantwortliche auf, unverzüglich mäßigend auf beide Parteien einzuwirken.`,
      `nach vertraulicher Rücksprache mit ${d0Name} sowie ${d1Name} wende ich mich an Sie.\n\nWir sind übereingekommen, dass die Vorkommnisse um ${themenHook} eine gemeinsame Stellungnahme verlangen. Unsere Kräfte stehen bereit, um Schaden von ${rOrt} abzuwenden.\n\nIch erwarte Ihre verbindliche Rückäußerung binnen zehn Werktagen.`
    ];
    return templatesC[Math.floor(Math.random() * templatesC.length)];
  }

  // n === 3
  const d0Name = bezeichne(dritte[0]);
  const d1Name = bezeichne(dritte[1]);
  const d2Name = bezeichne(dritte[2]);
  const templatesD = [
    `zur Abwendung einer drohenden Krise berufe ich hiermit eine Dringlichkeitssitzung ein.\n\nSowohl ${d0Name}, ${d1Name} als auch ${d2Name} haben bestätigt, dass ${themenHook} außer Kontrolle geraten ist. Es bedarf unseres geschlossenen Auftretens.\n\nIch bitte Sie, sich unverzüglich für den gemeinsamen Termin bereitzuhalten.`,
    `hiermit übermittle ich Ihnen den konsolidierten Lagebericht unserer Beobachter.\n\nDie Berichte von ${d0Name}, ${d1Name} und ${d2Name} stimmen überein: Das Thema ${themenHook} erfordert sofortige Schutzmaßnahmen auf beiden Seiten.\n\nBitte bestätigen Sie den Erhalt dieser Mitteilung und leiten Sie die vereinbarten Notfallprotokolle ein.`
  ];
  return templatesD[Math.floor(Math.random() * templatesD.length)];
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
 * Zieht den nächsten Helden aus dem Pool mit Reshuffle-Ausschluss des letzten Helden.
 * @param {any[]} heroes
 * @returns {any}
 */
function nextHero(heroes) {
  if (!heroesPool || heroIndex >= heroesPool.length) {
    const filtered = lastHero ? heroes.filter(h => h !== lastHero) : heroes;
    heroesPool = shuffle(filtered);
    heroIndex = 0;
  }
  const hero = heroesPool[heroIndex++];
  lastHero = hero;
  return hero;
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
 * @param {string} id
 * @param {string} value
 */
function setField(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value || '';
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/* =========================================================================================
 * 3. EXPORTIERTE HAUPTFUNKTION
 * ========================================================================================= */

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

  // 1. Pflicht-Charaktere
  const sender = nextHero(usableHeroes);
  const recipient = nextHero(usableHeroes);

  // 2. Gewürfelte Dritte (n = 0..3)
  const numDritte = Math.floor(Math.random() * 4);
  const dritte = [];
  for (let i = 0; i < numDritte; i++) {
    dritte.push(nextHero(usableHeroes));
  }

  // 3. Thema aus allen beteiligten Charakteren würfeln
  const allChars = [sender, recipient, ...dritte];
  const themenChar = allChars[Math.floor(Math.random() * allChars.length)];
  const themenHook = getCharHook(themenChar);

  const senderName = sender.buergerlicherName || sender.name;
  const recipientName = recipient.buergerlicherName || recipient.name;

  // 4. Lucky-Luke-Fix: Keine erfundenen Fallbacks
  setField('absender-namenszeile', senderName);
  setField('absender-strasse', resolveStrasse(sender));
  setField('absender-ort', resolveOrtZeile(sender));
  setField('absender-tel', '+49 228 123456-78');
  setField('absender-mail', `${senderName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@beispiel.de`);

  const rucksendeTeile = [senderName, resolveStrasse(sender), resolveOrtZeile(sender)].filter(Boolean);
  setField('rucksendezeile', rucksendeTeile.join(' • '));

  // 5. Empfänger
  // Firmenzeile nur bei einer einzelnen belegten Organisation — kein Berufs-Blob.
  setField('empfaenger-firma', resolveFirma(recipient));
  setField('empfaenger-namenszeile', recipientName);
  setField('empfaenger-strasse', resolveStrasse(recipient));
  setField('empfaenger-ort', resolveOrtZeile(recipient));

  // 6. Briefkern
  setField('betreff', randomBetreff(themenHook));
  setField('anrede', deriveAnrede(sender, recipient));
  setField('text', generateNerdText(sender, recipient, dritte, themenHook));
  setField('grussformel', 'Mit freundlichen Grüßen');
  setField('unterschrift', senderName);
  applyLetterDate();

  // 7. Zusatzblöcke & Postvermerk zurücksetzen
  const anlagenToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
  if (anlagenToggle) {
    anlagenToggle.checked = false;
    document.getElementById('anlagen-text')?.replaceChildren();
  }
  const fussToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-fuss'));
  if (fussToggle) {
    fussToggle.checked = false;
  }

  const postvermerkField = document.getElementById('postvermerk');
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
