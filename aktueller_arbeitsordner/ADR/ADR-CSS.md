---
title: "ADR: CSS Architecture & Proportional Zoom"
status: accepted
date: 2026-05-24
deciders: morit, antigravity
tags: [css, layout, zoom, containers, theming]
related: [ADR-HTML.md, ADR-JS.md, ../Guides/longevity-guidelines.md]
---

# Architectural Decision Record (ADR): CSS Architecture & Proportional Zoom

## Status
Akzeptiert

## Kontext & Problemstellung
Klassische Webanwendungen brechen oft das WYSIWYG-Prinzip durch unkontrolliertes Scrollen, verzerrte Proportionen bei Größenänderungen oder JavaScript-gesteuerte Element-Skalierungen. Der **DIN-BriefNEO**-Bogen muss unter allen Bedingungen pixelperfekt proportional skaliert und absolut ohne Scrollbalken im Anwendungsfenster dargestellt werden.

---

## Entscheidungen

### 1. Reiner CSS-Zoom & Aspect-Ratio (Kein JS-ResizeObserver)
Der DIN-A4 Bogen `<din-a4>` wird deklarativ auf `height: 94vh` und `aspect-ratio: 210 / 297` fixiert.
*   **Begründung:** Durch die Definition von `height: 94vh` passt sich das Briefpapier stufenlos und passgenau der Viewport-Höhe des Browsers an. Die Aspect-Ratio garantiert ein mathematisch exaktes A4-Verhältnis auf jedem Bildschirm – vollkommen ohne JavaScript-Hilfen.
*   **Verweis:** Siehe [no-scroll-techniques.md](../Guides/no-scroll-techniques.md) für detaillierte No-Scroll-Strategien.

### 2. Container Queries & Proportionale Einheiten (`cqw` / `cqh`)
Wir setzen auf dem `<din-a4>` Bogen `container-type: size` und berechnen alle inneren Abstände, Falzmarken, Margins und Schriftgrößen in Container-Breiten (`cqw`) und -Höhen (`cqh`).
*   **Formeln:** 1 mm entspricht `calc(1 / 210 * 100cqw)` in der Breite und `calc(1 / 297 * 100cqh)` in der Höhe.
*   **Begründung:** Schrumpft oder wächst das Papier durch Browser-Zoom, skaliert das gesamte Brief-Layout mitsamt Texten, Linien und Marken pixelperfekt mit, da sich alle Werte proportional auf die Größe des Eltern-Containers beziehen.
*   **Verweis:** Siehe [din-5008-geometry.md](../Guides/din-5008-geometry.md) für alle normkonformen Umrechnungen.

### 3. Absolute Viewport-Sperre (`overflow: hidden`)
Auf `html` und `body` wird ein ausnahmsloses vertikales und horizontales Scrollverbot (`overflow: hidden`) auferlegt.
*   **Begründung:** Dies verhindert Doppel-Scrollbalken und garantiert ein echtes, premium-artiges Applikationsgefühl im Full-Screen-Modus.

### 4. Natives Light/Dark-Mode Theme (`light-dark()`)
Wir nutzen das native CSS-Farbschema-Feature `light-dark()` in Kombination mit OKLCH-Farbräumen für harmonische und augenfreundliche Kontraste.
*   **Begründung:** Erlaubt eine vollkommen JS-freie Theme-Umschaltung direkt im CSS, indem der Browser je nach `color-scheme` automatisch die passenden Variablen rendert.

### 5. CSS Anchor Positioning API für Floating-Elemente
Wir nutzen die native W3C CSS Anchor Positioning API für das Adress-Autocomplete-Dropdown (`#address-suggestions`) und koppeln es direkt im CSS an sein Anker-Element (`#input-address-search`).
*   **Begründung:** Durch die rein deklarative Verankerung im CSS entfallen sämtliche fehleranfälligen JavaScript-Positionsberechnungen, Resize-Listener und Scroll-Eventhandler. Der Browser führt die Layout-Platzierung hochoptimiert auf der Rendering-Ebene aus, was asynchrone Offsets und Layout-Ruckeln vollständig eliminiert.
*   **Verweis:** Siehe [DEV-INFO.md](../DEV-INFO.md) zur Browserunterstützung ab Chrome 125/147 (inkl. position-area).

### 6. CSS @property für animierbare Custom Properties
Wir registrieren die CSS-Variable `--guide-opacity` über das native `@property`-Feature mit der Syntax `<number>`.
*   **Begründung:** Ohne Typregistrierung behandelt der Browser CSS-Variablen als reinen Text, wodurch sie nicht flüssig interpoliert (animiert) werden können. Durch die Typisierung als `<number>` kann der Browser Werteübergänge von `0.15` auf `0` mathematisch berechnen. Wir deklarieren die Transition `--guide-opacity 0.25s` direkt auf `:root`, wodurch das Ein- und Ausblenden der Hilfslinien vollkommen stufenlos und nativ abläuft.
*   **Verweis:** Siehe [DEV-INFO.md](../DEV-INFO.md) zur Browserunterstützung ab Chrome 146.

