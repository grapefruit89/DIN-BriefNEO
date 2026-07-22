---
code_links: []
created: '2026-07-07'
depends_on: []
doc_links:
- '[[Immutable-Law-Catalog]]'
- '[[QUELLEN-UND-LERNGESCHICHTE]]'
id: Architecture-Evolution
status: active
tags:
- obsidian
- core
- documentation
- architecture
title: Architecture Evolution (Why we built it this way)
type: concept
updated: '2026-07-07'
---

# Architecture Evolution (Why we built it this way)

Dieses Dokument fasst die wichtigsten architektonischen Lektionen aus alten KI-Reviews (Claude, GPT, Grok) zusammen und erklärt, **warum** DIN-Brief NEO so radikal auf native Web-Standards und Verzicht setzt. 

Es soll neuen Agenten (und Entwicklern) helfen, die Gründe hinter dem strengen Regelwerk in der `AGENTS.md` und dem `Immutable Law Catalog` zu verstehen.

---

**Die Ausgangslage:** Moderne Frontend-Entwicklung nutzt fast ausschließlich reaktive Frameworks, da sie State-Management und Komponenten-Architekturen vereinfachen.
**Das Problem:**

- **Abhängigkeiten:** Tausende npm-Pakete werden benötigt. Eines veraltet, und das Projekt bricht beim Build.

- **Komplexität beim Drucken:** Virtuelle DOMs (VDOM) machen es extrem schwer, die Millimeter-Präzision für den Druck (PDF via Browser) zu kontrollieren, da der echte DOM asynchron aktualisiert wird.

**Die Lösung:** Wir nutzen **Vanilla JS + Web Components** (Custom Elements). Die nativen Schnittstellen des Browsers bleiben stabil (Rückwärtskompatibilität des Webs).

## 2. Warum LocalStorage statt OPFS (Origin Private File System)?

**Die Ausgangslage:** Das OPFS gilt als die moderne, performante Lösung für Dateioperationen im Browser.
**Das Problem:** 

- OPFS ist stark an **Origin-Sicherheitskonzepte (CORS/HTTPS)** gebunden. 

- Da das oberste Ziel von DIN-Brief NEO ist, **100% offline aus dem `file:///` Protokoll** heraus ausführbar zu sein (für maximale Privatsphäre und Dauerhaftigkeit), schlagen OPFS-Aufrufe ohne lokalen Webserver oft fehl oder werfen Security Errors.

**Die Lösung:** `localStorage` funktioniert selbst beim Doppelklick auf die `.html` Datei auf der lokalen Festplatte. Es ist synchron, überall unterstützt und völlig ausreichend für Textdokumente.

## 3. Warum wir so streng geworden sind (Der "Immutable Law Catalog")

**Die Ausgangslage:** In frühen Versionen (v4.8 und früher) durften LLMs relativ frei entscheiden, wie sie Features implementieren. 
**Das Problem:** 

- Das Projekt verlor seine Kernidentität und die "Zero-Dependency" Regel wurde schleichend gebrochen.

**Die Lösung:** Die Einführung eines extrem strengen, nicht verhandelbaren Regelwerks (der Immutable Law Catalog) und der **Evolutionary Fitness Score**. Agenten werden programmatisch gezwungen (`.\start.ps1`), sich an die Vanilla-JS und Privacy-First-Regeln zu halten. 

## 4. Warum kein Tailwind CSS?

**Die Ausgangslage:** Tailwind ist Branchenstandard für schnelles Styling.
**Das Problem:**

- Tailwind erfordert einen Build-Step (PostCSS), um nicht gebrauchte Klassen herauszufiltern.

- Die Klassen überschwemmen den DOM, was spätere DOM-Auswertungen (z.B. durch LLMs oder für PDF-Generierung) erschwert.

**Die Lösung:** Native CSS-Features sind mächtig genug. Mit **CSS `@layer`** für Kapselung, **Container Queries (`@container`)** für relative Skalierung auf dem A4-Blatt und **CSS Variables (`--var`)** bauen wir ein sauberes, rein semantisches Layout ohne Build-Tool.

---

**Fazit:** DIN-Brief NEO opfert Entwickler-Bequemlichkeiten (Frameworks, npm) zugunsten von radikaler Überlebensfähigkeit, Datenschutz und minimaler Angriffsfläche. Jede Code-Zeile soll auch in 10 Jahren noch exakt so im Browser funktionieren.