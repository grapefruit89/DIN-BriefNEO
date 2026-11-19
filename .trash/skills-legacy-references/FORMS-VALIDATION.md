# HTML5 Constraint Validation in DIN-BriefNEO

HTML5 bringt vollständige Validierungsmechanismen mit, die ohne JavaScript-Event-Schleifen auskommen.

## 1. Wichtige Attribute

| Attribut | Funktion | Beispiel |
|---|---|---|
| `pattern` | Regex-Prüfung | `pattern="[0-9a-fA-F]{32}"` (Geoapify Key) |
| `minlength` / `maxlength` | Zeichenanzahl begrenzen | `minlength="5" maxlength="5"` (PLZ) |
| `required` | Feld darf nicht leer sein | `required` |
| `inputmode` | Tastaturlayout auf Smartphones | `inputmode="numeric"`, `inputmode="email"` |
| `autocomplete` | Browser-Vervollständigung | `autocomplete="off"` (Sicherheit / eigene Suche) |
| `novalidate` | Unterdrückt Standard-Browser-Tooltips | Auf `<form novalidate>` setzen, um CSS-Styles zu nutzen |

## 2. Zusammenspiel mit CSS (`:has()` und Validitäts-Selektoren)

Durch die Kombination von HTML5-Attributen mit CSS-Pseudoklassen steuert das HTML direkt das Aussehen:

```css
/* Nur anzeigen, wenn Feld nicht leer und ungültig ist */
.key-form:has(input:not(:placeholder-shown):invalid) .msg-format {
  display: inline;
  color: var(--c-danger);
}

/* Rahmen grün färben bei gültiger Eingabe */
.key-form:has(input:valid) input {
  border-color: var(--c-success);
}
```
