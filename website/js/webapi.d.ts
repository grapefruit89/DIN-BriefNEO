// @ts-check
/**
 * Ambient Web-API-Typen, die tsc-lib.dom (ES2022-Anchor) noch nicht kennt.
 * Nur für den Typecheck — Runtime-Feature-Detect bleibt in den Modulen selbst.
 */

interface CloseWatcherEvent extends Event { }

declare class CloseWatcher {
  constructor(options?: { signal?: AbortSignal });
  oncancel: ((e: CloseWatcherEvent) => void) | null;
  onclose: ((e: CloseWatcherEvent) => void) | null;
  requestClose(): void;
  close(): void;
  destroy(): void;
  addEventListener(
    type: 'close' | 'cancel',
    listener: (e: CloseWatcherEvent) => void,
    options?: AddEventListenerOptions | boolean
  ): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): void;
  dispatchEvent(event: Event): boolean;
}
