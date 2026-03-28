# Architecture Specification: SYSTEM_SSOT.md
# v4.0 Standard Protocol
**Status**: VERIFIED | **Version**: 4.0.0 | **Baseline**: Chrome 147+

This document is the **Single Source of Truth (SSoT)** for the IMR 4.0 (Isomorphic Master Registry). It defines the machine-level isomorphism between DIN 5008:2020-03 standards and the native browser implementation. Any deviation is a **PRECISION_VIOLATION**.

---

## 1. High-Integrity SEMANTIC MATRIX v4.0

### Layout & Structure
| Element | Custom-Tag | Chrome 147 Engine Binding |
| :--- | :--- | :--- |
| **Root** | `<din-5008>` | Master container for DIN logic. |
| **Paper** | `<din-A4>` | Fixed 210x297mm physical simulation. |

### Identity (Header Atoms)
| DIN Element | Custom-Tag | IMR Key |
| :--- | :--- | :--- |
| **First Name**| `<din-absender-vorname>` | `sender_fn` |
| **Last Name** | `<din-absender-nachname>`| `sender_ln` |
| **Street**    | `<din-absender-strasse>` | `sender_st` |
| **City/ZIP**  | `<din-absender-ort>`     | `sender_city` |

### Address Zone (85x45mm Atoms)
| DIN Element | Custom-Tag | IMR Key |
| :--- | :--- | :--- |
| **Return Line**| `<din-return-line>` | `return_line` |
| **Supplement** | `<din-supplement>` | `supplement` |
| **Company**    | `<din-empfaenger-firma>` | `rect_co` |
| **Name**       | `<din-empfaenger-name>`  | `rect_name` |
| **Street**     | `<din-empfaenger-strasse>`| `rect_st` |
| **City/ZIP**   | `<din-empfaenger-ort>`   | `rect_city` |

### Metadata & Metadata
| DIN Element | Custom-Tag | IMR Key |
| :--- | :--- | :--- |
| **Info Block** | `<din-infoblock>` | Container (125mm Left) |
| **Ref Ihr**    | `<din-ref-ihr>` | `ref_ihr` |
| **Ref Unser**  | `<din-ref-unser>` | `ref_unser` |
| **Date**       | `<din-date>` | `date` (50mm Top) |

### Core Content
| DIN Element | Custom-Tag | API / Binding |
| :--- | :--- | :--- |
| **Subject**    | `<din-subject>` | 2-line spacing constraint. |
| **Salutation** | `<din-anrede>` | Reactive Matrix update. |
| **Body (Source)**| `<din-text>` | **EditContext API**. |
| **Body (View)**  | `<din-text-mirror>` | **Sanitizer API** (`setHTML`). |
| **Greeting**   | `<din-grussformel>` | No trailing punctuation. |
| **Signature**  | `<din-signature>` | `signature` key. |
| **Attachments**| `<din-attachments>` | Optional end-matter. |

### Legal & Financial
| DIN Element | Custom-Tag | Enforcement |
| :--- | :--- | :--- |
| **Bank Data**  | `<din-bank-data>` | IBAN Modulo-97 BigInt. |
| **Fiscal Data**| `<din-fiscal-data>` | `footer` container binding. |

---

## 2. MANDATORY CONSTRAINTS

*   **[MANDATE-TAG]**: Every letter-specific HTML tag MUST use the `din-` prefix.
*   **[MANDATE-INJ]**: `innerHTML` is strictly prohibited. Use `setHTML(html, { sanitizer: CORE_SANITIZER })`.
*   **[MANDATE-UI]**: All geometric measurements are registered as `@property` via CSS.
*   **[MANDATE-WYSIWYG]**: Input is handled via **EditContext API** to decouple data from DOM representation.

**Lead Architect**
*Gemini CLI*
