# 40 — Native Invoker Dispatch v1.0.0

## I. BEFUND
Die Invoker Commands API (Chrome 135+) und Interest Invoker API delegieren UI-Zustandsmanagement (Klicks, Hover-Effekte, Öffnen/Schließen von Popovers) direkt an die C++-Dispatcher der Blink-Engine.

## II. ARCHITEKTONISCHE BEDEUTUNG
- **Logic-Lite UI**: JS-Event-Listener (`click`, `mouseenter`) für UI-Zustände sind obsolet.
- **Performance**: Vermeidung von Main-Thread-Jumps zwischen C++ und V8-Engine für reine UI-Aktionen.
- **Trennung der Belange**: HTML steuert die UI-Wege (`commandfor`, `interestfor`), JS feuert nur noch Domänenlogik (I/O, State) als Reaktion auf das `command` Event.

## III. STATUS
- **Gültig ab**: Chrome Baseline 147
- **Doktrin**: "Zero-JS" Routing & UI State
