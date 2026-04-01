/**
 * metadata.js — Platinum Metadata Bridge
 * [Issue #61] Optimiert für Paperless-ngx, Obsidian, Notion & System-Suche
 */

export const MetadataService = {
  /**
   * Bereitet das Dokument für den PDF-Export vor
   * @param {Object} state - Aktueller Dokumenten-Zustand
   */
  prepare(state) {
    const { content, profile } = state;
    const p = profile || {};
    const c = content || {};

    // 1. Datum & Zeit (Temporal/ISO)
    const dateStr = c.datum || new Date().toISOString().split("T")[0];
    const fullDate = new Date().toISOString();

    // 2. Obsidian-kompatibler Dateiname (Sanitierung)
    const senderName = (p.lastName || "Absender").replace(/\s/g, "");
    const recipientName = (c.empf_nachname || c.empf_firma || "Empfaenger").replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "").substring(0, 30);
    const subjectClean = (c.betreff || "Brief").replace(/[<>:"/\\|?*]/g, "").trim().substring(0, 50);
    
    const fileName = `${dateStr} - ${subjectClean} - ${senderName} an ${recipientName}`;
    
    // Backup & Title Set (Standard Chrome Filename)
    const oldTitle = document.title;
    document.title = fileName;

    // 3. PDF-Standard-Metadaten (Meta-Tags für Drucker)
    const metaData = {
      author: `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Unbekannt",
      description: `DIN 5008 Brief an ${recipientName} - ${subjectClean}`,
      keywords: `DIN-Brief, BriefNEO, ${recipientName}, ${new Date().getFullYear()}, Platinum`,
      title: fileName
    };

    const injectedTags = this._injectMetaTags(metaData);

    // 4. Hidden Textblock (Paperless-ngx OCR Bridge)
    const bridge = document.getElementById("din-metadata-bridge");
    if (bridge) {
      const bridgeData = [
        `Correspondent: ${metaData.author}`,
        `Recipient: ${recipientName}`,
        `Created: ${dateStr}`,
        `Tags: DIN-Brief, BriefNEO, ${subjectClean.split(" ")[0]}`,
        `Reference: ${c.ref_unser_zeichen || c.ref_ihr_zeichen || ""}`,
        `Subject: ${c.betreff || ""}`,
        `Document Type: Geschäftsbrief`,
        `Language: de`
      ].filter(Boolean).join(" | ");
      bridge.textContent = bridgeData;
    }

    // 5. XMP-Metadata Block (für moderne Indexer wie Spotlight/Tracker)
    this._injectXMP(metaData, fullDate);

    return { oldTitle, injectedTags };
  },

  /**
   * Hilfsfunktion: Meta-Tags in den Head injizieren
   */
  _injectMetaTags(data) {
    const tags = [];
    const mapping = {
      "author": data.author,
      "description": data.description,
      "keywords": data.keywords,
      "application-name": "DIN-BriefNEO v4 Platinum"
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
   * Hilfsfunktion: XMP-Block injizieren
   */
  _injectXMP(data, date) {
    const xmp = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:title>${data.title}</dc:title>
      <dc:creator>${data.author}</dc:creator>
      <dc:subject>${data.description}</dc:subject>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <pdf:Keywords>${data.keywords}</pdf:Keywords>
      <pdf:Producer>DIN-BriefNEO Platinum</pdf:Producer>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <xmp:CreateDate>${date}</xmp:CreateDate>
      <xmp:ModifyDate>${date}</xmp:ModifyDate>
      <xmp:CreatorTool>DIN-BriefNEO v4.0</xmp:CreatorTool>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

    const xmpEl = document.createElement("script");
    xmpEl.type = "application/x-xmp-meta";
    xmpEl.id = "din-xmp-metadata";
    xmpEl.textContent = xmp;
    document.head.appendChild(xmpEl);
  },

  /**
   * Setzt den Titel und injizierte Tags nach dem Druck zurück
   */
  restore(context) {
    if (!context) return;
    document.title = context.oldTitle;
    if (context.injectedTags) {
      context.injectedTags.forEach(tag => tag.remove());
    }
    const xmp = document.getElementById("din-xmp-metadata");
    if (xmp) xmp.remove();
  }
};
