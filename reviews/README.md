# Reviews in Scheiben

Ein Review ist hier **kein** Gesamturteil über das Projekt, sondern ein
Ausschnitt: eine Frage, zwei bis vier Dateien, ein Messblock. Diese Datei
beschreibt, wie eine solche Scheibe gebaut, geprüft und ausgewertet wird.

## Warum in Scheiben

Der Gegenversuch ist dokumentiert. Ein Fat Review (B14, 2026-11-13) bekam
`sidebar.css` mit 1290 Zeilen, drei Module, ein Inventur-File und einen
Auftrag mit neun Aufgaben. Ergebnis:

- Der Reviewer fand echte Fehler (Zonen-Struktur, Statuszeile im falschen
  Modus, Escape nur auf der Checkbox) — **weil** er nachgezählt hat.
- Er übernahm aber auch neun Zahlen aus dem Auftrag, die beim Schreiben schon
  veraltet waren, und empfahl dreimal etwas, das längst entschieden war.
- Zwei meiner Messwerte waren falsch (7 von 7 Modus-Regeln tragen Design-Adressen,
  nicht 6; es sind 21 Tab-Stopps, nicht 22). Gefunden hat er sie nur, weil er
  die Zahl nachgerechnet hat, statt sie zu glauben.

Kleine Scheiben ändern daran drei Dinge: weniger Zahlen, die veralten können;
jede Zahl ist prüfbar; eine Empfehlung trifft auf weniger bereits getroffene
Entscheidungen.

## Aufbau einer Scheibe

```
reviews/
├── README.md          ← diese Datei
├── merge.py           ← baut aus files.txt eine Anhaenge-Datei
├── kontrakt.py        ← schreibt KONTRAKT.md (was die Scheibe von aussen braucht)
└── 2026-11-13-seitenleiste/
    ├── prompt.md      ← der Auftrag
    ├── files.txt      ← eine Pfadzeile je Quelle
    ├── KONTRAKT.md    ← generiert, committen erlaubt
    └── merge.txt      ← generiert, NICHT committen (steht in .gitignore)
```

Alle Pfade in `files.txt` absolut oder relativ zum Repo-Wurzelverzeichnis:

```
# reviews/2026-11-13-seitenleiste/files.txt
/home/moritz/repos/DIN-BriefNEO/website/index.html
/home/moritz/repos/DIN-BriefNEO/website/css/sidebar.css
```

## Ablauf

**1. Scheibe schneiden.** Kriterien: eine Frage, 2–4 Dateien, ein Messblock.
Passt die Frage nicht in einen Satz, sind es zwei Reviews. Gehören mehr als
vier Dateien dazu, ist der Schnitt zu grob.

**2. Messen, bevor der Prompt geschrieben wird.** Read-only am laufenden
Objekt (Dev-Server + CDP), nicht am Modellgedächtnis. Was gemessen wurde, kommt
**in den Prompt**, nicht in eine Datei, die drei Commits später veraltet ist.

**3. `prompt.md` schreiben.** Pflichtbausteine:

- **Rolle** und was der Reviewer *nicht* tun soll (nichts ändern).
- **Harte Regeln** des Projekts (Gesetze, Verbote, Baseline).
- **Was bereits behoben ist** — als Tabelle. Ohne diesen Block meldet der
  Reviewer erledigte Befunde erneut und verbrennt sein Budget.
- **Aufgaben mit Gegenprobe**: jede Frage so stellen, dass die Antwort
  prüfbar ist („nenne Nummern, keine Meinung", „welcher Nachweis fehlt heute").
- **Messmethode mitliefern**: „Tab-Stopp" heißt Tab-Walk, nicht
  `querySelectorAll('input')`. Sonst zählt der Reviewer DOM-Elemente und
  liegt um eins daneben (2026-11-13 passiert).
- **Antwortform**: kurz, Beleg pro Behauptung, ohne Beleg `ungeprüft` +
  Gegenprobe, am Ende A/B/C mit Kosten.
- **Verbote**: kein Framework, kein Umbau ohne belegten Schaden, entschiedene
  Themen nur mit neuem Messwert.

**4. Snapshot bauen.**

```
python3 /home/moritz/repos/DIN-BriefNEO/reviews/kontrakt.py <scheibe>
python3 /home/moritz/repos/DIN-BriefNEO/reviews/merge.py <scheibe>
```

`merge.py` prüft sich selbst: die Zahl der Quellblöcke muss zur Zahl der
Dateien passen, sonst bricht der Lauf ab. Angehängt wird **nur** `merge.txt`,
plus `prompt.md` als Text.

**5. Auswerten, nicht übernehmen.** Jeder Befund wird am Code oder am Objekt
nachgerechnet (`git show <stand>:datei`, `grep`, Messung). Drei Sorten:

| Sorte | Umgang |
|---|---|
| belegt und heute noch wahr | fixen, mit Messung vorher/nachher |
| belegt, aber durch einen späteren Commit erledigt | verwerfen, im Log vermerken |
| plausibel, aber „ungeprüft" | nachmessen, dann entscheiden — nie auf Verdacht bauen |

**6. Nach dem Fix.** Messung wiederholen, eine Ratsche in `test/all.js`
ergänzen, Eintrag ins `DECISION-LOG` mit Zahlen. Kein „erledigt" ohne Nachweis.

## Fallen aus der Praxis

- **Der Snapshot ist der Arbeitsbaum, nicht der Commit.** Der Kopf sagt
  „Arbeitsbaum auf Basis HEAD x". Wird vor dem Commit gebaut, enthält er
  Änderungen, die im Commit noch nicht stehen — B14 hat genau das erwischt
  (`main.js` war im Snapshot neuer als der genannte Commit). Verbindlich ist
  die SHA256-Tabelle; im Prompt steht, dass sie gilt.
- **Der Anhang veraltet im nächsten Commit.** Der B15-Folgeprompt war nach
  `3408e64` (Radiogruppe) bereits Geschichte, obwohl er am Tag davor gebaut
  wurde. Nach einem Umbau: neue Scheibe, nicht alten Prompt nachschieben.
- **Zahlen im Prompt sind Versprechen.** Wer „22 Tab-Stopps" schreibt, muss
  die Zählweise mitliefern, sonst korrigiert der Reviewer entweder richtig
  oder falsch — beides kostet eine Runde.
- **`merge.txt` nicht committen.** Sie trägt den Commit im Kopf und ist nach
  dem Commit schon wieder anders. Deshalb steht sie in `.gitignore`; im Repo
  liegt nur `prompt.md`, `files.txt` und das generierte `KONTRAKT.md`.

## Was hier nicht hingehört

- Ein Review ohne Messwerte („sieht unaufgeräumt aus").
- Eine Empfehlung ohne Gegenprobe.
- Ein Umbau „weil modern". Entscheidungen dieses Projekts stehen im
  `DECISION-LOG`; sie werden nur mit neuem Messwert wieder geöffnet.
- Screenshots als Beweis. Zahlen und Zitate reichen.
