/**
 * qrcode.js — Platinum QR & vCard Wrapper
 * [ADR-017] Platinum Edition - UI & vCard Bridge
 */

import { QRCodeModel, QRErrorCorrectLevel } from "./qr-engine.js";

// --- PLATINUM WRAPPER ---
export const QRCodeEngine = {
  /**
   * Generiert einen vCard 3.0 String basierend auf dem Profil-State
   */
  generateVCard(p) {
    if (!p) return "";
    const rev = Temporal.Now.instant().toString();
    const fullName = [p.firstName, p.lastName].filter(Boolean).join(" ");
    const n = `${p.lastName || ""};${p.firstName || ""};;;`;
    return [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${n}`,
      `FN:${fullName}`,
      `ORG:${p.company || ""}`,
      `TEL;TYPE=CELL,VOICE:${p.phone || ""}`,
      `EMAIL;TYPE=INTERNET,PREF:${p.email || ""}`,
      `ADR;TYPE=WORK,POSTAL:;;${p.street || ""};${p.city || ""};;${p.zip || ""};Germany`,
      `REV:${rev}`,
      "END:VCARD"
    ].join("\r\n");
  },

  /**
   * Rendert einen QR-Code in ein Ziel-Element
   */
  render(el, data) {
    if (!el || !data) return;
    el.innerHTML = "";
    const canvas = document.createElement("canvas");
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    el.appendChild(canvas);

    try {
      // Find best typeNumber (1-40)
      let type = 1;
      while (type < 40) {
        try {
          const qr = new QRCodeModel(type, QRErrorCorrectLevel.M);
          qr.addData(data);
          qr.make();
          const ctx = canvas.getContext("2d");
          const count = qr.getModuleCount();
          const tile = size / count;
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = "black";
          for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
              if (qr.isDark(r, c)) ctx.fillRect(c * tile, r * tile, tile, tile);
            }
          }
          break;
        } catch (e) { 
          type++; 
        }
      }
    } catch (err) {
      console.error("[QR] Render failed:", err);
    }
  }
};
