---
id: PLAN-060
spec: SPEC-056
title: Sovereign Akinator 4.0 — Local Gemini Nano Integration
status: draft
anti-patterns: [ANTI-025]
adr: ADR-012
---

# Plan: Sovereign Akinator (Local AI)

## 1. Zielsetzung
Ersetzung aller externen KI-Aufrufe durch die native **Chrome Gemini Nano API**. Der Akinator wird zum lokalen Lektor, der ohne Internetverbindung und mit maximalem Datenschutz operiert.

## 2. Technische Umsetzung

### 2.1 Feature Detection
Wir prüfen, ob der Browser das Modell bereits geladen hat:
```javascript
async function isAiReady() {
  if (!globalThis.ai || !globalThis.ai.assistant) return false;
  const status = await ai.assistant.capabilities();
  return status.available === 'readily';
}
```

### 2.2 Local Prompting
Anstatt eines `fetch()` an einen Server, nutzen wir die Session-API:
```javascript
async function runLocalAnalysis(content) {
  const session = await ai.assistant.create({
    systemPrompt: "Du bist ein DIN 5008 Experte. Prüfe diesen Brief auf Form und Ton."
  });
  return await session.prompt(JSON.stringify(content));
}
```

## 3. Vorteile für das Projekt
- **Privacy First**: Briefgeheimnis wird technisch durch lokale Ausführung garantiert.
- **Zero Latency**: Sofortiges Feedback während des Tippens (Ghost-Mirror-ähnlich).
- **Cost Zero**: Keine API-Kosten, keine Abhängigkeit von Drittanbietern.

## 4. Constraint Check
Der Akinator darf den Brief **niemals eigenmächtig ändern**. Er gibt nur Empfehlungen aus (Aviation Grade: Der Pilot/Nutzer behält die Kontrolle).
