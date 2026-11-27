// tools/runtime/cdp.mjs — schlanker CDP-Client (WebSocket + JSON-RPC 2.0).
//
// Eine Stelle für das Protokoll: Verbinden, `send()`, Ereignisse, `evaluate()`.
// Vorher stand dieselbe Send/Map-Logik in zehn Skripten; hier ist sie einmal.
//
// Zero-Dependency: globales `WebSocket` (Node 22+) plus node:-Builtins.

/**
 * Seiten-Target am Debug-Port holen (`/json/list`).
 * @param {number} port
 * @param {(ziel: any) => boolean} [auswahl] Default: erstes Page-Target
 * @returns {Promise<any>}
 */
export async function findeSeite(port, auswahl = (ziel) => ziel.type === 'page') {
  const ziele = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const seite = ziele.find(auswahl);
  if (!seite?.webSocketDebuggerUrl) throw new Error('Kein Page-Target am Debug-Port.');
  return seite;
}

/**
 * Browser-Version am Debug-Port (`/json/version`); leer, solange er antwortet nicht.
 * @param {number} port
 * @returns {Promise<{ Browser?: string }>}
 */
export async function browserInfo(port) {
  try {
    return await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  } catch {
    return {};
  }
}

/**
 * Verbindet per WebSocket und gibt `send`, `evaluate`, `close` zurück.
 * `onEvent(method, params)` sieht alle Ereignisse, die kein Response sind.
 * @param {string} webSocketUrl
 * @param {{ onEvent?: (method: string, params: any) => void }} [optionen]
 */
export async function verbinde(webSocketUrl, { onEvent } = {}) {
  const ws = new WebSocket(webSocketUrl);
  /** @type {Map<number, (nachricht: any) => void>} */
  const offen = new Map();
  let naechsteId = 0;

  ws.onmessage = (ereignis) => {
    const nachricht = JSON.parse(ereignis.data);
    if (nachricht.id && offen.has(nachricht.id)) {
      const loesen = offen.get(nachricht.id);
      offen.delete(nachricht.id);
      loesen?.(nachricht);
      return;
    }
    if (nachricht.method) onEvent?.(nachricht.method, nachricht.params ?? {});
  };
  await new Promise((loesen, ablehnen) => {
    ws.onopen = () => loesen(undefined);
    ws.onerror = () => ablehnen(new Error('CDP-WebSocket konnte nicht verbinden.'));
  });

  /** @param {string} method @param {object} [params] */
  const send = (method, params = {}) =>
    new Promise((loesen) => {
      const id = ++naechsteId;
      offen.set(id, loesen);
      ws.send(JSON.stringify({ id, method, params }));
    });

  /** @param {string} expression */
  const evaluate = async (expression) => {
    const antwort = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return antwort?.result?.result?.value;
  };

  return {
    ws,
    send,
    evaluate,
    close: () => {
      try {
        ws.close();
      } catch {
        /* schon zu */
      }
    }
  };
}
