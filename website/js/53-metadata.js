// @ts-check
// @adr [[ADR-JS]] 
// @guide [[glossary]] 

import { currentISODate } from './47-date-format.js';

/**
 * metadata.js — Metadaten-Brücke für DIN-BriefNEO
 * Optimiert für Paperless-ngx, Obsidian, Notion & System-Suche
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
 * Liest die Identitätsfelder des Schreibens (Datum, Absender, Empfänger, Betreff)
 * zentral aus dem Live-DOM und erzeugt standardisierte Metadaten und Dateinamen.
 * @returns {LetterIdentity}
 */
export function collectLetterIdentity() {
  const dateStr = currentISODate();
  // Rücksendezeile nach '•' oder ',' trennen, um nur den Namen zu extrahieren
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

/**
 * Steuerung von document.title: Gibt dem Druck-Dateinamen Vorrang vor dem
 * Autosave-Titel des DraftManagers, während der Druckdialog geöffnet ist.
 */
let printTitleActive = false;

/**
 * Darf der Draft-Autosave den Dokumenttitel gerade setzen?
 * @returns {boolean}
 */
export function isPrintTitleActive() {
  return printTitleActive;
}

export const MetadataService = {
  prepare() {
    /* Ein Lesevorgang, ein Ergebnis — siehe Guard an collectLetterIdentity(). */
    const { fileName, dateStr, lastName, recipientName, subjectClean } = collectLetterIdentity();

    // 3. Backup & Title Set (Standard Chrome Filename)
    const oldTitle = document.title;
    document.title = fileName;
    printTitleActive = true;

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
    printTitleActive = false;
    if (!context) return;
    document.title = context.oldTitle;
    if (context.injectedTags) {
      context.injectedTags.forEach(tag => tag.remove());
    }
  }
};
