# Addon `verlauf` — Brief-Verlauf, Absender- und Empfänger-Adressbuch

**Status: vorbereitet, NICHT geladen.** Kein `<script>` in
`/home/moritz/repos/DIN-BriefNEO/website/index.html`, kein `import` in
`main.js`, `boot.js` oder `boot-state.js`. Solange niemand die Datei lädt,
kostet das Addon **0 Byte** und ändert nichts am Verhalten.

```
/website/addons/verlauf/
├── verlauf.js    Datenschicht (kein DOM, keine Events)
└── README.md     dieses Konzept
```

---

## 1. Was es können soll

| Teil | Nutzen | Aufwand |
|---|---|---|
| **Brief-Verlauf** | Die letzten 10 Briefe lokal, mit einem Klick wiederherstellbar | S |
| **Absender-Adressbuch** | Name, Straße, Ort, Telefon, Mail als gespeicherte Absender-Profile | S |
| **Empfänger-Adressbuch** | Firma, Name, Straße, Ort als gespeicherte Empfänger | S |

Alle drei sind **lokal**. Kein Konto, kein Server, kein Service Worker (A37).

---

## 2. Die zentrale Entscheidung: kein neues Briefformat

Ein Verlaufs-Eintrag ist **genau das**, was der Export schreibt:
`buildDinLetterPayload()` aus `website/js/persistence.js`. Wiederherstellen
läuft über den **geprüften Import-Pfad**:

```
Verlaufseintrag
    └─ parseDinLetterPayload(payload)      ← validiert, prüft Schema v5
          └─ applyImportedData(result)     ← schreibt atomar in localStorage
```

Das heißt: kein zweiter Wiederherstellungsweg, keine zweite Wahrheit über das
Briefformat, und jede künftige Schema-Migration gilt automatisch für den
Verlauf mit. `historyToImport(id)` in `verlauf.js` gibt genau das Ergebnis
zurück, das `applyImportedData` erwartet.

---

## 3. Datenmodell

### Verlauf (Schlüssel `din_history`)

```js
{
  id:      "uuid",
  savedAt: "2026-11-15T10:12:00.000Z",
  label:   "Kündigung Mitgliedschaft",   // Betreff → Firma → Name → Datum
  payload: { format: "dinletter", schema_version: 5, layout: {...}, fields: [...] }
}
```

- **maximal 10 Einträge** (`HISTORY_LIMIT`)
- **zusätzlich byte-gedeckelt** auf 512 KiB (`HISTORY_BYTES`) — ein Brief mit
  viel Rich-Text kann einzeln groß sein
- **kein Doppel** nach Autosave: ist der neue Brief identisch mit dem neuesten
  Eintrag (Feldwerte + Layout), wird nur `savedAt` erneuert
- defekte Einträge werden beim Lesen **verworfen**, nicht repariert

### Adressbücher (`din_addressbook_sender`, `din_addressbook_recipient`)

```js
{
  id: "uuid", kind: "sender" | "recipient",
  label: "Meine Firma",        // Name → Firma → Straße → Ort
  name, firma, strasse, ort, tel, mail,
  usedAt: "2026-11-15T..."
}
```

Die Einträge spiegeln **1:1 die Brief-Felder**. Es wird nichts zerlegt
(Straße/Hausnummer, PLZ/Ort) — das ist Aufgabe des Parsers, nicht des Buchs.
Was im Brief steht, steht auch hier.

---

## 4. Warum eigene Schlüssel (und nicht `din_local_addresses`)

`website/js/persistence.js` kennt bereits `STORAGE_KEYS.addresses =
'din_local_addresses'`: eine Liste der letzten **50 gewählten** Adressen aus
der Suche (`address.js`). Und `website/js/draft-manager.js` **löscht** diesen
Schlüssel beim Zurücksetzen:

> „Privacy: die lokale Adress-Historie hält bis zu 50 zuletzt gewählte
> Empfängeradressen und gehört damit zum Brief, nicht zu den Präferenzen. Der
> Reset muss sie mitnehmen, sonst bleiben echte Adressen auf einem geteilten
> Rechner stehen." (`draft-manager.js`, um Zeile 476)

Ein Adressbuch ist das Gegenteil: **vom Nutzer getippt**, nicht aus der Suche
abgeleitet. Es darf nicht verschwinden, weil jemand den Brief zurücksetzt.
Deshalb zwei eigene Schlüssel. Die Such-Historie bleibt unangetastet.

---

## 5. Was bewusst NICHT drin ist

| Nicht enthalten | Warum |
|---|---|
| Signaturbild im Verlauf | liegt in IndexedDB (`binary-storage.js`); eine Kopie pro Eintrag wäre teuer und würde beim Löschen des Originals verwaisen |
| Anhänge / PDF | der Verlauf speichert den Brief, nicht seine Ausgabe |
| Verschlüsselung | localStorage ist nicht verschlüsselt; wer das braucht, braucht eine andere Ablage, kein Feature |
| Server-Sync | kein Konto, kein Netz (A1/A37) |
| Editor-UI | dieses Addon ist die Datenschicht; die Oberfläche kommt beim Scharfschalten (§6) |

