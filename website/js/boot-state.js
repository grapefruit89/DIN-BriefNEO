// @ts-check
// @adr [[ADR-HTML]] {Boot-Zustand}
// @guide [[din-5008-css-architektur]]

/*
 * Classic script am Ende von <body>: setzt den GESPEICHERTEN UI-Zustand so
 * frueh wie moeglich - im schnellen Fall vor dem ersten Paint, im langsamen
 * nicht (gemessen 2026-11-14, tools/paint-probe.mjs, 3 Profile x 30 Laeufe:
 * lokal 30/30 vor dem Paint, 6x CPU 11/30, 150 ms RTT 1/30 - dort kam das
 * Skript im Median 228 ms nach dem Paint). Ein klassisches Skript am
 * Body-Ende blockiert den Parser, nicht das Rendern; die Garantie "unsichtbar
 * bis fertig" leisten die Waechter-Regeln, nicht dieses Skript.
 *
 * Deshalb bleibt es bei zwei Dateien (B71): boot.js muss im <head> laufen
 * (data-theme vor dem ersten Frame, sonst heller Blitz im Dunkelmodus),
 * dieser Seeder braucht den fertigen Body. Zusammenlegen ginge nur, indem
 * eins von beiden seine Aufgabe verliert.
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
    /* Messmarke INNERHALB des try: stand sie davor, war sie die einzige
       Zeile, die ohne Fehlerpfad werfen konnte (T2, gemessen 2026-11-14) —
       der catch unten deckt jetzt auch sie ab. */
    if (typeof performance !== 'undefined' && performance.mark) performance.mark('seeder-start');
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

    /* Gleiche Regel wie persistence.js#istAn (klassisches Skript, kein
       Import). Vorher stand hier `!== false` neben `asBool` in boot.js und
       `Boolean()` in settings.js - drei Antworten auf dieselbe Frage (B65). */
    /** @param {unknown} v */
    const istAn = (v) => v !== false && v !== 'false';

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
    if (marks) marks.checked = istAn(settings.marks);

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
    if (testbrief) testbrief.checked = istAn(settings.pluginTestbrief);
    const geschaeft = /** @type {HTMLInputElement | null} */ (document.getElementById('plugin-geschaeftsangaben'));
    if (geschaeft) geschaeft.checked = settings.pluginGeschaeftsangaben === true;

    /* 2c. Die "Gefuellt"-Optik der Auswahllisten braucht hier nichts mehr:
       sie kommt aus `:has(option:checked:not([value=""]))` (B62, siehe
       sidebar.css). Das fruehere Attribut wurde an dieser Stelle berechnet,
       BEVOR Abschnitt 3 den Postvermerk setzte - und blieb deshalb falsch.
    */

    /* 3. Postvermerk: Auswahlliste und Blattfeld zeigen denselben Wert. */
    const vermerk = typeof draft.vermerke === 'string' ? draft.vermerke : '';
    const feld = /** @type {HTMLInputElement | null} */ (document.getElementById('vermerke'));
    if (feld) {
      /* Sichtbarkeit folgt aus dem Wert (:placeholder-shown) - kein Attribut. */
      feld.value = vermerk;
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
       alles andere als Wert.

       Allowlist (B69): geschrieben wird nur in Elemente, die ein Entwurfsfeld
       SIND — nicht in jedes Element, dessen `id` zufaellig als Schluessel im
       Entwurf steht. Vorher genuegte `getElementById(id)`: ein manipulierter
       oder veralteter Entwurf konnte jeden Wert in ein beliebiges Control
       schreiben. Der Selektor ist derselbe wie EDITABLE_FIELD_SELECTOR in
       document.js; weil diese Datei ein klassisches Skript ist und nicht
       importieren kann, steht er hier lokal. `test/all.js`
       ("Draft-Feld-Selektor") haelt beide Fassungen deckungsgleich.

       Kein zweiter Sanitizer: was hier ankommt, ist bereits gesaeubert —
       collectDraft (document.js) ruft sanitizeRichText vor dem Speichern auf.
       Dieser Block materialisiert nur, was so gespeichert wurde. */
    const FELD_SELECTOR =
      '[contenteditable]:not([data-feldtyp="systemwert"]), textarea[data-feldtyp], input[data-atom], select[data-speichern]';
    for (const [id, wert] of Object.entries(draft)) {
      if (id.endsWith('__quelle') || typeof wert !== 'string') continue;
      const el = document.getElementById(id);
      if (!el?.matches(FELD_SELECTOR)) continue;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        /* Der Restore liest den Vermerk getrimmt (draft-manager.js, Select-Sync).
           Ohne denselben Schnitt zeigt der Seeder "  Unser Zeichen: 4711  " und
           der Restore danach "Unser Zeichen: 4711" — gemessen mit
           tools/seeder-diff.mjs (Fall `vermerk-leerzeichen`). */
        el.value = el.id === 'vermerke' ? wert.trim() : wert;
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
    /* Baseline ist Chrome 150+; Temporal ist dort vorhanden (B68). */
    if (datum && !datum.value.trim()) {
      datum.value = Temporal.Now.zonedDateTimeISO('Europe/Berlin')
        .toPlainDate()
        .toLocaleString('de-DE', { dateStyle: 'long' });
    }

    /* Signal fuer CSS: der Wert-Writer ist fertig, die Maske darf weg. EIN
       Token (data-booting), EIN Entferner zu diesem Zeitpunkt; main.js
       entfernt denselben Marker spaeter nur noch idempotent als Netz. NICHT
       an einen zweiten Marker haengen: genau das war das Zwei-Marker-Modell,
       das D2 ersetzt. */
    /* Messmarke fuer tools/paint-probe.mjs: erlaubt den Zeitvergleich mit
       firstPaint (B72). Kostet nichts und laeuft nur einmal. */
    if (typeof performance !== 'undefined' && performance.mark) performance.mark('seeded');
    document.documentElement.removeAttribute('data-booting');
  } catch (e) {
    /* Kein Blocker: main.js stellt denselben Zustand gleich noch einmal her.
       Aber nicht still: ohne Seeder bleibt die Maske bis zum Netz (1800 ms)
       stehen, und niemand sieht warum (B67). */
    console.error('[Boot-State] Seeder fehlgeschlagen:', e);
  }
})();
