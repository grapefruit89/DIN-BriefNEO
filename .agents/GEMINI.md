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
