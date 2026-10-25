/**
 * @file debug-recorder.js
 * @description Kompatibilitäts-Wrapper für das vereinheitlichte Debug-Panel.
 * Delegiert an ./debug-panel.js.
 */

export {
  createDebugPanel,
  mountAutocompletePanel,
  mountAutocompletePanel as initAutocompleteRecorder
} from './debug-panel.js';