### 7. CSS Relative Color Syntax (RCS)
Wir nutzen die W3C Relative Color Syntax (RCS) im OKLCH-Farbraum, um funktionale Farbvarianten (z. B. `--accent-glow`, `--danger-hover` und `--guide-color`) dynamisch und mathematisch aus ihren jeweiligen Basisfarben zu berechnen.
*   **Formeln:** `--accent-glow: oklch(from var(--accent-color) l c h / 15%)`, `--danger-hover: oklch(from var(--danger-color) calc(l - 0.06) c h)` und `--guide-color: oklch(from var(--accent-color) calc(l - 0.05) c calc(h + 120))`.
*   **Begründung:** Anstatt Dutzende statische Farbtöne manuell zu deklarieren, berechnet der Browser alle harmonischen Schattierungen, Glanzeffekte und sogar farbliche Komplementärkontraste (z. B. Hilfslinien im triadisch verschobenen 120-Grad-Farbwinkel) vollautomatisch. Das garantiert perfekte ästhetische Konsistenz, selbst wenn die Primärfarbe dynamisch gewechselt wird.
*   **Verweis:** Siehe [DEV-INFO.md](../DEV-INFO.md) zur Browserunterstützung ab Chrome 119.

---

### 8. CSS interpolate-size: allow-keywords für native Transitionen auf "auto"-Maße
Wir deklarieren `interpolate-size: allow-keywords` global auf `:root` (bzw. auf dem `html`-Element), um die Einschränkung aufzuheben, dass CSS-Transitionen und -Animationen nur auf feste Pixel- oder Prozentmaße angewendet werden können.
*   **Begründung:** Bisher mussten expandierende oder kollabierende Layoutbereiche (wie das API-Key-Eingabefeld `#geoapify-key-container`) umständlich über JavaScript-Höhenberechnungen oder unschöne `max-height`-Hacks (mit festen Werten) animiert werden. Durch die Aktivierung von `interpolate-size` schaltet der Browser native Überblendungen und Größenänderungen von `0` auf `height: auto` völlig eigenständig frei. In Kombination mit discrete transitions (`display: allow-discrete`) gleitet der API-Key-Bereich bei Providerwechseln nun seidenweich und absolut flüssig auf- und zu.
*   **Verweis:** Siehe [DEV-INFO.md](../DEV-INFO.md) zur Browserunterstützung ab Chrome 129.

---

### 9. Native CSS @scope Isolation
Wir kapseln alle physischen Briefblatt-Stile (`din-a4` und dessen Nachfahren) deklarativ über das native CSS `@scope (din-a4)`-Feature ein.
*   **Begründung:** Bisher drohten globale CSS-Klassen (z.B. `.din-mark`, `#absender`, `#infoblock`) mit Styles der App-Shell oder Sidebar zu kollidieren. Die `@scope` API isoliert alle Briefblatt-Klassen und -Regeln vollständig, ohne dass ein aufwendiger Shadow DOM aufgebaut werden muss. Das sichert absolute Geometrie-Immunität für das Briefpapier.
*   **Verweis:** Siehe [DEV-INFO.md](../DEV-INFO.md) zur Browserunterstützung ab Chrome 118.

---

### 10. Ausschließliches OKLCH-Farbmandat & Legacy-Farbverbot
Wir verpflichten uns zur ausschließlichen Nutzung des W3C **OKLCH-Farbraums** (`oklch()`) für sämtliche Farbwerte, Verläufe und Schatten.
*   **Begründung:** OKLCH ist ein wahrnehmungslinearer (perceptually uniform) Farbraum, der Helligkeit (`L`), Buntheit (`C`) und Farbton (`H`) mathematisch gleichmäßig trennt. Dies ist die absolute Voraussetzung für die fehlerfreie Funktion der CSS Relative Color Syntax (RCS), um harmonische, dynamische Kontraste abzuleiten (z. B. Hilfslinien im komplementären Triadic-Kontrast). HEX, RGB oder HSL verhalten sich bei mathematischer Manipulation unvorhersehbar und sind verboten.
*   **Verweis:** Siehe [ADR-ANTIPATTERN.md](ADR-ANTIPATTERN.md) (Antipattern 7).

---

## Konsequenzen
*   **Vorteile:**
    *   Absolut flüssige, stufenlose Echtzeit-Skalierung auf allen Displays.
    *   Hundertprozentig WYSIWYG-konform: Das Druckergebnis entspricht exakt der Bildschirmdarstellung.
    *   Keine Performance-Einbußen durch JS-Resize-Listener.
    *   JavaScript wird vollständig von Layout- und Positionsaufgaben entkoppelt (100% Trennung von Struktur und Stil).
    *   Flüssige, stufenlose Überblendungen von UI-Elementen (wie Hilfslinien) direkt über CSS-Variablen-Interpolation.
    *   Vollautomatische, mathematisch harmonisierte Farbschemata direkt über die W3C Relative Color Syntax.
    *   Völlig native CSS-Größenanimationen auf Keywords (wie `height: auto`) ohne JS-Berechnungen oder `max-height`-Hacks.
    *   Vollständige Kapselungs-Sicherheit der Briefbogen-Geometrie durch native CSS `@scope` Isolation.
    *   Mathematisch perfekte Farbstimmigkeit und Ambient Contrast durch 100 % konsequente OKLCH-Farben.
*   **Nachteile:**
    *   Texte müssen in der Höhe begrenzt sein (z. B. auf 1 A4-Seite), da unkontrolliertes Hinausfließen zu einem Textüberlauf führt (siehe `ADR-FEATURE.md` zur Überlaufwarnung).
    *   Setzt eine moderne Chromium-Engine voraus (Chrome 129+ für `interpolate-size` Unterstützung).


---

## Verknüpfungen
*   Siehe [ADR-HTML.md](ADR-HTML.md) für die Struktur der Custom-Elements.
*   Siehe [ADR-JS.md](ADR-JS.md) für das Blockieren von JS-basiertem Styling.
*   Siehe [ADR-ANTIPATTERN.md](ADR-ANTIPATTERN.md) für das Verbot von Scrollbalken.
*   Siehe [longevity-guidelines.md](../Guides/longevity-guidelines.md) für die übergeordnete W3C-Verfassung zur Wartungsfreiheit.


