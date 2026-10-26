---
id: decision-built-in-ai
title: 'Entscheidung: Keine Chrome Built-in AI APIs'
type: decision
status: accepted
created: '2026-10-25'
updated: '2026-10-25'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/accepted
  - type/decision
doc_links:
  - DECISION-LOG
  - ROADMAP
code_links: []
depends_on: []
supersedes: []
---

# Entscheidung: Keine Chrome Built-in AI APIs

## Kontext

Die Chrome Built-in AI APIs (Summarizer, Prompt, Proofreader,
LanguageModel) wurden als mögliche Option für den Testbrief-Generator
(Stufe 2) und die Betreff-Generierung geprüft.

## Befund

| Prüfpunkt | Ergebnis |
|---|---|
| API-Präsenz in Helium (Chromium 155) | `typeof Summarizer === 'function'` |
| `Summarizer.availability()` | `"unavailable"` |
| `Summarizer.create()` | `NotSupportedError: no execution config` |
| Modell-Bezug | Über Googles Omaha Component Updater – Helium hat diese Infrastruktur nicht |
| Download-Größe | ~4 GB, benötigt 20–22 GB freien Speicher |

## Entscheidung

Die Built-in AI APIs werden **nicht** eingebaut.

**Begründung:**
1. Helium kann das Modell grundsätzlich nicht beziehen (kein Omaha-Updater).
2. Ein Zero-Footprint-Button (`hidden`, bis `availability() !== 'unavailable'`)
   würde in Helium nie erscheinen – toter Code.
3. Für den Testbrief-Generator (fiktive Charaktere) ist BYOK mit
   Groq/Gemini ausreichend und datenschutzunkritisch.

## Konsequenz

- Kein `Summarizer`-Button, kein `LanguageModel`-Code, keine
  Built-in-AI-Flags.
- Testbrief-Generator Stufe 2 nutzt **BYOK** (Groq, Gemini) – siehe
  separaten Auftrag.
- Diese Entscheidung kann revidiert werden, wenn Helium die
  Omaha-Infrastruktur unterstützt oder Chrome Built-in AI in einem
  anderen Kontext verfügbar wird.

## Verweis

- `din5008.md` (Norm, unverändert)
- DECISION-LOG (wird um diesen Eintrag ergänzt)
