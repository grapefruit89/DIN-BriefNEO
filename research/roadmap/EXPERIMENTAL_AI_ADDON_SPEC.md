# Experimentelles Addon: On-Device Chrome AI (Gemini Nano) für DIN-Brief Neo

> **Technologie:** Chrome Built-in AI (Writer, Rewriter & Proofreader APIs)  
> **Modell:** Gemini Nano (Lokal auf dem Gerät, 100 % DSGVO-konform, kein API-Key)  
> **Integrations-Status:** Als optionales Plugin / Addon (`website/js/addons/ai-assistant.js`)  

---

## 1. Warum diese APIs perfekt zu DIN-Brief Neo passen

1. **Absoluter Datenschutz (DSGVO / GDPR):**
   Briefe enthalten hochsensible Daten (Kündigungen, Mahnungen, Gehaltsverhandlungen, Behördenstreitigkeiten, Adressen). Herkömmliche KI-APIs (wie OpenAI oder Anthropic) verbieten sich hier oft aus Datenschutzgründen. Chrome Built-in AI läuft **zu 100 % lokal auf der Hardware des Nutzers**. Kein einziges Wort verlässt den Browser!

2. **Keine Kosten & kein API-Schlüssel:**
   Der Nutzer benötigt weder ein Login noch einen kostenpflichtigen API-Key oder ein Abonnement. Es funktioniert direkt „Out-of-the-Box“ in modernen Chromium-Browsern.

3. **Direkte Passung zur DIN-Brief Logik:**
   - **Writer:** Generiert aus Stichpunkten („Kündigung Fitnessstudio wegen Umzug“) einen druckfertigen DIN-Brieftext.
   - **Rewriter:** Verwandelt umgangssprachliche Formulierungen auf Knopfdruck in einen formellen Geschäftsbrief (`tone: 'more-formal'`). Passt 1:1 zur bestehenden Salutation-Engine (Förmlich vs. Höflich vs. Locker).
   - **Proofreader:** Findet Tippfehler, falsche Kommasetzung und Grammatikfehler vor dem PDF-Druck.

---

## 2. Architektur als modulares Addon (Progressive Enhancement)

Das Addon wird so konzipiert, dass es den schlanken Kern des Projekts **nicht aufbläht**:

- **Verfügbarkeitsprüfung (Feature Detection):**
  Prüft beim Start `window.ai?.writer?.availability()`:
  - Wenn `readily`: KI-Buttons in der Sidebar und der Format-Toolbar werden aktiviert.
  - Wenn `no` oder Browser ohne Gemini Nano: Das Addon schaltet sich geräuschlos ab, die UI bleibt sauber und schlank.

---

## 3. Konkrete Implementierungs-Bausteine

### A. Entwurf generieren (Writer API)
- **Wo in der UI:** Neuer Tab oder Zauberstab-Button in der Sidebar („Brief-Assistent“).
- **Funktionsweise:**
```javascript
const writer = await ai.writer.create({
  tone: 'formal',
  format: 'plain-text',
  length: 'medium'
});

// Streaming direkt in den DIN-Textbereich
const stream = writer.writeStreaming("Kündigung des Stromvertrags zum nächstmöglichen Zeitpunkt wegen Preiserhöhung.");
for await (const chunk of stream) {
  document.getElementById('brieftext').textContent = chunk;
}
```

### B. Stil formaler machen (Rewriter API)
- **Wo in der UI:** Zusätzlicher Button in der schwebenden Formatierungs-Toolbar (`#format-toolbar`), wenn Text markiert ist.
- **Funktionsweise:**
```javascript
const rewriter = await ai.rewriter.create({
  tone: 'more-formal',
  length: 'as-is'
});

const formalText = await rewriter.rewrite(selectedText);
// Ersetzt den markierten Text durch die geschäftsmäßige DIN-Formulierung
```

### C. Fehlerkorrektur vor dem Druck (Proofreader API)
- **Wo in der UI:** Automatische oder manuelle Prüfung neben dem „Drucken / PDF“-Button.
- **Funktionsweise:**
```javascript
const proofreader = await ai.proofreader.create();
const result = await proofreader.proofread(letterText);
// Markiert gefundene Korrekturen dezent im Text via CSS ::highlight
```

---

## 4. Fazit & Empfehlung

Dieses Feature ist eine **glatte 10/10** für DIN-Brief Neo:
- Es macht aus einem reinen Formatierungs-Editor einen echten intelligenten Brief-Assistenten.
- Da es als modulares Addon gebaut wird, bleibt das Kernprojekt unabhängig und leichtgewichtig.
- Datenschutz-technisch ist es das einzige KI-Modell, das man guten Gewissens in ein deutsches Dokumenten-Werkzeug integrieren kann.
