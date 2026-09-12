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
 * Brief-Dateiname nach dem DIN-BriefNEO-Muster — Single Source of Truth für
 * PDF-Druck (53) und .dinletter-Export (52). Liest die Live-DOM-Felder.
 * @returns {string}
 */
export function buildLetterFileName() {
  const dateStr = currentISODate();
  /* Rücksendezeile-Format: "M. Name • Straße • Ort" (Sender-Sync joint mit
   * •, Grok-Bug 6) — split auf • UND Komma, sonst schluckt der Name
   * Straße+Ort. */
  const lastName = (document.getElementById('absender')?.textContent || "").split(/[•,]/)[0].replace(/\s/g, "") || "Absender";
  const empfName = (document.getElementById('empfaenger-name')?.textContent || "").replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "").substring(0, 30);
  const empfFirma = (document.getElementById('empfaenger-firma')?.textContent || "").replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "").substring(0, 30);
  const recipientName = empfName || empfFirma || "Empfaenger";
  const subjectClean = (document.getElementById('betreff')?.textContent || "Brief").replace(/[<>:"/\\|?*]/g, "").trim().substring(0, 50);
  return `${dateStr} - ${subjectClean} - ${lastName} an ${recipientName}`;
}

export const MetadataService = {
  prepare() {
    const fileName = buildLetterFileName();
    const dateStr = currentISODate();
    const lastName = (document.getElementById('absender')?.textContent || "").split(',')[0].replace(/\s/g, "") || "Absender";
    const recipientName = (document.getElementById('empfaenger-name')?.textContent || document.getElementById('empfaenger-firma')?.textContent || "").replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "").substring(0, 30) || "Empfaenger";
    const subjectClean = (document.getElementById('betreff')?.textContent || "Brief").replace(/[<>:"/\\|?*]/g, "").trim().substring(0, 50);

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
