# Absturzsichere Integration des KI-Addons in DIN-Brief Neo

> **Ziel:** Vollständige Isolierung des experimentellen Features. Wenn der Browser das Feature nicht unterstützt, kein Gemini Nano installiert ist oder die API fehlschlägt, funktioniert der Brief-Editor zu 100 % fehlerfrei weiter.

---

## 1. Das 4-Stufen-Schutzkonzept gegen Abstürze

1. **Stufe 1: Reines Opt-in (Standard = Deaktiviert)**
   - Das Addon ist standardmäßig inaktiv.
   - Der Nutzer muss es in der Sidebar explizit über den Schalter aktivieren.
   - Ist es aus, wird **weder Speicher reserviert noch ein einziger Event-Listener registriert**.

2. **Stufe 2: Browser-Kompatibilitätsprüfung (`typeof window.ai`)**
   - Vor jedem Zugriff wird geprüft: `if (typeof window.ai === 'undefined') return;`.
   - In Firefox, Safari, alten Chrome-Versionen oder ohne Flags steigt der Code sofort geräuschlos aus.
   - Es gibt **keine unhandled Exceptions**, keine roten Fehlerkonsolen, kein Blockieren der App.

3. **Stufe 3: Modell-Verfügbarkeitsprüfung (`.availability()`)**
   - Chrome prüft vor dem Laden, ob das On-Device-Modell (Gemini Nano) tatsächlich vorhanden ist (`status === 'readily'`).
   - Wenn das Modell erst heruntergeladen werden müsste oder Hardware-Grenzen greifen, deaktiviert sich das Addon automatisch.

4. **Stufe 4: Allumfassende `try/catch`-Kapselung**
   - Jede einzelne Methode (`rewriteSelection`, `draftLetter`, DOM-Mounting) ist separat gekapselt.
   - Selbst wenn Gemini Nano mitten im Generieren abbricht, bleibt der getippte Brieftext, das automatische Speichern und der PDF-Druck komplett unangetastet.

---

## 2. Wie binde ich das Addon ins Projekt ein?

Die Einbindung erfordert nur **eine einzige Zeile** am Ende von `website/index.html`:

```html
<!-- Am Ende des <body> in website/index.html einfügen: -->
<script type="module" src="js/addons/ai-assistant.js" async></script>
```

Durch das `async`-Attribut wird der Ladevorgang der Kern-App nicht um eine einzige Millisekunde verzögert.

---

## 3. Datei-Ablage im Repository

Kopiere die vorbereitete Addon-Datei in dein Projekt:

- **Quelle:**
  `C:\Users\morit\Documents\dinbrief-temp\roadmap\ai_assistant_addon.js`
- **Ziel im Projekt:**
  `C:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\website\js\addons\ai-assistant.js`

---

## 4. Wie testet der Nutzer das Addon?

1. Im Chrome-Browser die Seite öffnen.
2. In der Sidebar ganz unten erscheint der Schalter:
   `✨ Experimentell: Lokale KI`
3. Wenn Chrome Built-in AI unterstützt wird, steht darunter `Bereit (Gemini Nano)`.
4. Bei Klick auf den Schalter wird das Feature scharfgeschaltet und der Button `✨ Formal` erscheint in der schwebenden Toolbar.
5. In jedem anderen Browser ist der Schalter ausgegraut mit dem Hinweis `Nicht vom Browser unterstützt`.
