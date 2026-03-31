import puppeteer from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootPath = join(__dirname, '../');

async function runTest() {
  console.log('🌐 Starte lokalen Webserver...');
  // Wir nutzen http-server für den Test
  const server = spawn('npx', ['http-server', rootPath, '-p', '8080'], { shell: true });
  
  await new Promise(resolve => setTimeout(resolve, 3000)); // Puffer für Serverstart

  const browser = await puppeteer.chromium.launch();
  const page = await browser.newPage();
  
  // Logge Browser-Konsolen-Ausgaben
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  console.log('🚀 Starte Platinum-Validierung via http://localhost:8080...');

  try {
    await page.goto('http://localhost:8080');

    // 1. Check: Existenz der Container
    console.log('\n🏗️ Prüfe DOM-Struktur...');
    const containers = ['din-absender', 'din-anschriftfeld', 'din-infoblock', 'din-datum', 'din-kern', 'din-fuss'];
    for (const tag of containers) {
      const exists = await page.$(tag);
      if (exists) console.log(`  ${tag}: ✅`);
      else console.log(`  ${tag}: ❌ FEHLT`);
    }

    // 2. Check: Form A/B Umschaltung
    console.log('\n📐 Prüfe Form A/B Umschaltung...');
    const addr = await page.$('din-anschriftfeld');
    let boxB = await addr.boundingBox();
    
    await page.click('label[for="state-layout-a"]');
    await page.waitForTimeout(1000); 
    let boxA = await addr.boundingBox();
    
    console.log(`  Form B Y: ${Math.round(boxB.y)}px | Form A Y: ${Math.round(boxA.y)}px`);
    if (boxA.y < boxB.y) console.log('  ✅ Layout-Switch: OK');
    else console.log('  ❌ Layout-Switch: FEHLER');

    // 3. Check: Markdown Mirror
    console.log('\n📝 Prüfe Markdown-Rendering...');
    await page.evaluate(() => {
      const editor = document.querySelector('din-text');
      editor.textContent = 'Test **fett**';
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(500);
    const mirrorHTML = await page.$eval('din-text-spiegel', el => el.innerHTML);
    console.log(`  Mirror HTML: ${mirrorHTML}`);
    if (mirrorHTML.includes('<strong>fett</strong>')) console.log('  ✅ Markdown: OK');
    else console.log('  ❌ Markdown: FEHLER (Spiegel leer oder falsch)');

  } catch (e) {
    console.error('❌ Test-Abbruch:', e);
  } finally {
    console.log('\n🏁 Test abgeschlossen. Schließe Ressourcen...');
    await browser.close();
    server.kill();
    process.exit(0);
  }
}

runTest();
