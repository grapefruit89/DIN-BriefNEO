# Deklarative Popovers & Dialoge

Moderne Browser (Chrome 150+ Baseline) unterstützen vollständig deklarative Overlays ohne JavaScript.

## 1. Popover API

### Attribute
- `popover="auto"`: Standard-Verhalten mit Light-Dismiss (Klick außerhalb schließt) und Fokus-Management.
- `popover="manual"`: Bleibt offen, bis explizit geschlossen.
- `popovertarget="id"`: ID des Popover-Elements, das der Button steuern soll.
- `popovertargetaction="toggle|show|hide"`: Aktion beim Klick.

```html
<button type="button" popovertarget="dropdown-1" class="btn">Menü</button>
<div id="dropdown-1" popover="auto" class="popover-menu">
  <button type="button" class="popover-item">Eintrag 1</button>
</div>
```

## 2. Native `<dialog>` mit Invoker Commands (`commandfor`)

Das `commandfor`-Attribut ermöglicht das Öffnen und Schließen von Dialogen direkt aus dem HTML:

```html
<!-- Öffnen -->
<button type="button" commandfor="mein-dialog" command="show-modal" class="btn">
  Dialog öffnen
</button>

<dialog id="mein-dialog" class="din-dialog">
  <h2>Titel</h2>
  <p>Inhalt…</p>
  <!-- Schließen via Command -->
  <button type="button" commandfor="mein-dialog" command="close" class="btn">
    Abbrechen
  </button>
  <!-- Oder Schließen via submit im dialog-form -->
  <form method="dialog">
    <button type="submit" class="btn">OK</button>
  </form>
</dialog>
```
