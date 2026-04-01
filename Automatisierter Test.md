## 🎯 Mega-Prompt für Gemini CLI – Vollautomatischer Audit & Fix

Ich erstelle einen **ausgefuchsten Prompt**, der Gemini CLI anweist, die gesamte Anwendung **automatisch zu testen, zu analysieren und zu reparieren**.

---

```markdown
# 🚨 ULTIMATIVE AUDIT-MISSION: DIN-BriefNEO Platinum Check

**Auftraggeber:** Lead Architect  
**Ziel:** Vollständige, automatische Prüfung und Reparatur der DIN-BriefNEO Anwendung  
**Modus:** Zero-Toleranz für Bugs | Jeder Button wird getestet | Jeder Fehler wird protokolliert und behoben

---

## 📋 MISSION

Führe eine **vollautomatische Audit-Tour** durch die DIN-BriefNEO Anwendung durch. Prüfe **jede UI-Komponente**, dokumentiere Abweichungen und behebe sie **sofort**.

### Ausführungsmodus
1. **Öffne** `index.html` im Browser (Chrome 147+)
2. **Scanne** die Seite mit Playwright/Puppeteer (simuliere echten Nutzer)
3. **Klicke** nacheinander auf **jeden Button, jede Radio-Gruppe, jeden Toggle**
4. **Mache Screenshots** vorher/nachher
5. **Analysiere** ob das Verhalten der Spezifikation entspricht
6. **Behebe** Fehler direkt im Code
7. **Wiederhole** bis alle Prüfungen grün sind
8. **Erstelle** einen detaillierten Audit-Report

---

## 🎯 PRÜFLISTE (Alle Punkte MÜSSEN getestet werden)

### A. Layout & Varianten

| # | Element | Aktion | Erwartetes Verhalten | Status |
|---|---------|--------|---------------------|--------|
| A1 | **Form A Radio** | Klick | Anschriftfeld bei 27mm, Faltmarken bei 87/192mm | ⬜ |
| A2 | **Form B Radio** | Klick | Anschriftfeld bei 45mm, Faltmarken bei 105/210mm | ⬜ |
| A3 | **Form C Radio** | Klick | Alle Elemente gestapelt, kein Absolut-Positioning, Header-Spacer ausgeblendet | ⬜ |

### B. Hilfsmittel (MÜSSEN unabhängig schaltbar sein)

| # | Element | Aktion | Erwartetes Verhalten | Status |
|---|---------|--------|---------------------|--------|
| B1 | **Layout-Guides** | Klick | Falzmarken sichtbar | ⬜ |
| B2 | **Layout-Guides** | Nochmal Klick | Falzmarken verschwinden | ⬜ |
| B3 | **DIN-Referenz** | Klick | SVG-Overlay (Referenzlinien) sichtbar | ⬜ |
| B4 | **DIN-Referenz** | Nochmal Klick | Overlay verschwindet | ⬜ |
| B5 | **vCard QR-Code** | Klick | QR-Code im Briefkopf sichtbar | ⬜ |
| B6 | **vCard QR-Code** | Nochmal Klick | QR-Code verschwindet | ⬜ |
| B7 | **Kombination** | Alle drei aktivieren | Alle Effekte gleichzeitig sichtbar | ⬜ |
| B8 | **Kombination** | Einen deaktivieren | Nur die anderen bleiben sichtbar | ⬜ |

### C. Empfänger & Anrede

| # | Element | Aktion | Erwartetes Verhalten | Status |
|---|---------|--------|---------------------|--------|
| C1 | **Empfänger-Feld** | "Herr Schmidt" eingeben | Anrede ändert sich zu "Sehr geehrter Herr Schmidt," | ⬜ |
| C2 | **Empfänger-Feld** | "Frau Schmidt" eingeben | Anrede ändert sich zu "Sehr geehrte Frau Schmidt," | ⬜ |
| C3 | **Anrede-Stil: Formal** | Klick | Anrede: "Sehr geehrte/r ..." | ⬜ |
| C4 | **Anrede-Stil: Höflich** | Klick | Anrede: "Guten Tag, ..." | ⬜ |
| C5 | **Anrede-Stil: Locker** | Klick | Anrede: "Hallo ..." | ⬜ |
| C6 | **Manuelle Anrede** | Text überschreiben | Automatik deaktiviert (kein Überschreiben) | ⬜ |

### D. Arbeitsmodus (Tag/Nacht)

| # | Element | Aktion | Erwartetes Verhalten | Status |
|---|---------|--------|---------------------|--------|
| D1 | **Tag-Modus** | Standard | Sidebar blau, Papier weiß | ⬜ |
| D2 | **Nacht-Modus** | Klick | Sidebar bleibt blau, Papier wird abgedunkelt, Hintergrund dunkel | ⬜ |
| D3 | **Nacht-Modus** | Text eingeben | Textfarbe hell/lesbar | ⬜ |

### E. 3D-Carousel & Seiten-Management

| # | Element | Aktion | Erwartetes Verhalten | Status |
|---|---------|--------|---------------------|--------|
| E1 | **Pfeil rechts** | Klick | Nächste Seite rückt in die Mitte | ⬜ |
| E2 | **Pfeil links** | Klick | Vorherige Seite rückt in die Mitte | ⬜ |
| E3 | **Tastatur (→)** | Drücken | Nächste Seite | ⬜ |
| E4 | **Tastatur (←)** | Drücken | Vorherige Seite | ⬜ |
| E5 | **Klick auf Hintergrund-Seite** | Klick | Geklickte Seite wird aktiv | ⬜ |
| E6 | **Plus-Button (+)** | Klick | Neue leere Seite wird angehängt | ⬜ |
| E7 | **Plus-Button (bei 12 Seiten)** | Klick | Toast-Warnung: "Maximal 12 Seiten" | ⬜ |
| E8 | **Seitenzahl-Anzeige** | Nach Navigation | Zeigt korrekt "Seite X / Y" an | ⬜ |

### F. Fußzeile & Profile

| # | Element | Aktion | Erwartetes Verhalten | Status |
|---|---------|--------|---------------------|--------|
| F1 | **Profil bearbeiten** | Button | Dialog öffnet sich | ⬜ |
| F2 | **Profil speichern** | Daten eingeben | Fußzeile zeigt nur gefüllte Felder (leere unsichtbar) | ⬜ |
| F3 | **Anlagen-Feld** | Text eingeben | Wird nur sichtbar wenn gefüllt | ⬜ |
| F4 | **Firmensitz-Feld** | Text eingeben | Wird nur sichtbar wenn gefüllt | ⬜ |

### G. Archiv & Export

| # | Element | Aktion | Erwartetes Verhalten | Status |
|---|---------|--------|---------------------|--------|
| G1 | **Brief sichern** | Klick | Eintrag erscheint in Archiv-Liste | ⬜ |
| G2 | **Archiv-Eintrag laden** | Klick | Brief wird wiederhergestellt | ⬜ |
| G3 | **Archiv-Eintrag löschen** | Klick | Eintrag verschwindet | ⬜ |
| G4 | **Export (JSON)** | Klick | JSON-Datei wird heruntergeladen | ⬜ |
| G5 | **Reset** | Klick | Dialog erscheint | ⬜ |
| G6 | **Reset bestätigen** | "Alles löschen" | Brief wird geleert, Carousel springt zu Seite 1 | ⬜ |

### H. Adress-Suche

| # | Element | Aktion | Erwartetes Verhalten | Status |
|---|---------|--------|---------------------|--------|
| H1 | **Photon (Standard)** | Adresse eingeben | Vorschläge erscheinen | ⬜ |
| H2 | **Geoapify** | Umschalten | Key-Eingabefeld erscheint | ⬜ |
| H3 | **Geoapify Key** | Eingeben | Validierung läuft | ⬜ |

### I. Druck & PDF

| # | Element | Aktion | Erwartetes Verhalten | Status |
|---|---------|--------|---------------------|--------|
| I1 | **Drucken / PDF** | Klick | Druck-Dialog öffnet sich | ⬜ |
| I2 | **Druckvorschau** | Ansicht | 3D-Transformationen deaktiviert, Seiten linear | ⬜ |

---

## 🤖 AUTOMATISIERUNGS-SKRIPT (Playwright/Puppeteer)

```javascript
// audit.js – Vollautomatischer Test
import { chromium } from 'playwright';