**Datenschutz-Entscheidung, die dir gehört:** Soll „Zurücksetzen" den Verlauf
und die Adressbücher **mitlöschen** ( shared machine) oder **stehen lassen**
(Archiv)? Die Datenschicht kann beides; `clearHistory()` existiert. Diese
Entscheidung ist bewusst offen und nicht im Code vorweggenommen.

---

## 6. Aktivierung (wenn du es scharf schaltest)

Fünf Schritte, jeder einzeln prüfbar:

1. **Aufrufpunkt in `main.js`** — dynamischer Import, kein statisches `<script>`:
   ```js
   const { saveToHistory } = await import('../addons/verlauf/verlauf.js');
   ```
   Auslöser: beim Speichern (`DOCUMENT_SAVE_REQUESTED`, entprellt) **oder**
   nur beim Drucken/Export — das ist die offene Produktentscheidung.
2. **Oberfläche** — ein `<dialog>` mit drei Reitern (Verlauf / Absender /
   Empfänger). Ohne neue Abhängigkeit, `popover` oder `<dialog>` reichen.
3. **Adressbuch-Anwendung** — `bookEntryToFields()` liefert die Feldwerte, der
   Aufrufer setzt sie über `Field.setValue` (kein direktes `el.value`, sonst
   fehlt der Undo-Snapshot).
4. **Tests** — mindestens:
   - Ringpuffer: 12 Speicherungen → 10 Einträge, älteste weg
   - Autosave-Doppel: zweimal derselbe Brief → **ein** Eintrag, neuer Zeitstempel
   - Byte-Deckel: ein übergroßer Brief → `ok: false`, Verlauf unverändert
   - defekter Eintrag im Speicher → wird verworfen, Rest bleibt lesbar
   - Verlauf → `parseDinLetterPayload` → `applyImportedData` → Brief steht
   - Adressbuch: gleicher Eintrag zweimal → aktualisiert, nicht dupliziert
5. **Gates** — `node tools/test-runner.mjs`, `node tools/build_db.js`,
   `npx @biomejs/biome check website/`.

---

## 7. Quota-Rechnung (warum 10 reicht)

| Posten | Größe |
|---|---|
| ein Brief-Payload (34 Felder, Rich-Text) | ~4 KB gemessen (4250 Byte im Testentwurf) |
| 10 Einträge | ~40 KB |
| Adressbücher (je 50 Einträge × ~200 Byte) | ~20 KB |
| **Summe** | **~60 KB** von typisch 5 MB |

Der Byte-Deckel (512 KiB) greift also nur bei Ausreißern — und dann bleibt der
Verlauf nutzbar, statt die ganze Quota zu blockieren. `saveJSON` gibt `false`
zurück, wenn es nicht passt; `saveToHistory` meldet das als `ok: false`.

---

## 8. Was schon geprüft ist (2026-11-15, im Browser)

Die Datenschicht lief einmal durch, dynamisch importiert auf
`http://127.0.0.1:8088` (also im Zielbrowser mit `Temporal`, nicht in Node):

| Prüfung | Ergebnis |
|---|---|
| 12 Speicherungen | 10 Einträge, neuester „Brief 12", ältester „Brief 3" |
| derselbe Brief zweimal | **eine** id, neuer Zeitstempel |
| 600-KB-Brief | `ok: false`, Verlauf unverändert (10 Einträge) |
| Verlauf → `historyToImport` | `ok: true`, Betreff und Layout kommen zurück |
| Adressbuch, gleicher Absender in anderer Schreibweise | **1** Eintrag |
| Löschen | bekannt → `true`, unbekannt → `false` |

Die `localStorage`-Schlüssel wurden nach der Probe auf den alten Stand
zurückgesetzt. **Kein Test in der Suite** — der kommt mit der Aktivierung
(§6, Schritt 4).

## 9. Offene Fragen (Entscheidungen, keine Aufgaben)

1. **Wann speichern?** Bei jedem entprellten Autosave (dann füllt sich der
   Verlauf schnell mit Zwischenständen) oder nur bei Druck/Export (dann ist er
   ein Archiv echter Briefe)? Empfehlung: **nur bei Druck/Export** — sonst
   stehen zehn Fassungen desselben Briefes im Verlauf.
2. **Löscht „Zurücksetzen" den Verlauf?** Siehe §5.
3. **Adressbuch automatisch füllen?** Wenn ein Brief gedruckt wird, könnte der
   Empfänger ins Buch wandern. Bequem — aber es sammelt Adressen ohne
   Zustimmung. Empfehlung: **nur auf Klick** („Empfänger merken").
