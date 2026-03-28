# v4.0_PROTOCOL_V3.LOCKED
**DOKTRIN:** High-Integrity v4.0 | **BASELINE:** CHROME 147+ | **SSoT**

Dieses Dokument terminiert alle bisherigen "vibe-basierten" Implementierungen. Es ist die einzige Quelle der Wahrheit fÃ¼r die maschinelle Isomorphie zwischen der DIN 5008:2020 und der Blink-Direct Architektur. Jede Abweichung ist eine CMA_VIOLATION.

## 1. Autonomous SEMANTIC MATRIX V3.1

### Layout & Struktur
| DIN-Element | Custom-Tag | Chrome 147 Engine Binding |
| :--- | :--- | :--- |
| **Root-Container** | `<din-5008 data-form="A|B">` | Steuert das gesamte Layout-Grid (Form A oder B). |
| **Papier-Monolith** | `<din-page>` | Absoluter A4-Monolith, zementierte Proportionen. |
| **CMA-Sensor** | `<din-cma-sensor>` | IntersectionObserver fÃ¼r Overflow-Detection (280mm). |

### IdentitÃ¤t & Branding
| DIN-Element | Custom-Tag | Funktion |
| :--- | :--- | :--- |
| **Briefkopf** | `<din-header>` | Container fÃ¼r Logos und Absender-Stammdaten. |
| **Logo** | `<din-logo>` | Firmenlogo-Platzhalter. |
| **Absender-Details**| `<din-sender-details>`| Granulare Meta-Daten des Absenders. |
| **V-Card / QR** | `<din-vcard>` | QR-Logik-Injektion. |

### Anschrift (11-Zeilen-Modell)
| DIN-Element | Custom-Tag | Constraint |
| :--- | :--- | :--- |
| **Gesamte Zone** | `<din-address-zone>` | 85x45mm Hard Constraint. |
| **RÃ¼cksendeangabe** | `<din-return-line>` | Zeile 1-3 (Obere Zone). |
| **Zusatz/Vermerk** | `<din-supplement>` | Zeile 4-5 (Obere Zone). |
| **EmpfÃ¤nger** | `<din-recipient>` | Zeile 6-11 (Untere Zone). Ãœberwacht durch Greetings Matrix. |

### Metadaten & LeitwÃ¶rter
| DIN-Element | Custom-Tag | Binding / Engine |
| :--- | :--- | :--- |
| **Informationsblock** | `<din-infoblock>` | 75mm rechts positioniert. |
| **LeitwÃ¶rter** | `<din-ref-line>` | "Ihr Zeichen", "Unser Zeichen". |
| **Datum** | `<din-date>` | **Temporal API** (Strict ISO-Handling). |

### Briefkern (Blink-Direct)
| DIN-Element | Custom-Tag | Constraint & API |
| :--- | :--- | :--- |
| **Betreff** | `<din-subject>` | 2-Leerzeilen-Constraint. |
| **Anrede** | `<din-salutation>` | Gesteuert durch Greetings Matrix basierend auf `<din-recipient>`. |
| **Haupttext** | `<din-body>` | **EditContext API** (transparentes Eingabefeld, entkoppelt vom DOM). |
| **Visueller Text** | `<din-body-mirror>` | **Sanitizer API** (`setHTML`), rendert das Ghost-Mirror SPEC-066. |
| **GruÃŸformel** | `<din-closing>` | Gesteuert durch Greetings Matrix. |
| **Unterschrift** | `<din-signature>` | Maschinenschriftliche Signatur. |
| **Anlagen** | `<din-attachments>` | Anlagenvermerk am Briefende. |

### Compliance & Sicherheit
| DIN-Element | Custom-Tag | Sicherheits-Constraint |
| :--- | :--- | :--- |
| **Werte/BetrÃ¤ge** | `<din-amount>` | **AviationMath Cent-Fallback** (V8 Floating-Point PrÃ¤vention). |
| **Bankdaten** | `<din-bank-data>` | IBAN Modulo-97 BigInt Validierung. |
| **Steuern/Register**| `<din-fiscal-data>`| USt-IdNr / Handelsregister. |
| **FuÃŸzeile** | `<din-footer>` | `@page` Margin-Box Bindung. |

---

## 2. MANDATORY ARCHITECTURAL CONSTRAINTS

*   **Constraint [MANDATE-TAG]:** Jedes HTML-Tag im Briefvordruck MUSS das PrÃ¤fix `din-` tragen. W3C-KonformitÃ¤t ist heilig; Tags ohne Bindestrich sind verboten.
*   **Constraint [MANDATE-INJ]:** `innerHTML` ist global vaporisiert. Nutze fÃ¼r alle DOM-Injektionen ausnahmslos `setHTML(html, { sanitizer: v4.0_CONFIG })`.
*   **Constraint [MANDATE-UI]:** Alle MaÃŸe werden zwingend als `@property` mit `inherits: false` registriert, um die Render-Performance der Blink-Engine zu maximieren.
*   **Constraint [MANDATE-WYSIWYG]:** Die Bearbeitung erfolgt zu 100% WYSIWYG direkt auf dem Dokument. Der Textfluss wird vollstÃ¤ndig Ã¼ber die **EditContext API** gesteuert.