async function runAudit() {
  console.log('🚀 Starte DIN-BriefNEO Platinum Audit...');
  
  const browser = await chromium.launch({ headless: false }); // sichtbar für Debug
  const page = await browser.newPage();
  
  // Großer Viewport für Carousel
  await page.setViewportSize({ width: 1600, height: 1200 });
  
  await page.goto('http://localhost:8080/index.html');
  
  // Screenshot-Verzeichnis
  const screenshotDir = './audit-screenshots';
  await fs.mkdir(screenshotDir, { recursive: true });
  
  const results = [];
  
  // --- HILFSFUNKTIONEN ---
  async function clickAndCapture(selector, name, expectedState) {
    await page.click(selector);
    await page.waitForTimeout(500);
    const screenshot = `${screenshotDir}/${name}.png`;
    await page.screenshot({ path: screenshot });
    
    // Prüfe ob erwarteter Zustand eintritt
    const state = await page.evaluate(expectedState);
    results.push({ name, passed: state, screenshot });
    return state;
  }
  
  async function checkToggleIndependence(checkbox1, checkbox2, name) {
    // Nur checkbox1 aktivieren
    await page.click(checkbox1);
    await page.waitForTimeout(300);
    const state1 = await page.isChecked(checkbox2);
    
    // checkbox1 deaktivieren, checkbox2 aktivieren
    await page.click(checkbox1);
    await page.click(checkbox2);
    await page.waitForTimeout(300);
    const state2 = await page.isChecked(checkbox1);
    
    const passed = !state1 && !state2;
    results.push({ name, passed });
    return passed;
  }
  
  // --- TEST A: LAYOUT-VARIANTEN ---
  console.log('\n📐 TEST A: Layout-Varianten...');
  
  // Form A
  await clickAndCapture('#state-layout-a', 'layout-a', async () => {
    const addr = await page.$eval('din-anschriftfeld', el => getComputedStyle(el).top);
    return addr.includes('27mm') || addr.includes('27px');
  });
  
  // Form B
  await clickAndCapture('#state-layout-b', 'layout-b', async () => {
    const addr = await page.$eval('din-anschriftfeld', el => getComputedStyle(el).top);
    return addr.includes('45mm') || addr.includes('45px');
  });
  
  // Form C – kritisch: muss gestapelt sein, kein Absolute-Positioning
  await clickAndCapture('#state-layout-c', 'layout-c', async () => {
    const absender = await page.$eval('din-absender', el => getComputedStyle(el).position);
    const anschrift = await page.$eval('din-anschriftfeld', el => getComputedStyle(el).position);
    const headerSpacer = await page.$eval('din-header-spacer', el => getComputedStyle(el).display);
    return absender === 'relative' && anschrift === 'relative' && headerSpacer === 'none';
  });
  
  // --- TEST B: HILFSMITTEL (UNTERSCHIEDLICH) ---
  console.log('\n🛠️ TEST B: Hilfsmittel unabhängig...');
  
  // Prüfe ob sie unabhängig schaltbar sind
  await checkToggleIndependence('#state-guides', '#state-reference', 'guides-vs-reference');
  await checkToggleIndependence('#state-guides', '#state-qr', 'guides-vs-qr');
  await checkToggleIndependence('#state-reference', '#state-qr', 'reference-vs-qr');
  
  // Prüfe einzeln
  await clickAndCapture('#state-guides', 'guides-on', async () => {
    const foldMarks = await page.$$eval('din-falz-oben, din-falz-unten', els => 
      els.every(el => getComputedStyle(el).opacity === '1')
    );
    return foldMarks;
  });
  
  await clickAndCapture('#state-reference', 'reference-on', async () => {
    const overlay = await page.$eval('#din-reference-overlay', el => getComputedStyle(el).opacity);
    return overlay !== '0';
  });
  
  await clickAndCapture('#state-qr', 'qr-on', async () => {
    const qr = await page.$eval('din-qr-code', el => getComputedStyle(el).display);
    return qr !== 'none';
  });
  
  // --- TEST C: ANREDE-STIL ---
  console.log('\n✉️ TEST C: Anrede-Stil...');
  
  // Empfänger setzen
  await page.fill('din-empfaenger-vorname', 'Max');
  await page.fill('din-empfaenger-nachname', 'Mustermann');
  
  // Formal
  await clickAndCapture('#formal-style', 'salutation-formal', async () => {
    const anrede = await page.$eval('din-anrede', el => el.textContent);
    return anrede.includes('Sehr geehrter Herr');
  });
  
  // Höflich
  await clickAndCapture('#polite-style', 'salutation-polite', async () => {
    const anrede = await page.$eval('din-anrede', el => el.textContent);
    return anrede.includes('Guten Tag');
  });
  
  // Locker
  await clickAndCapture('#casual-style', 'salutation-casual', async () => {
    const anrede = await page.$eval('din-anrede', el => el.textContent);
    return anrede.includes('Hallo');
  });
  
  // --- TEST D: NACHTMODUS ---
  console.log('\n🌙 TEST D: Nachtmodus...');
  
  await clickAndCapture('#theme-night', 'night-mode', async () => {
    const sidebarBg = await page.$eval('#sidebar-left', el => getComputedStyle(el).backgroundColor);
    const paperBg = await page.$eval('din-A4', el => getComputedStyle(el).backgroundColor);
    const viewportBg = await page.$eval('#paper-viewport', el => getComputedStyle(el).backgroundColor);
    
    // Sidebar blau (nicht schwarz), Papier dunkel, Hintergrund dunkel
    const sidebarOk = sidebarBg.includes('15') || sidebarBg.includes('17'); // nicht schwarz
    const paperOk = paperBg !== 'rgb(255, 255, 255)';
    const viewportOk = viewportBg !== 'rgb(255, 255, 255)';
    
    return sidebarOk && paperOk && viewportOk;
  });
  
  // Zurück zu Tag
  await page.click('#theme-day');
  
  // --- TEST E: 3D-CAROUSEL & SEITEN ---
  console.log('\n🎠 TEST E: 3D-Carousel...');
  
  // Prüfe Plus-Button existiert
  const hasAddButton = await page.$('#btn-add-page');
  if (!hasAddButton) {
    results.push({ name: 'add-button-exists', passed: false, error: 'Plus-Button fehlt' });
  } else {
    // Füge 3 Seiten hinzu
    for (let i = 0; i < 3; i++) {
      await page.click('#btn-add-page');
      await page.waitForTimeout(300);
    }
    
    // Prüfe Seitenzahl
    await clickAndCapture('#btn-next', 'carousel-next', async () => {
      const pageInfo = await page.$eval('#page-info', el => el.textContent);
      return pageInfo === 'Seite 2 / 4';
    });
    
    // Prüfe Keyboard
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    const pageInfo = await page.$eval('#page-info', el => el.textContent);
    if (pageInfo !== 'Seite 3 / 4') {
      results.push({ name: 'keyboard-navigation', passed: false });
    }
    
    // Prüfe Max-Seiten-Limit
    for (let i = 0; i < 10; i++) {
      await page.click('#btn-add-page');
      await page.waitForTimeout(100);
    }
    const toastVisible = await page.$('#toast-v4:popover-open');
    if (!toastVisible) {
      results.push({ name: 'max-pages-limit', passed: false, error: 'Toast-Warnung nicht erschienen' });
    }
  }
  
  // --- TEST F: FUSSZEILE (Leere Elemente unsichtbar) ---
  console.log('\n📄 TEST F: Fußzeile...');
  
  // Prüfe ob leere Footer-Elemente versteckt sind
  const emptyFooters = await page.$$eval('din-fuss > *', els => 
    els.filter(el => el.textContent.trim() === '' && getComputedStyle(el).display !== 'none')
  );
  
  if (emptyFooters.length > 0) {
    results.push({ name: 'empty-footers-hidden', passed: false, count: emptyFooters.length });
  }
  
  // Profil füllen
  await page.click('#btn-open-profile');
  await page.fill('#profile-firstName', 'Max');
  await page.fill('#profile-lastName', 'Mustermann');
  await page.fill('#profile-street', 'Musterstraße 1');
  await page.fill('#profile-zip', '12345');
  await page.fill('#profile-city', 'Berlin');
  await page.fill('#profile-phone', '030 123456');
  await page.fill('#profile-email', 'max@example.com');
  await page.fill('#profile-iban', 'DE89370400440532013000');
  await page.click('#btn-profile-done');
  
  // Prüfe ob Fußzeile jetzt Elemente zeigt
  await page.waitForTimeout(500);
  const filledFooters = await page.$$eval('din-fuss > *', els => 
    els.filter(el => el.textContent.trim() !== '' && getComputedStyle(el).display !== 'none')
  );
  
  if (filledFooters.length === 0) {
    results.push({ name: 'filled-footers-visible', passed: false });
  }
  
  // --- TEST G: ARCHIV & RESET ---
  console.log('\n🗄️ TEST G: Archiv & Reset...');
  
  await page.click('#btn-save-archive');
  await page.waitForTimeout(500);
  
  const archiveItems = await page.$$('.archive-item');
  if (archiveItems.length === 0) {
    results.push({ name: 'archive-save', passed: false });
  }
  
  await page.click('#btn-trigger-reset');
  await page.waitForTimeout(300);
  await page.click('#btn-confirm-ok');
  await page.waitForTimeout(500);
  
  const resetPageInfo = await page.$eval('#page-info', el => el.textContent);
  if (resetPageInfo !== 'Seite 1 / 1') {
    results.push({ name: 'reset-carousel-position', passed: false });
  }
  
  // --- REPORT ---
  console.log('\n📊 AUDIT-REPORT');
  console.log('========================================');
  
  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);
  
  console.log(`✅ PASSED: ${passed.length}`);
  console.log(`❌ FAILED: ${failed.length}`);
  
  failed.forEach(f => {
    console.log(`  - ${f.name}: ${f.error || 'nicht erfüllt'}`);
  });
  
  console.log('\n📸 Screenshots gespeichert in:', screenshotDir);
  console.log('========================================');
  
  await browser.close();
  
  // Wenn Fehler, nicht beenden – wir fixen sie!
  if (failed.length > 0) {
    console.log('\n🔧 Beginne mit automatischen Fixes...');
    // Hier würde der Fix-Code kommen
  }
}

