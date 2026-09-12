// @ts-check
/**
 * Ambient Web-API-Typen, die tsc-lib.dom (ES2022-Anchor) noch nicht kennt.
 * Nur für den Typecheck — Runtime-Feature-Detect bleibt in den Modulen selbst.
 */

interface CloseWatcherEvent extends Event { }

/** Chrome Built-in AI (Globals, nicht window.ai — window.ai ist obsolet). */
declare class Rewriter {
  static availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
  static create(options?: {
    sharedContext?: string;
    tone?: 'as-is' | 'more-formal' | 'more-casual';
    length?: 'as-is' | 'shorter' | 'longer';
    format?: 'as-is' | 'plaintext' | 'markdown';
    monitor?: ((monitor: any) => void) | null;
    signal?: AbortSignal;
  }): Promise<{
    rewrite(input: string, options?: { context?: string }): Promise<string>;
    rewriteStreaming(input: string, options?: { context?: string }): AsyncIterable<string>;
    destroy(): void;
  }>;
}

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
