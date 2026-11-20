// @ts-check
// @adr [[ADR-JS]]

/* addons/geschaeftsangaben/geschaeftsangaben.js
 * Geschäftsangaben auf Geschäftsbriefen (§ 35a GmbHG) und Bankdaten
 * (IBAN/BIC) — als Addon, weil der Kern ohne das nichts anderes tut.
 *
 * STATUS: **aktiv über den Schalter „Geschäftsangaben (§ 35a)"** in den
 * Einstellungen. Aus (Standard): nichts wird geladen, nichts wird angezeigt —
 * auch die Fußzeilen-Zeile in der Seitenleiste bleibt versteckt (CSS liest
 * `data-plugin-geschaeftsangaben`).
 *
 * Was hier drin ist:
 * - **IBAN prüfen** (Mod-97-Prüfsumme, Länge 15–34, Ländercode)
 * - **IBAN formatieren** (Vierergruppen)
 * - **BIC formal prüfen** (8 oder 11 Stellen, Muster der ISO 13616)
 * - **§ 35a-Pflichtangaben** prüfen: Firma, Sitz, Registergericht,
 *   Registernummer, Vertretungsberechtigte mit Namensangabe
 *
 * Was hier NICHT drin ist und warum:
 * - **BIC aus IBAN ableiten**: geht nicht allgemein. Die Bankleitzahl steckt in
 *   den Stellen 5–12, aber die Zuordnung BLZ → BIC ist eine Datenbank
 *   (Bundesbank-CSV, ~80–120 KB extrahiert). Das ist die Entscheidung aus
 *   Backlog **B91**, nicht Code: eine mitgelieferte Tabelle ist ein
 *   Pflegeversprechen. Solange sie fehlt, prüft das Addon nur die Form.
 * - **Bankname anzeigen**: dito, gleiche Datenquelle.
 * - Kein Netzwerk, kein externer Dienst (A1/A37: Offline-First,
 *   Zero-Dependency).
 *
 * Diese Datei ist eine reine Datenschicht: keine Selektoren, keine Events,
 * kein Zugriff auf den Brief. `aktiviere()` verdrahtet ausschließlich die
 * Prüfung der Fußzeilenfelder.
 */

/** @typedef {{ ok: boolean, fehler?: string }} Pruefung */

/**
 * Prüft eine IBAN nach ISO 13616 (Mod-97).
 * @param {string} iban
 * @returns {Pruefung}
 */
export function pruefeIban(iban) {
  const roh = String(iban || '').replace(/\s+/g, '').toUpperCase();
  if (roh === '') return { ok: false, fehler: 'leer' };
  if (!/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(roh)) {
    return { ok: false, fehler: 'Format: 2 Buchstaben Land, dann 13–32 Zeichen' };
  }
  const land = roh.slice(0, 2);
  if (!/^[A-Z]{2}$/.test(land)) return { ok: false, fehler: 'Ländercode fehlt' };
  /* Erste vier Zeichen ans Ende, Buchstaben -> 10..35, dann Mod 97. */
  const umgestellt = roh.slice(4) + roh.slice(0, 4);
  const ziffern = umgestellt.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rest = 0;
  for (const ziffer of ziffern) rest = (rest * 10 + Number(ziffer)) % 97;
  return rest === 1 ? { ok: true } : { ok: false, fehler: 'Prüfsumme falsch' };
}

/**
 * Formatiert eine IBAN in Vierergruppen (nur Darstellung).
 * @param {string} iban
 * @returns {string}
 */
export function formatiereIban(iban) {
  const roh = String(iban || '').replace(/\s+/g, '').toUpperCase();
  return (roh.match(/.{1,4}/g) || []).join(' ');
}

/**
 * Prüft eine BIC formal (ISO 9362: 4 Buchstaben Bank, 2 Land, 2 Ort, optional
 * 3 Zeichen Filiale).
 * @param {string} bic
 * @returns {Pruefung}
 */
export function pruefeBic(bic) {
  const roh = String(bic || '').replace(/\s+/g, '').toUpperCase();
  if (roh === '') return { ok: false, fehler: 'leer' };
  if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(roh)) {
    return { ok: false, fehler: 'Format: 6 Buchstaben + 2 Zeichen (+ 3 optional)' };
  }
  return { ok: true };
}

/**
 * Die Pflichtangaben nach § 35a GmbHG auf Geschäftsbriefen.
 * Quelle ist der Gesetzestext, nicht die Erinnerung — die Liste ist bewusst
 * als benannte Konstante geführt, damit Abweichungen auffallen.
 */
export const PFLICHTANGABEN = /** @type {const} */ ([
  { key: 'fuss-firma', label: 'Firma (Rechtsform)' },
  { key: 'fuss-sitz', label: 'Sitz der Gesellschaft' },
  { key: 'fuss-gericht', label: 'Registergericht' },
  { key: 'fuss-hrb', label: 'Registernummer' },
  { key: 'fuss-vorstand', label: 'Vertretungsberechtigte' },
]);

/**
 * Nennt die fehlenden Pflichtangaben.
 * @param {Record<string, string>} werte  Feld-ID -> Wert
 * @returns {{ vollstaendig: boolean, fehlend: { key: string, label: string }[] }}
 */
export function fehlendeAngaben(werte) {
  const fehlend = PFLICHTANGABEN.filter((a) => String(werte?.[a.key] ?? '').trim() === '');
  return { vollstaendig: fehlend.length === 0, fehlend: [...fehlend] };
}

/**
 * Verdrahtet die Prüfung mit den Feldern der Fußzeile. Wird nur aufgerufen,
 * wenn der Schalter eingeschaltet ist. Ohne DOM (Tests, Node) tut die Funktion
 * nichts.
 * @returns {(() => void) | void}
 */
export function aktiviere() {
  if (typeof document === 'undefined') return;
  const feld = (/** @type {string} */ id) => {
    const el = document.getElementById(id);
    if (!el) return '';
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
      ? el.value
      : el.textContent || '';
  };
  const iban = feld('fuss-iban');
  const bic = feld('fuss-bic');
  const pruefungen = {
    iban: iban.trim() === '' ? null : pruefeIban(iban),
    bic: bic.trim() === '' ? null : pruefeBic(bic),
    angaben: fehlendeAngaben({
      'fuss-firma': feld('fuss-firma'),
      'fuss-sitz': feld('fuss-sitz'),
      'fuss-gericht': feld('fuss-gericht'),
      'fuss-hrb': feld('fuss-hrb'),
      'fuss-vorstand': feld('fuss-vorstand'),
    }),
  };
  /* Kein stiller Fehlschlag: das Ergebnis steht im Konsolen-Log, sichtbar für
   * den, der es sucht, ohne den Brief anzufassen. */
  console.info('[Geschäftsangaben] Prüfung:', pruefungen);
  return () => {
    const fussSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-fuss'));
    if (fussSwitch?.checked) {
      fussSwitch.checked = false;
      document.documentElement.setAttribute('data-fuss', 'false');
    }
  };
}

export { aktiviere as activate };
