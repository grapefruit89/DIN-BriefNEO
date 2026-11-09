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
