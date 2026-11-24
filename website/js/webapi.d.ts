// @ts-check
/**
 * Ambient Web-API-Typen, die tsc-lib.dom (ES2022-Anchor) noch nicht kennt.
 * Nur für den Typecheck — Runtime-Feature-Detect bleibt in den Modulen selbst.
 */

/** Chrome 141+: programmatische a11y-Ansage (Screenreader), ohne Live-Region-DOM. */
interface AriaNotifyOptions {
  priority?: 'high' | 'normal';
}

interface Document {
  ariaNotify(text: string, options?: AriaNotifyOptions): void;
}

interface Element {
  ariaNotify(text: string, options?: AriaNotifyOptions): void;
}

/**
 * Minimal-Subset der ECMAScript Temporal API (Chromium 150+ Baseline).
 * Deklariert die im Projekt produktiv genutzten PlainDate-, ZonedDateTime- und Now-Typen.
 */
declare namespace Temporal {
  class PlainDate {
    readonly year: number;
    readonly month: number;
    readonly day: number;
    constructor(year: number, month: number, day: number);
    toString(): string;
    toLocaleString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;
    static from(fields: { year: number; month: number; day: number } | string): PlainDate;
  }
  class ZonedDateTime {
    toPlainDate(): PlainDate;
    toString(): string;
  }
  const Now: {
    zonedDateTimeISO(timeZone: string): ZonedDateTime;
  };
}

declare namespace Intl {
  interface DateTimeFormat {
    format(date?: Date | number | Temporal.PlainDate): string;
  }
}

/**
 * WebMCP (W3C-Entwurf, Chrome 149+ hinter Origin-Trial/Flag): die Seite
 * deklariert Werkzeuge, ein Agent ruft sie auf, statt das DOM zu raten.
 * Nur Typen — der Feature-Detect bleibt in webmcp.js.
 */
interface WebMCPAnnotations {
  readOnlyHint?: boolean;
  consequentialHint?: boolean;
  untrustedContentHint?: boolean;
  debugging?: boolean;
}

interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  annotations?: WebMCPAnnotations;
  execute: (input: Record<string, unknown>, options?: { signal?: AbortSignal }) => unknown;
}

interface ModelContext {
  registerTool(tool: WebMCPTool, options?: { signal?: AbortSignal; exposedTo?: string[] }): Promise<void>;
  getTools(options?: { fromOrigins?: string[] }): Promise<WebMCPTool[]>;
  executeTool(
    tool: WebMCPTool,
    input?: Record<string, unknown>,
    options?: { signal?: AbortSignal }
  ): Promise<unknown>;
  addEventListener(type: 'toolchange', listener: () => void): void;
}

interface Document {
  modelContext?: ModelContext;
}
