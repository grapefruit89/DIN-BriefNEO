# Sidebar Aussehen – Defensive CSS-Regeln
[Issue #71] Schutz der Sidebar-Architektur gegen LLM-Zerstörung

## Philosophie
Die Sidebar ist ein **Fixed-Container**, der das Dokumenten-Layout niemals beeinflussen darf. Alle Steuerelemente sind auf maximale Robustheit ausgelegt.

## Defensive Regeln (Mandatory)

### 1. Positionierung & Dimensionen
Die Sidebar nutzt `position: fixed !important`, um sicherzustellen, dass sie außerhalb des Dokumentenflusses bleibt. Die Breite ist auf `300px` festgenagelt.

```css
#sidebar-left {
  position: fixed !important;
  left: 0 !important;
  top: 0 !important;
  bottom: 0 !important;
  width: 300px !important;
  z-index: 1000 !important;
}
```

### 2. Flex-Layout & Segmented Controls
Um Overflow-Fehler in den `segmented-controls` zu vermeiden, nutzen wir `min-width: 0 !important` für alle Optionen.

```css
.segment-option {
  flex: 1 1 0 !important;
  min-width: 0 !important;
}
```

### 3. Unsichtbare Radios
Radio-Buttons innerhalb der Segmente werden physisch auf Null-Dimensionen gesetzt, bleiben aber für die Tastatur-Navigation (via Label) funktionsfähig.

```css
.segment-option input {
  position: absolute !important;
  width: 0 !important;
  height: 0 !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
```

### 4. Zero-Scroll Mandate
Die Sidebar darf niemals Scrollbars erzeugen. Inhalte werden geclippt oder über interne Scroll-Bereiche (falls nötig) verwaltet. Aktuell gilt: `overflow: hidden`.

## Gemini-Schutz
Edits an der Sidebar dürfen diese Kern-Eigenschaften niemals überschreiben. Das `!important` Flag dient hier als expliziter Schutz gegen LLM-"Optimierungen".
