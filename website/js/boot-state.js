// @ts-check
// @adr [[ADR-HTML]] {Boot-Zustand}
// @guide [[din-5008-css-architektur]]

/*
 * Classic script am Ende von <body>: setzt den GESPEICHERTEN UI-Zustand vor
 * dem ersten Paint.
 *
 * Warum: `boot.js` laeuft im <head> und kann nur Attribute auf <html> setzen
 * (Theme, Layout, Marks) - die Bedienelemente existieren dort noch nicht.
 * Ohne diesen Seeder sieht man beim Hard-Reload (Strg+F5) kurz die
 * HTML-Defaults: Form B statt der gespeicherten Form A, "— kein —" statt des
 * gespeicherten Postvermerks, leerer Vermerk. Danach springt die Anzeige
 * (FOUC, gemeldet 2026-11-12).
 *
 * Die Wahrheit bleibt bei main.js/draft-manager.js: hier wird nur gelesen und
 * gesetzt, ohne `input`-Events - kein Schreibpfad, keine zweite Restore-Logik.
 */

(() => {
  try {
    /** @param {string} key @returns {Record<string, unknown>} */
    const lies = (key) => {
      try {
        const roh = localStorage.getItem(key);
        const wert = roh ? JSON.parse(roh) : null;
        return wert && typeof wert === 'object' ? wert : {};
      } catch {
        return {};
      }
    };

    const settings = lies('din_settings');
    const draft = lies('din_draft_current');

    /* 1. Briefform: gespeicherte Wahl vor dem Paint in die Radios. */
    const layout = settings.layout === 'form-a' ? 'form-a' : 'form-b';
    const radio = /** @type {HTMLInputElement | null} */ (
      document.getElementById(layout === 'form-a' ? 'btn-form-a' : 'btn-form-b')
    );
    if (radio) radio.checked = true;

    /* 2. Falz-/Lochmarken: Schalter folgt der gespeicherten Einstellung. */
    const marks = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-falzmarken'));
    if (marks) marks.checked = settings.marks !== false;

    /* 3. Postvermerk: Auswahlliste und Blattfeld zeigen denselben Wert. */
    const vermerk = typeof draft.vermerke === 'string' ? draft.vermerke : '';
    const feld = /** @type {HTMLInputElement | null} */ (document.getElementById('vermerke'));
    if (feld) {
      feld.value = vermerk;
      if (vermerk) feld.setAttribute('data-visible', 'true');
    }
    const auswahl = /** @type {HTMLSelectElement | null} */ (
      document.getElementById('seitenleiste-postvermerk-select')
    );
    if (auswahl && [...auswahl.options].some((o) => o.value === vermerk)) auswahl.value = vermerk;

    /* 4. Anlagen-/Fusszeilen-Schalter. Der Entwurf speichert sie als Boolean
       (draft-manager akzeptiert true und 'true'); ein reiner String-Vergleich
       machte aus true ein false und der Schalter sprang nach dem Restore um
       (gemessen 2026-11-12). */
    for (const id of ['toggle-anlagen', 'toggle-fuss']) {
      const box = /** @type {HTMLInputElement | null} */ (document.getElementById(id));
      if (box) box.checked = draft[id] === true || draft[id] === 'true';
    }

    /* 5. Alle Feldwerte aus dem Entwurf — sonst ist der erste Frame leer und
       der Text ploppt nach dem Draft-Restore rein (gemessen 2026-11-12:
       FCP 156 ms, Werte erst 161 ms). `text` liegt als HTML im Entwurf,
       alles andere als Wert. */
    for (const [id, wert] of Object.entries(draft)) {
      if (id.endsWith('__quelle') || typeof wert !== 'string') continue;
      const el = document.getElementById(id);
      if (!el) continue;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.value = wert;
      } else if (el.isContentEditable) {
        /* Kein schreibender innerHTML-Zugriff (A61): DOMParser + replaceChildren
           erhaelt das Markup des Entwurfs unveraendert. */
        const geparst = new DOMParser().parseFromString(wert, 'text/html');
        el.replaceChildren(...geparst.body.childNodes);
      }
    }
  } catch {
    /* Kein Blocker: main.js stellt denselben Zustand gleich noch einmal her. */
  }
})();
