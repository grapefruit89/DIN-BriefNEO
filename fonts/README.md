# fonts — Typografie-Asset-Pipeline & Rohschriften

Dieses Verzeichnis bündelt alle Quelldateien und Werkzeuge für die Schriftarten-Optimierung nach **DIN 5008**.

## Inhalt

| Datei | Funktion |
| :--- | :--- |
| `*.ttf` / `*.otf` | Rohschriftarten (z. B. Aptos, Inter, Michelangelus). Git-ignoriert. |
| [`subset_fonts.py`](subset_fonts.py) | Python-Pipeline (`fontTools`). Dampft Rohschriften in DIN-5008-konforme `.woff2`-Dateien ein. |

## Ausführung

```bash
python3 fonts/subset_fonts.py
```

Das Skript liest alle Schriften aus diesem Verzeichnis und schreibt die optimierten `.woff2`-Dateien direkt nach `website/fonts/`.
Die produktiven Webfonts in `website/fonts/` bleiben davon unberührt und werden in der Web-App ausgeliefert.
