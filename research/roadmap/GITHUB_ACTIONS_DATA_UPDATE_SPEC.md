# Vollautomatische Datenwartung mit GitHub Actions (Zero-Maintenance CI/CD)

> **Status:** Architektur- & CI/CD-Spezifikation für DIN-Brief Neo.  
> **Ziel:** Vollständige Automatisierung der PLZ- und Großempfänger-Wartung ohne manuellen Entwickleraufwand.  
> **Workflow-Datei:** `research_scripts/github_action_update_plz.yml` (einsatzbereit für `.github/workflows/update-plz.yml`).

---

## 1. Die Antwort: Ja, absolut! GitHub Actions ist die perfekte Lösung

Statt dass ein Entwickler daran denken muss, alle paar Monate lokal ein Skript auszuführen, übernimmt **GitHub Actions als cloud-basierter Cron-Worker** die gesamte Datenpflege vollkommen autonom und kostenlos.

---

## 2. Der Lebenszyklus des automatisierten GitHub Workflows

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          1. Trigger-Ebene                               │
│  - Automatisch: Jeden Quartalsbeginn (1. Jan, 1. Apr, 1. Jul, 1. Okt)   │
│  - Manuell: 1-Klick-Button ("Run workflow") im GitHub Web-Interface     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Startet Ubuntu-Runner
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      2. Pipeline-Ausführung                             │
│  - Checkout des Repositorys                                             │
│  - Lädt kanonischen Open-Data-PLZ-Dump herunter                         │
│  - Führt Großempfänger & Verfassungsorgane zusammen                     │
│  - Komprimiert zu de_plz_ort.json.br (70,5 KB, Brotli Q11)              │
│  - Schreibt plz_manifest.json mit neuem Timestamp                       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Git Diff Check
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          3. Git-Entscheidung                            │
│                                                                         │
│  Haben sich Daten geändert?                                             │
│       ├── NEIN ➔ Beendet sich lautlos (Kein unnötiger Commit!)          │
│       │                                                                 │
│       └── JA   ➔ Automatischer Commit durch github-actions[bot]         │
│                  Push ins Repository ➔ Löst Webseiten-Deploy aus!       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Die Kernkomponenten des Workflows im Detail

### A. Der Cron-Zeitplan (`cron: '0 4 1 */3 *'`)
- Läuft alle 3 Monate um 04:00 Uhr morgens UTC.
- **Warum vierteljährlich?**  
  Die Deutsche Post veröffentlicht ihr *Mitteilungsblatt Großempfänger* quartalsweise. Ein vierteljährlicher Lauf fängt alle Neuzugänge und Abgänge zeitnah ab.

### B. Der manuelle Notfall-Button (`workflow_dispatch`)
- Hat die Bundesregierung ein neues Ministerium gegründet oder ist ein Großempfänger umgezogen, muss man nicht 3 Monate warten:
- Im GitHub-Tab **Actions** klickt man einfach auf **„Run workflow“** ➔ 30 Sekunden später sind die frischen Daten im Master-Branch!

### C. Der „No-Noise“-Schutz (Diff-Prüfung)
- Wenn die Deutsche Post im letzten Quartal keine Änderungen hatte, erzeugt der Bot **keinen Commit**.
- Die Git-Historie bleibt sauber und wird nicht mit leeren Pseudo-Commits zugemüllt.

### D. Automatisches Re-Deployment
- Da DIN-Brief Neo eine statische Web-App ist (z. B. auf GitHub Pages, Cloudflare Pages oder Netlify):
- Sobald `github-actions[bot]` die aktualisierte `de_plz_ort.json.br` committet, stößt der Git-Push automatisch das Hosting-Deployment an.
- Die Nutzer erhalten die neue Version beim nächsten Laden im Browser ohne jede Unterbrechung.

---

## 4. Wie man den Workflow im Repository aktiviert

Sobald das Feature in das Produktiv-Repository überführt wird:
1. Kopiere `research_scripts/github_action_update_plz.yml` in das Zielverzeichnis:  
   `.github/workflows/update-plz.yml`
2. Sicherstellen, dass in den GitHub-Repository-Einstellungen unter:  
   `Settings ➔ Actions ➔ General ➔ Workflow permissions`  
   die Option **„Read and write permissions“** aktiviert ist.
3. Fertig! Ab sofort wartet sich die Adress- und Großempfänger-Datenbank von DIN-Brief Neo **ein Leben lang vollkommen von selbst**.
