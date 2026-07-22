---
aliases:
- Testing Guide
- QA Protokoll
code_links: []
created: '2026-06-26'
depends_on: []
doc_links: []
id: guide-testing-guide
last-updated: 2026-07-02
project: DIN-BriefNEO
status: active
tags:
- obsidian
- documentation
- guide
- manual
- qa
title: 'Guide: Interaktiver Test-Leitfaden: testing-guide.md'
type: guide
updated: '2026-07-07'
---

# Interaktiver Test-Leitfaden: testing-guide.md

> [!info] Testing Guide
> Dieser Testing-Guide beschreibt alle manuellen Testfälle, um die Refactored Baseline-Features von **DIN-BriefNEO** systematisch und reproduzierbar auf Fehler zu überprüfen.

---

## 🧪 Manuelle Testfälle (QA-Protokoll)

### 1. Textverarbeitung & Formatierung

#### Testfall 1: Plaintext-Paste-Filter

*   **Ausgangssituation:** Das Feld „Brieftext“ (`#brieftext`) ist leer oder befüllt.

*   **Aktion:** Einen formatierten Text kopieren und einfügen.

*   **Erwartetes Ergebnis:** Bedingungslose Befreiung von Formatierungen, Farben, fremden Schriften und Links. Reiner Plaintext.

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 2: Plaintext-Drag-and-Drop-Filter

*   **Ausgangssituation:** Das Feld „Brieftext“ (`#brieftext`) ist aktiv.

*   **Aktion:** Formatierten Text via Drag-and-Drop in das Feld ziehen.

*   **Erwartetes Ergebnis:** Reiner Text, alle Format-Reste rückstandslos entfernt.

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 3: WhatsApp-Style Selection Popover Toolbar

*   **Ausgangssituation:** Der Brieftext enthält Text.

*   **Aktion:** Text markieren. Auf B (Fett) oder U (Unterstrichen) klicken. Erneut markieren.

*   **Erwartetes Ergebnis:** Toolbar schwebt im Top-Layer. Buttons leuchten auf bei aktivem Status.

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 4: Blockquote-Toggling (Range API Unwrap)

*   **Ausgangssituation:** Ein Absatz im Brieftext ist markiert.

*   **Aktion:** Zitat-Symbol klicken. Erneut klicken.

*   **Erwartetes Ergebnis:** Zitat wird zum `<blockquote>`. Beim zweiten Klick wird der `<blockquote>`-Tag sicher entfernt, der Text bleibt als normaler Fließtext erhalten (Unwrap ohne Textverdopplung).

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 13: Keyboard-only Bedienung der Toolbar

*   **Ausgangssituation:** Der Brieftext ist aktiv.

*   **Aktion:** Text mit Umschalt+Pfeiltasten markieren, Toolbar muss per Tabulator/Tastatur-Shortcuts nutzbar sein.

*   **Erwartetes Ergebnis:** Barrierefreie Nutzung ohne Maus möglich.

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

---

### 2. Layout & Interaktion

#### Testfall 5: Toast-Notification Queue (Stacking-Schutz)

*   **Aktion:** 5- bis 10-mal sehr schnell auf Sidebar-Buttons klicken.

*   **Erwartetes Ergebnis:** Kein hässliches Übereinanderstapeln. Meldungen erscheinen sauber nacheinander.

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 10: A4-Überlaufwarnung **[Prio 1]**

*   **Aktion:** Viel Text einfügen, bis das Seitenende berührt wird.

*   **Erwartetes Ergebnis:** Gestrichelter roter Rahmen, Warn-Badge, Toast-Meldung.

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 11: Sehr langer Betreff (Überlauf) **[Prio 1]**

*   **Aktion:** Betreff über 2 Zeilen füllen und Enter drücken.

*   **Erwartetes Ergebnis:** Blockiert Eingabe, roter Warnrahmen bei Zeile 3.

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 14: Form A vs Form B Wechsel mit Inhalt

*   **Aktion:** Brief füllen, dann in Sidebar Form wechseln.

*   **Erwartetes Ergebnis:** Inhalt bleibt exakt erhalten, Positionen (Falzmarken, Fenster) wechseln nahtlos per CSS-Variable.

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

---

### 3. Schriften & APIs

#### Testfall 6: Schriftarten-Wechsel (System Stacks)

*   **Aktion:** Zwischen Sans, Serif, Mono wechseln.

*   **Erwartetes Ergebnis:** Schriftart des gesamten Briefs ändert sich synchron.

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 7: WOFF2-Uploader

*   **Aktion:** Lokale Schrift hochladen, F5 drücken.

*   **Erwartetes Ergebnis:** Schrift wird sofort angewendet und überlebt einen Reload via Base64 LocalStorage.

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 8: Dual-Provider Adress-Autocomplete **[Prio 1]**

*   **Aktion:** API testen, Keys eintragen.

*   **Erwartetes Ergebnis:** Wechsel funktioniert, fehlender Key blockiert Suche sauber.

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 9: PLZ-Proximity-Biasing & Zippopotam

*   **Aktion:** Absender-PLZ eintragen und dann Empfänger suchen.

*   **Erwartetes Ergebnis:** Lokale Adressen werden präferiert; Zippopotam löst PLZ korrekt auf.

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |

#### Testfall 12: Sonderzeichen in Adresse

*   **Aktion:** Adresse mit Umlauten (ä,ö,ü) und "ß" in die Suche eingeben.

*   **Erwartetes Ergebnis:** Adress-API verarbeitet und rendert Sonderzeichen korrekt im DOM ohne Encoding-Fehler.

*   **Status:**

    | Status | Getestet am | Tester | Ergebnis |
    | :--- | :--- | :--- | :--- |
    | ⏳ Offen | - | - | - |