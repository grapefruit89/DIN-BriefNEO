// @ts-check
// @adr [[ADR-JS]] 
// @guide [[glossary]] 

/**
 * metadata.js — Platinum Metadata Bridge for V5+
 * Optimiert für Paperless-ngx, Obsidian, Notion & System-Suche
 * (Vereinfacht: PDF-Re-Import via JSON-Block entfernt gemäß Grok-Review)
 */

export const MetadataService = {
  prepare() {
    // 1. Datum & Zeit (rein Temporal API, keine Legacy Date Fallbacks!)
    const dateStr = Temporal.Now.plainDateISO().toString();
    
    // 2. Read DOM directly
    const lastName = (document.getElementById('absender')?.textContent || "").split(',')[0].replace(/\s/g, "") || "Absender";
    const empfName = (document.getElementById('empfaenger-name')?.textContent || "").replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "").substring(0, 30);
    const empfFirma = (document.getElementById('empfaenger-firma')?.textContent || "").replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "").substring(0, 30);
    const recipientName = empfName || empfFirma || "Empfaenger";
    const subjectClean = (document.getElementById('betreff')?.textContent || "Brief").replace(/[<>:"/\\|?*]/g, "").trim().substring(0, 50);

    const fileName = `${dateStr} - ${subjectClean} - ${lastName} an ${recipientName}`;

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
