/**
 * @file debug-json-panel.js
 * @description Kompatibilitäts-Wrapper für das vereinheitlichte Debug-Panel.
 * Delegiert an ./debug-panel.js.
 */

export {
  createDebugPanel,
  mountJsonPanel,
  mountJsonPanel as initJSONDebugPanel
} from './debug-panel.js';