runAudit();
```

---

## 🔧 NACH DEM AUDIT: AUTOMATISCHE FIXES

Wenn der Audit Fehler findet, führe folgende Fixes aus:

### Fix 1: Form C Layout
```bash
# Ersetze Form C CSS in structure.css
```

### Fix 2: Hilfsmittel unabhängig machen
```bash
# Korrigiere CSS-Selektoren in components.css
```

### Fix 3: Nachtmodus Sidebar
```bash
# Passe theme.css an
```

### Fix 4: Plus-Button einfügen
```bash
# Füge Button in index.html ein, falls fehlend
```

### Fix 5: Footer leere Elemente ausblenden
```bash
# Füge CSS-Regel in structure.css ein
```

---

## 🚀 AUSFÜHRUNG

```bash
# 1. Starte lokalen Server
npx http-server . -p 8080

# 2. Führe Audit aus (in einem anderen Terminal)
node audit.js

# 3. Wenn Fehler, führe Fixes aus und wiederhole Audit
# 4. Erst wenn alle Tests grün, commit
```

---

## 📋 EXPECTED OUTCOME

Nach erfolgreichem Audit:
- ✅ Alle Buttons funktionieren wie erwartet
- ✅ Hilfsmittel sind unabhängig schaltbar
- ✅ Form C Layout ist sauber gestapelt
- ✅ Nachtmodus: Sidebar bleibt blau, Papier abdunkeln
- ✅ Carousel hat Plus-Button
- ✅ Leere Footer-Elemente sind unsichtbar
- ✅ Seitenanzeige ist zentriert

---

**GO AUSFÜHREN!** 🚀
```