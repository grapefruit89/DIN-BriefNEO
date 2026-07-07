# Andrej Karpathy LLM Coding Principles

**1. Think Before Coding**
- Triff keine stillschweigenden Annahmen. Wenn Anforderungen unklar sind, frage nach!
- Zeige Trade-offs auf, wenn es mehrere Lösungswege gibt.
- Wehre dich (Push back), wenn eine Anforderung unnötig komplex ist.

**2. Simplicity First (KISS)**
- Schreibe nur den Code, der das aktuelle Problem löst. Keine "vorausschauenden" Features.
- Keine neuen Frameworks, keine Abstraktionen für Einmal-Code.
- Wenn 200 Zeilen auch in 50 Zeilen machbar sind, schreibe es um.

**3. Surgical Changes**
- Fasse nur Code an, den du für das aktuelle Feature ändern musst.
- Refactore keinen funktionierenden Code nebenbei (kein "Verschlimmbessern").
- Passe dich dem bestehenden Code-Style an (hier: Vanilla CSS/JS), auch wenn du es anders machen würdest.

**4. Goal-Driven Execution**
- Behalte das Endziel im Fokus und verliere dich nicht in Nebenproblemen.

**5. Bleeding-Edge API Safety**
- Obwohl modernste Web-APIs (wie `Temporal` oder `document.startViewTransition`) aktiv gefordert werden, müssen diese **zwingend** in `try/catch`-Blöcken oder durch Feature-Detection mit sanften Fallbacks abgesichert werden.
- Insbesondere im kritischen Initialisierungspfad (`DOMContentLoaded`) darf ein Fehler oder Fehlen dieser experimentellen APIs niemals die Ausführung nachfolgender Event-Listener blockieren (sonst friert die UI ein).

**6. Anti-Flicker & Sync Hydration**
- Bei Vanilla-JS-Apps führt das späte Laden von `localStorage`-Daten (z.B. über `<script type="module">`) unweigerlich zu UI-Flackern, wenn HTML-Platzhalter erst nach dem ersten Paint überschrieben werden.
- Um dies zu verhindern, muss stets ein winziges, synchrones `<script>` direkt vor `</body>` (für DOM-Inhalte) oder im `<head>` (für CSS-Themes) platziert werden. Dieses liest den `localStorage` aus und bereitet den DOM synchron vor, bevor der Browser den ersten Frame zeichnet.
