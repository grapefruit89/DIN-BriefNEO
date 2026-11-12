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

    /* 2b. Die restlichen gespeicherten Regler. Sie standen bis 2026-11-12 nur
       in settings.js / font-feature.js / salutation.js - also NACH dem ersten
       Paint. Belegt an #stil-select: erster Frame "formal" (HTML-Default),
       15 ms nach FCP sprang er auf den Speicherwert. Jeder Wert wird gegen die
       vorhandenen Optionen geprueft, damit nichts Fremdes aus localStorage in
       ein Control wandert. Die alten Stellen bleiben (idempotent). */
    const stil = /** @type {HTMLSelectElement | null} */ (document.getElementById('stil-select'));
    if (stil && [...stil.options].some((o) => o.value === settings.formality)) {
      stil.value = String(settings.formality);
    }
    const schrift = /** @type {HTMLSelectElement | null} */ (document.getElementById('select-schriftart'));
    if (schrift && [...schrift.options].some((o) => o.value === settings.previewFont)) {
      schrift.value = String(settings.previewFont);
    }
    const randU = /** @type {HTMLInputElement | null} */ (document.getElementById('btn-rand-u-30'));
    if (randU) randU.checked = settings.randU === 30;
    const testbrief = /** @type {HTMLInputElement | null} */ (document.getElementById('plugin-testbrief'));
    if (testbrief) testbrief.checked = settings.pluginTestbrief !== false;

    /* 2c. "Gefuellt"-Optik der Auswahllisten: CSS las dafuer
       `:has(option:checked...)` und blendete die Aenderung nach dem Paint auf
       (gemessen 2026-11-12: background-color 30 -> 139 ms). Jetzt Attribut,
       das hier vor dem Paint steht; CSS liest nur noch `data-gesetzt`. */
    for (const liste of document.querySelectorAll('select.seitenleiste-select')) {
      const wahl = /** @type {HTMLSelectElement} */ (liste);
      liste.setAttribute('data-gesetzt', wahl.value !== '' ? 'true' : 'false');
    }

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
    /* 5b. Briefdatum: fehlt `datum` im Entwurf, blieb das Feld bis
       applyLetterDate() (main.js, nach dem Paint) leer - im Infoblock sichtbar
       (Befund B11). Hier denselben Text vorbelegen, den format.js erzeugt:
       gleiche Quelle wie currentISODate(), also Temporal mit expliziter Zone
       und dateStyle 'long' (A48/TM1 und A50 verlangen das so, auch in
       Kommentaren). Wer format.js aendert, muss diese Zeile mitpruefen. */
    const datum = /** @type {HTMLInputElement | null} */ (document.getElementById('datum'));
    if (datum && !datum.value.trim() && typeof Temporal !== 'undefined') {
      datum.value = Temporal.Now.zonedDateTimeISO('Europe/Berlin')
        .toPlainDate()
        .toLocaleString('de-DE', { dateStyle: 'long' });
    }

    /* Einmal Style/Layout erzwingen, BEVOR die Sperre faellt. Sonst landen die
       Attribut-Aenderungen und die Freigabe der Uebergaenge im selben Recalc -
       CSS sieht "Wert neu + Uebergaenge an" und startet die Transition trotz
       Sperre (gemessen 2026-11-12: #stil-select blendete von 0 bis 200 ms auf,
       obwohl data-seeded erst am Ende gesetzt wird). Ein einzelner Read,
       kein Polling (A49). */
    void document.documentElement.offsetHeight;

    /* Signal fuer CSS: Zustand steht. Die Regler, deren Wert aus localStorage
       kommt, sind bis hierher unsichtbar (siehe sidebar.css). NICHT an
       data-ready haengen: das setzt main.js erst am Ende von initApp, also
       ~20 ms nach dem ersten Paint — dann ploppen sie sichtbar nach
       (gemessen 2026-11-12: FCP 56 ms, sichtbar erst 73 ms). */
    document.documentElement.setAttribute('data-seeded', 'true');
  } catch {
    /* Kein Blocker: main.js stellt denselben Zustand gleich noch einmal her. */
  }
})();
