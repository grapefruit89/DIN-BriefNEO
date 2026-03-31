/**
 * metadata.js — Platinum Metadata Bridge
 * Optimiert für Paperless-ngx und Obsidian
 */

export const MetadataService = {
  /**
   * Bereitet das Dokument für den PDF-Export vor
   * @param {Object} state - Aktueller Dokumenten-Zustand
   */
  prepare(state) {
    const content = state.content;
    const profile = state.profile || {};
    
    // 1. Dateiname generieren (Obsidian Style)
    const date = content.datum || new Date().toISOString().split('T')[0];
    const subject = content.betreff || "Brief";
    const sender = profile.name || "Absender";
    const recipient = content.empf_nachname || content.empf_firma || "Empfaenger";
    
    const fileName = `${date} - ${subject} - ${sender} an ${recipient}`;
    
    // Setzt document.title (Browser nutzt dies als Standard-Dateiname beim Speichern)
    const oldTitle = document.title;
    document.title = fileName;

    // 2. Hidden Metadata Anchor befüllen (Paperless-ngx Tags)
    const bridges = document.querySelectorAll("#din-metadata-bridge");
    const metaString = `Correspondent: ${sender} | Recipient: ${recipient} | Created: ${date} | Tags: DIN-Brief, BriefNEO`;
    
    bridges.forEach(el => {
      el.textContent = metaString;
    });

    return oldTitle;
  },

  /**
   * Setzt den Titel nach dem Druck zurück
   * @param {string} oldTitle 
   */
  restore(oldTitle) {
    document.title = oldTitle;
  }
};
