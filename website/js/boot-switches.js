// @ts-check
// @adr [[ADR-JS]] {BootSwitches}
// @guide [[din-5008-css-architektur]]

/*
 * Blocking classic script (head): setzt die Schalterzustaende von Hilfslinien
 * und Falz-/Lochmarken, sobald die Checkboxen im DOM existieren — und damit
 * VOR dem First Paint (FOUC-Schutz).
 *
 * Warum kein Modul: Module sind deferred und kaemen nach dem ersten Paint.
 * Warum nicht am Body-Ende: dort blockiert der Parser auf den Fetch dieses
 * Scripts, waehrend der Browser bereits malt. Gemessen (kalt, guides=true):
 * FCP bei 96 ms, Zustand dort noch "aus".
 * Warum MutationObserver statt fester Position im Body: Der Observer laeuft
 * als Microtask, und Microtasks werden vor dem Rendern abgearbeitet. Sobald
 * die Checkbox geparst ist, steht ihr Zustand fest, bevor ein Frame entsteht.
 * Damit haengt die Korrektheit nicht mehr an der Parse-Geschwindigkeit.
 *
 * Der HTML-Default und DEFAULT_SETTINGS in persistence.js muessen
 * uebereinstimmen; dann aendert dieser Block fuer neue Nutzer nichts und
 * korrigiert nur den gespeicherten Zustand.
 */
try {
  const raw = localStorage.getItem('din_settings');
  const parsed = raw ? JSON.parse(raw) : {};
  const settings = parsed && typeof parsed === 'object' ? parsed : {};

  const setze = () => {
    const guides = /** @type {HTMLInputElement | null} */ (
      document.getElementById('btn-hilfslinien-switch')
    );
    if (guides) {
      guides.checked = Boolean(settings.guides);
    }

    const marks = /** @type {HTMLInputElement | null} */ (
      document.getElementById('toggle-falzmarken')
    );
    if (marks) {
      marks.checked = settings.marks !== false;
    }

    return Boolean(guides && marks);
  };

  // Stehen die Schalter schon (Script nach ihnen geladen)? Dann direkt setzen.
  if (!setze()) {
    const beobachter = new MutationObserver(() => {
      if (setze()) {
        beobachter.disconnect();
      }
    });
    beobachter.observe(document, { childList: true, subtree: true });
    // Fallback, falls der Parser die Elemente vor dem ersten Check einfuegt.
    document.addEventListener('DOMContentLoaded', () => {
      setze();
      beobachter.disconnect();
    });
  }
} catch (e) {
  /* Ein Fehler hier laesst die Schalter im HTML-Default stehen. Die App
   * laeuft weiter, aber der gespeicherte Zustand fehlt — sichtbar und ohne
   * Ursache. Daher loggen. */
  console.error('[Boot] Schalter-Initialisierung fehlgeschlagen:', e);
}
