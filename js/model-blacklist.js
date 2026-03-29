/**
 * js/model-blacklist.js — KI-Modell Blacklist Strategy
 * DIN-BriefNEO · v4.0 V13 | SPEC-038
 * ─────────────────────────────────────────────────────
 * PRINZIP: Blacklist statt Whitelist.
 *   Statt eine starre Liste erlaubter Modelle zu pflegen,
 *   werden VERALTETE Modelle gefiltert. Neue Modelle sind
 *   automatisch erlaubt — keine manuelle Freischaltung nötig.
 *
 * PATTERN:
 *   const models = await fetchAvailableModels(apiKey);
 *   const usable = filterModels(models);
 *   â†’ renderModelSelect(usable);
 */

/**
 * Blacklist-EintrÃ¤ge: Muster fÃ¼r veraltete/ungeeignete Modelle.
 * Regex-basiert â†’ "enthÃ¤lt X" statt "ist exakt Y".
 *
 * BLACKLIST PFLEGE-REGEL:
 *   EintrÃ¤ge werden NUR hinzugefÃ¼gt (nie entfernt ohne Migration-Notiz).
 *   Format: { pattern: /regex/, reason: 'Warum gesperrt', since: 'YYYY-MM' }
 */
const MODEL_BLACKLIST = Object.freeze([
  {
    pattern: /gpt-3\.5/i,
    reason: "Zu alt fÃ¼r DIN-PrÃ¤zision",
    since: "2024-01",
  },
  { pattern: /gpt-4-0314/i, reason: "Deprecated (OpenAI)", since: "2024-06" },
  { pattern: /gpt-4-0613/i, reason: "Deprecated (OpenAI)", since: "2024-06" },
  {
    pattern: /text-davinci/i,
    reason: "Legacy completions API",
    since: "2023-01",
  },
  { pattern: /claude-1/i, reason: "Claude 1.x deprecated", since: "2024-01" },
  {
    pattern: /claude-2\.0$/i,
    reason: "Claude 2.0 deprecated",
    since: "2024-03",
  },
  {
    pattern: /-preview$/i,
    reason: "Preview-Modelle instabil",
    since: "2024-01",
  },
  {
    pattern: /instruct$/i,
    reason: "Instruct-only, kein Chat",
    since: "2024-01",
  },
  {
    pattern: /vision-preview/i,
    reason: "Deprecated Vision-Preview",
    since: "2024-09",
  },
]);

/**
 * Filtert eine Modellliste gegen die Blacklist.
 * @param {string[]} models â€” Liste der Modell-IDs vom Provider
 * @returns {string[]} â€” bereinigte Liste (Blacklist-Treffer entfernt)
 */
export function filterModels(models) {
  if (!Array.isArray(models)) return [];
  return models.filter(
    (model) => !MODEL_BLACKLIST.some((entry) => entry.pattern.test(model)),
  );
}

/**
 * ErklÃ¤rt warum ein Modell gesperrt ist (fÃ¼r Debug-Anzeige).
 * @param {string} modelId
 * @returns {{ blocked: boolean, reason?: string, since?: string }}
 */
export function explainBlock(modelId) {
  const hit = MODEL_BLACKLIST.find((e) => e.pattern.test(modelId));
  if (!hit) return { blocked: false };
  return { blocked: true, reason: hit.reason, since: hit.since };
}

/**
 * Rendert ein <select>-Element mit den verfÃ¼gbaren Modellen.
 * Gesperrte Modelle werden als disabled-Option mit ErklÃ¤rung angezeigt.
 * @param {string} selectId â€” ID des <select>-Elements
 * @param {string[]} allModels â€” alle verfÃ¼gbaren Modell-IDs
 */
export function renderModelSelect(selectId, allModels) {
  const el = document.getElementById(selectId);
  if (!el) return;

  el.textContent = ""; // MANDATE-INJ: textContent statt innerHTML

  const grouped = { available: [], blocked: [] };
  for (const m of allModels) {
    const info = explainBlock(m);
    info.blocked
      ? grouped.blocked.push({ id: m, ...info })
      : grouped.available.push(m);
  }

  // VerfÃ¼gbare Modelle
  const grpOk = document.createElement("optgroup");
  grpOk.label = "âœ“ VerfÃ¼gbar";
  grouped.available.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    grpOk.appendChild(opt);
  });
  el.appendChild(grpOk);

  // Gesperrte Modelle (sichtbar aber disabled â€” Transparenz fÃ¼r Nutzer)
  if (grouped.blocked.length > 0) {
    const grpBlocked = document.createElement("optgroup");
    grpBlocked.label = "âœ— Gesperrt (veraltet)";
    grouped.blocked.forEach(({ id, reason }) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = `${id} â€” ${reason}`;
      opt.disabled = true;
      grpBlocked.appendChild(opt);
    });
    el.appendChild(grpBlocked);
  }
}
