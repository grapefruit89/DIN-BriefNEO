# IMR 4.0 — Die Definitive DIN 5008 Registry

Diese Liste definiert alle **42 atomaren Daten-Tags** sowie deren Container. 
X/Y-Werte beziehen sich auf **Form B**. Alle Maße in mm.

## 1. Absender-Zone (Header)
**Container:** `<din-absender>` | **X:** 125 | **Y:** 20 | **Max-B:** 75 | **Höhe:** 35

| Tag | Beschreibung | X | Y | Max-Maß (mm) |
| :--- | :--- | :--- | :--- | :--- |
| `<din-branding-logo>` | Unternehmenslogo | 125 | 10 | 75 x 20 |
| `<din-branding-wasserzeichen>` | Hintergrund-Layer | 0 | 0 | 210 x 297 |
| `<din-absender-vorname>` | Vorname | 125 | 20 | 75 x 5 |
| `<din-absender-nachname>` | Nachname | 125 | 25 | 75 x 5 |
| `<din-absender-strasse>` | Straße & Hausnr. | 125 | 30 | 75 x 5 |
| `<din-absender-ort>` | PLZ & Ort | 125 | 35 | 75 x 5 |
| `<din-absender-zusatz>` | Zusatz/Abteilung | 125 | 40 | 75 x 5 |
| `<din-absender-mail>` | E-Mail | 125 | 45 | 75 x 5 |
| `<din-absender-tel>` | Telefon | 125 | 50 | 75 x 5 |

## 2. Anschriftfeld
**Container:** `<din-anschriftfeld>` | **X:** 20 | **Y:** 45 | **Max-B:** 85 | **Höhe:** 45

| Tag | Beschreibung | X | Y | Max-Maß (mm) |
| :--- | :--- | :--- | :--- | :--- |
| `<din-rucksendezeile>` | Einzeilige Absenderangabe | 20 | 45 | 85 x 5 |
| `<din-zusaetze>` | Post-Zusätze (Einschreiben) | 20 | 50 | 85 x 5 |
| `<din-empfaenger-firma>` | Firmenname | 20 | 55 | 85 x 5 |
| `<din-empfaenger-abteilung>` | Abteilung / zu Händen | 20 | 60 | 85 x 5 |
| `<din-empfaenger-vorname>` | Vorname | 20 | 65 | 85 x 5 |
| `<din-empfaenger-nachname>` | Nachname | 20 | 70 | 85 x 5 |
| `<din-empfaenger-strasse>` | Straße & Hausnr. | 20 | 75 | 85 x 5 |
| `<din-empfaenger-ort>` | PLZ & Ort | 20 | 80 | 85 x 5 |

## 3. Metadaten & Infoblock
**Container:** `<din-infoblock>` | **X:** 125 | **Y:** 97.4 | **Max-B:** 75 | **Höhe:** variabel

| Tag | Beschreibung | X | Y | Max-Maß (mm) |
| :--- | :--- | :--- | :--- | :--- |
| `<din-ihr-zeichen>` | Wert (pur) | 125 | 97.4 | 75 x 5 |
| `<din-ihr-schreiben>` | Datum des Vorbriefs | 125 | 102.4| 75 x 5 |
| `<din-unser-zeichen>` | Wert (pur) | 125 | 107.4| 75 x 5 |
| `<din-unser-schreiben>` | Bezugsdatum | 125 | 112.4| 75 x 5 |
| `<din-durchwahl>` | Direkte Telefonnr. | 125 | 117.4| 75 x 5 |
| `<din-email-direkt>` | Direkte E-Mail | 125 | 122.4| 75 x 5 |
| `<din-internet>` | Web-URL | 125 | 127.4| 75 x 5 |
| `<din-datum>` | Briefdatum | 125 | 45 | 75 x 5 |

## 4. Briefkern
**Container:** `<din-kern>` | **X:** 25 | **Y:** 103.4 | **Max-B:** 165 | **Höhe:** variabel

| Tag | Beschreibung | X | Y | Max-Maß (mm) |
| :--- | :--- | :--- | :--- | :--- |
| `<din-betreff>` | Fett hervorgehoben | 25 | 103.4| 165 x 10 |
| `<din-anrede>` | Anredeformel | 25 | 118.4| 165 x 5 |
| `<din-text>` | Schreibbereich (Input) | 25 | 128.4| 165 x variabel |
| `<din-text-spiegel>` | Render-View (INTERNAL) | 25 | 128.4| 165 x variabel |
| `<din-grussformel>` | Grußformel | 25 | Ende | 165 x 5 |
| `<din-unterschrift>` | Name des Unterzeichners | 25 | Ende | 165 x 5 |
| `<din-anlagen>` | Anlagenverzeichnis | 25 | Ende | 165 x variabel |

## 5. Fußzeile (Footer)
**Container:** `<din-fuss>` | **X:** 25 | **Y:** 241 | **Max-B:** 165 | **Höhe:** variabel

| Tag | Beschreibung | X | Y | Max-Maß (mm) |
| :--- | :--- | :--- | :--- | :--- |
| `<din-fuss-firma>` | Voller Firmenname | 25 | 241 | 165 x 5 |
| `<din-fuss-sitz>` | Firmensitz | 25 | 246 | 165 x 5 |
| `<din-fuss-gericht>` | Registergericht | 25 | 251 | 165 x 5 |
| `<din-fuss-hrb>` | HRB Nummer | 25 | 256 | 165 x 5 |
| `<din-fuss-vorstand>` | Vorstand | 25 | 261 | 165 x 5 |
| `<din-fuss-gf>` | Geschäftsführung | 25 | 266 | 165 x 5 |
| `<din-fuss-stnr>` | Steuernummer | 25 | 271 | 165 x 5 |
| `<din-fuss-ustid>` | USt-IdNr. | 25 | 276 | 165 x 5 |
| `<din-fuss-bank>` | Kreditinstitut | 25 | 281 | 165 x 5 |
| `<din-fuss-iban>` | IBAN | 25 | 286 | 165 x 5 |
| `<din-fuss-bic>` | BIC | 25 | 291 | 165 x 5 |
| `<din-fuss-anschrift>` | Hausanschrift | 25 | 296 | 165 x 5 |
