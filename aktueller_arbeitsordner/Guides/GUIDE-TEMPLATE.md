---
title: "Guide: [Thema des Guides]"
status: draft | active | deprecated
tags: [guide, documentation, template]
aliases: ["Thema Guide"]
related: ["[[ADR-000]]"]
---

# Guide: [Titel]

> [!tip] Was ist ein Guide?
> Im Gegensatz zu einem ADR (das eine einmalige Entscheidung dokumentiert), ist ein Guide ein lebendes Handbuch. Hier erklären wir, *wie* Dinge in unserem Projekt umgesetzt werden (z. B. "Wie nutzen wir CSS?", "Wie testen wir?").

## 1. Einleitung & Zielsetzung

Kurze Einleitung, warum dieser Guide existiert. Verlinke verwandte Konzepte per [[Wiki-Link]].

## 2. Best Practices

Nutze verschachtelte Listen und Checklisten, um Richtlinien klar zu formulieren:
- **Regel 1**: Schreibe klaren Code.
  - [x] Überprüft durch Linter
  - [ ] Noch nicht dokumentiert
- **Regel 2**: Nutze native APIs.

### Code-Beispiele (Vorher / Nachher)

Nutze Diff-Blöcke (`diff`), um Verbesserungen oder Refactorings zu veranschaulichen:

```diff
- const elements = document.querySelectorAll('.old-class');
- elements.forEach(el => el.style.display = 'none');
+ // Neuer Zero-JS Ansatz via CSS
+ :root:has(#toggle:checked) .new-class { display: none; }
```

### Syntax Highlighting

Nutze spezifische Code-Blöcke (`css`, `javascript`, `html`), um die Lesbarkeit zu garantieren:

```css
.glassmorphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}
```

## 3. Komplexere Zusammenhänge

Wenn ein Konzept schwer zu erklären ist, verstecke Randnotizen in einem Aufklapp-Menü:

<details>
<summary>Deep Dive: Wie funktioniert Backdrop-Filter? (Klicken)</summary>
Backdrop-Filter wendet grafische Effekte (wie Unschärfe) auf den Bereich *hinter* einem Element an. Das Element selbst muss dafür teilweise transparent sein (z.B. durch `rgba`).
</details>

## 4. Feature Checks

Gibt dieser Guide vor, bestimmte Web-APIs zu nutzen? Dann trage sie hier in das Compiler-System ein:

```javascript feature-check
// f("CSS backdrop-filter", CSS.supports("backdrop-filter: blur(10px)"), "Chrome 76", "Produktiv")
```
