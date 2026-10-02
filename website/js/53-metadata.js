// @ts-check
// @adr [[ADR-JS]] 
// @guide [[glossary]] 

import { currentISODate } from './47-date-format.js';

/**
 * metadata.js — Platinum Metadata Bridge for V5+
 * Optimiert für Paperless-ngx, Obsidian, Notion & System-Suche
 * (Vereinfacht: PDF-Re-Import via JSON-Block entfernt gemäß Grok-Review)
 */

/**
 * @typedef {object} LetterIdentity
 * @property {string} dateStr       ISO-Datum (zoniert, via 47-date-format)
 * @property {string} lastName      Absender-Kurzform für Autor/Dateiname
 * @property {string} recipientName Empfänger (Name, sonst Firma)
 * @property {string} subjectClean  Betreff, dateisystem-sicher gekürzt
 * @property {string} fileName      Zusammengesetzter Brief-Dateiname
 */

/**
 * 🚨 ARCHITECTURAL GUARD (Single Source of Truth):
 * Die Identitätsfelder eines Briefes (Datum, Absender, Empfänger, Betreff)
 * werden AUSSCHLIESSLICH hier aus dem Live-DOM gelesen. Vorher existierten
 * zwei Rechenwege — buildLetterFileName() und MetadataService.prepare() —
 * die auseinandergelaufen sind: prepare() splittete die Rücksendezeile nur
 * auf Komma, der Grok-Bug-6-Fix (Sender-Sync joint mit "•") war dort nie
 * nachgezogen. Folge: PDF-Metadatum "author" enthielt "Name•Straße•Ort",
 * während der Dateiname korrekt "Name" trug.
 * NIEMALS diese Felder an einer zweiten Stelle neu ableiten — Konsumenten
 * rufen collectLetterIdentity() auf.
 * @returns {LetterIdentity}
 */
export function collectLetterIdentity() {
  const dateStr = currentISODate();
  /* Rücksendezeile-Format: "M. Name • Straße • Ort" (Sender-Sync joint mit
   * •, Grok-Bug 6) — split auf • UND Komma, sonst schluckt der Name
   * Straße+Ort. */
  const lastName = (document.getElementById('rucksendezeile')?.textContent || "").split(/[•,]/)[0].replace(/\s/g, "") || "Absender";
  /* Name und Firma je EINZELN bereinigen und erst dann faellig werden lassen:
   * roh verketten wuerde eine Namenszeile aus reiner Interpunktion als
   * "vorhanden" werten und die Firma unterschlagen. */
  const empfName = (document.getElementById('empfaenger-namenszeile')?.textContent || "").replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "").substring(0, 30);
  const empfFirma = (document.getElementById('empfaenger-firma')?.textContent || "").replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "").substring(0, 30);
  const recipientName = empfName || empfFirma || "Empfaenger";
  const subjectClean = (document.getElementById('betreff')?.textContent || "Brief").replace(/[<>:"/\\|?*]/g, "").trim().substring(0, 50);
  return {
    dateStr,
    lastName,
    recipientName,
    subjectClean,
    fileName: `${dateStr} - ${subjectClean} - ${lastName} an ${recipientName}`
  };
}

/**
 * Brief-Dateiname nach dem DIN-BriefNEO-Muster — Konsument von
 * collectLetterIdentity(). Genutzt von PDF-Druck (53) und
 * DIN-Brief-Export (52, .json).
 * @returns {string}
 */
export function buildLetterFileName() {
  return collectLetterIdentity().fileName;
}

export const MetadataService = {
  prepare() {
    /* Ein Lesevorgang, ein Ergebnis — siehe Guard an collectLetterIdentity(). */
    const { fileName, dateStr, lastName, recipientName, subjectClean } = collectLetterIdentity();

    // 3. Backup & Title Set (Standard Chrome Filename)
    const oldTitle = document.title;
    document.title = fileName;

    // 4. PDF-Standard-Metadaten (Meta-Tags für Drucker)
    const metaData = {
      author: lastName,
      description: `DIN 5008 Brief an ${recipientName} - ${subjectClean}`,
      keywords: `DIN-Brief, BriefNEO, ${recipientName}, ${dateStr}, Platinum`,
      title: fileName
    };

    const injectedTags = this._injectMetaTags(metaData);

    return { oldTitle, injectedTags };
  },

  /**
   * @param {{ author: string, description: string, keywords: string, title: string }} data
   * @returns {HTMLMetaElement[]}
   */
  _injectMetaTags(data) {
    /** @type {HTMLMetaElement[]} */
    const tags = [];
    const mapping = {
      "author": data.author,
      "description": data.description,
      "keywords": data.keywords,
      "application-name": "DIN-BriefNEO Platinum V5"
    };

    Object.entries(mapping).forEach(([name, content]) => {
      const meta = document.createElement("meta");
      meta.name = name;
      meta.content = content;
      meta.setAttribute("data-injected", "true");
      document.head.appendChild(meta);
      tags.push(meta);
    });
    return tags;
  },

  /**
   * @param {{ oldTitle: string, injectedTags: HTMLMetaElement[] } | null} context
   */
  restore(context) {
    if (!context) return;
    document.title = context.oldTitle;
    if (context.injectedTags) {
      context.injectedTags.forEach(tag => tag.remove());
    }
  }
};
