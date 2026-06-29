/**
 * metadata.js — Platinum Metadata Bridge for V5+
 * Optimiert für Paperless-ngx, Obsidian, Notion & System-Suche
 */

export const MetadataService = {
  prepare() {
    // 1. Datum & Zeit (Temporal)
    let dateStr = "";
    try {
      dateStr = Temporal.Now.plainDateISO().toString();
    } catch {
      dateStr = new Date().toISOString().split('T')[0];
    }
    
    // Read DOM directly
    const lastName = (document.getElementById('absender')?.textContent || "").split(',')[0].replace(/\s/g, "") || "Absender";
    const empfName = (document.getElementById('empfaenger-name')?.textContent || "").replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "").substring(0, 30);
    const empfFirma = (document.getElementById('empfaenger-firma')?.textContent || "").replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "").substring(0, 30);
    const recipientName = empfName || empfFirma || "Empfaenger";
    const subjectClean = (document.getElementById('betreff')?.textContent || "Brief").replace(/[<>:"/\\|?*]/g, "").trim().substring(0, 50);

    const fileName = `${dateStr} - ${subjectClean} - ${lastName} an ${recipientName}`;

    // Backup & Title Set (Standard Chrome Filename)
    const oldTitle = document.title;
    document.title = fileName;

    // 3. PDF-Standard-Metadaten (Meta-Tags für Drucker)
    const metaData = {
      author: lastName,
      description: `DIN 5008 Brief an ${recipientName} - ${subjectClean}`,
      keywords: `DIN-Brief, BriefNEO, ${recipientName}, ${dateStr}, Platinum`,
      title: fileName
    };

    const injectedTags = this._injectMetaTags(metaData);

    // 4. Re-Import-Datenblock (PDF-Textlayer)
    let bridge = document.getElementById("din-metadata-bridge");
    if (!bridge) {
      bridge = document.createElement('div');
      bridge.id = "din-metadata-bridge";
      // This ensures it is invisible on screen, but gets printed to the PDF as invisible text layer
      bridge.style.cssText = "position:absolute; width:1px; height:1px; overflow:hidden; opacity:0; pointer-events:none; font-size:1px; line-height:1px; z-index:-1;";
      document.body.appendChild(bridge);
    }
    bridge.textContent = this._buildDataBlock();

    return { oldTitle, injectedTags, bridge };
  },

  _buildDataBlock() {
    const draft = {};
    document.querySelectorAll('[contenteditable]').forEach(elem => {
      draft[elem.id] = elem.id === 'brieftext' ? elem.innerHTML : elem.textContent;
    });

    const payload = {
      _format: "DINBRIEF-DATA-V5",
      _readme: "DIN-BriefNEO Brief-Export. 'content' enthält die DIN-Feldwerte (din-Tags). Re-Import: Block zwischen den Sentinels parsen.",
      content: draft
    };

    return `===DINBRIEF-DATA-V1===\n${JSON.stringify(payload)}\n===END===`;
  },

  _injectMetaTags(data) {
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

  restore(context) {
    if (!context) return;
    document.title = context.oldTitle;
    if (context.injectedTags) {
      context.injectedTags.forEach(tag => tag.remove());
    }
    // We intentionally leave the bridge in the DOM if we want, but since printing is over, we can clear it or leave it.
  }
};
