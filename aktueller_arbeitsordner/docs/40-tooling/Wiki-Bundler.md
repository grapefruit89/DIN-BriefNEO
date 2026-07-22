---
code_links: []
created: '2026-07-06'
depends_on: []
doc_links: []
id: doc-wiki-bundle-template
status: active
tags:
- template
- wiki-bundle
- llm-context
title: Wiki Bundle & Context Pack Template
type: concept
updated: '2026-07-07'
---

# 📚 OmniTraceability Wiki Bundle

> **Generiert am:** {{ GENERATION_DATE }}
> **Scope:** {{ BUNDLE_SCOPE }} (Z.B. "Full Project" oder "Feature: Geoapify")

## 🤖 System Prompt (LLM Anweisungen)

Du bist ein KI-Agent, der im Projekt **DIN-Brief Neo** arbeitet.
Dieses Dokument enthält den gebündelten Architektur- und Implementierungskontext für deinen zugewiesenen Scope.

**Wichtigste Regeln:**

1. Beachte strikt die Vorgaben in `AGENTS.md` (Branchless Workflow, 100% Fitness Score, Logging).

3. Halte dich an das KISS-Prinzip (Keep It Simple, Stupid).

4. Wenn du Quellcode schreibst, verknüpfe ihn durch Header-Tags `/* @adr [[ADR-Name]] {FunctionName} */` mit den unten aufgeführten Architektur-Dokumenten.

---

## 🗺️ OmniTraceability Matrix (Auszug)

Die folgende Matrix zeigt, wie der Code mit der Dokumentation verknüpft ist. 

{{ TRACEABILITY_MATRIX_CONTENT }}

---

## 🏛️ Architektur-Entscheidungen (ADRs)

{{ ADR_CONTENT_CHUNKS }}

---

## 📖 Implementierungs-Guides

{{ GUIDE_CONTENT_CHUNKS }}

---

## 🛠️ Code Snippets & Referenzen

{{ RELEVANT_CODE_SNIPPETS }}

---
*End of Wiki Bundle*