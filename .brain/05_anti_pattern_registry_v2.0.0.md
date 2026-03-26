---
tags: [aviation-grade, platinum-2026, spec-kit, anti-patterns, cemetery]
status: cemented
version: 2.0.0
last_audit: 2026-03-23
id: BRAIN-005-APR
title: Anti-Pattern Registry v2.0 — The Cemetery of Legacy Sins
supersedes: 05_anti_pattern_registry.md
---

# 05 — Anti-Pattern Registry v2.0: The Cemetery of Legacy Sins (TOMB-L001..L075)

## I. DIE OBERSTE REGEL: STRUKTURELLE PRÄVENTION [MANDATE-PLN]
Jede technische Entscheidung wird gegen dieses Register validiert. Ein Aviation Grade System repariert keine Fehler — es macht sie unmöglich.

## II. DER KERN-FRIEDHOF (Extraktion aus Dossier)

| TOMB-ID | Pattern (Deceased / Legacy) | Successor (Chrome 147+ Native) | Reason |
|:---|:---|:---|:---|
| TOMB-L001 | `new Date()` Object | `Temporal.Now.plainDateISO()` | Mutability & Timezone-Drift |
| TOMB-L002 | Inline-Regex Validatoren | HTML5 `pattern` Attribute | Browser-Native Validierung |
| TOMB-L003 | `state.config.*` Proxy Branch | `#paper.dataset.*` | DOM-Attribute als SSoT |
| TOMB-L004 | JS Layout Toggles (`classList`) | CSS `@layer overrides` + `:has()` | No-JS Doctrine |
| TOMB-L005 | `execCommand` & `richText: true` | `plaintext-only` + Ghost-Mirror | Security & Integrity (MANDATE-INJ) |
| TOMB-L006 | JS Dialog `showModal()` Handlers | Popover API + Invoker Commands | Zero-JS Interaction |
| TOMB-L007 | `getElementById(domId)` | `querySelector(entry.tag)` | Tag-Isomorphism |
| TOMB-L008 | `cma-bridge.js` (JS-to-CSS) | CSS SSoT Doctrine (ADR-009) | Redundanz-Eliminierung |
| TOMB-L009 | Manual `--cma-*` Property Setting | Typed `attr()` Readiness | Performance & SSoT |
| TOMB-L012 | Inline UI-Handlers (`onclick`) | `commandfor` / `command` | Native UI Orchestration |
| TOMB-L013 | JS-Driven Layout Toggles | CSS `if()` Logic + `--layout` | Declarative State |
| TOMB-L014 | Manual View Transitions | `view-transition-trigger: checked` | Native Engine Magic |
| TOMB-L015 | ID-Selectors for Geometry | Tag-Selectors in `din.core` | Specificity Control |
| TOMB-L025 | JS-based String Engines | CSS `attr()` Rendering | Separation of Concerns |
| TOMB-L040 | Reactive Sanitizers | `plaintext-only` Prevention | Structural Integrity |
| TOMB-L042 | JS-Driven Transitions | CSS Scoped View Transitions | Performance |
| TOMB-L045 | `setInterval` Animations | Web Animations API (WAAPI) | 60fps Mandat |
| TOMB-L049 | Manual Focus-Traps | `<dialog>` + `autofocus` | A11Y & Native Handling |
| TOMB-L051 | `innerHTML` Templates | `<template>` Content | Security |
| TOMB-L056 | JS-Scroll-Listeners | Scroll-State Queries / CSS `if()` | Zero-Jitter UI |
| TOMB-L060 | Pixel-based Canvas Export | Native Vector Print Engine | MANDATE-VEC |
| TOMB-L065 | `px` for Document Measurements | `mm` as Primary Unit (SSoT) | Physical Precision |
| TOMB-L070 | `head` & `tail` Tools | `read_file` with Exact Lines | Context Fragmentation |
| TOMB-L075 | Speculative Research | Spec-First SDD Workflow | Resource Efficiency |
| TOMB-U001 | `FIELD_MAP` (ID to Key) | `TAG_MAP` from IMR | Tag-Key Isomorphism |
| TOMB-U002 | `_cacheFields` with IDs | `_cacheTags` with querySelector | Architectural Purity |
| TOMB-M001 | Legacy Key Mapping (Tolerant) | Strict Schema Gate | Data Integrity |
| TOMB-S001 | Mixed What/How Specs | Split `/specify/` & `/plans/` | Knowledge Shredder Workflow |
| TOMB-S002 | Status "active" without Check | Constitution Quality-Gate | Reliability |
| TOMB-S003 | Code-First Entwicklung | SPEC -> Specify -> Plan -> Code | Aviation Grade Process |
| ... | [L031-L039, L041, L043-L048, L050, L052-L055, L057-L059, L061-L064, L066-L069, L071-L074] | Consumed by Chrome 147 Native Engine | Redundancy Elimination |

## III. MANDATE-CHECK
Jede neue Spezifikation MUSS bestätigen: "Valide gegen Anti-Pattern Registry v2.0".
