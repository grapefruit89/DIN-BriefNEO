import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

async function runVisionCheck() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 1600 },
    deviceScaleFactor: 2, // Hi-DPI für High-Quality Screenshots
  });

  const page = await context.newPage();
  const filePath = `file://${path.join(projectRoot, 'index.html').replace(/\\/g, '/')}`;

  console.log(`🚀 [VISION] Lade v4 Core Engine: ${filePath}`);

  try {
    await page.goto(filePath, { waitUntil: 'networkidle' });

    // 1. Geometrie-Check (DIN 5008)
    const metrics = await page.evaluate(() => {
      const paper = document.getElementById('paper');
      const fold1 = document.querySelector('.mark-fold-1');
      const fold2 = document.querySelector('.mark-fold-2');
      const addr  = document.querySelector('din-anschriftfeld');

      const toMm = px => (px / 96) * 25.4;

      if (!paper || !fold1 || !addr) {
        throw new Error(`DOM Missing: paper=${!!paper}, fold1=${!!fold1}, addr=${!!addr}`);
      }

      return {
        paper: {
          w: toMm(paper.offsetWidth).toFixed(1),
          h: toMm(paper.offsetHeight).toFixed(1)
        },
        fold1: { top: toMm(fold1.offsetTop).toFixed(1) + 'mm' },
        fold2: { top: toMm(fold2.offsetTop).toFixed(1) + 'mm' },
        address: {
          top: toMm(addr.offsetTop).toFixed(1) + 'mm',
          left: toMm(addr.offsetLeft).toFixed(1) + 'mm'
        }
      };
    });

    console.table(metrics);

    // 2. Screenshot-Analyse
    const screenshotPath = path.join(projectRoot, 'v4-core-vision-check.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log(`✅ [VISION] Screenshot erstellt: ${screenshotPath}`);
    console.log(`📸 Analyse: Papier ist ${metrics.paper.w}x${metrics.paper.h}mm. Skalierung: ${metrics.paper.scale}`);

  } catch (err) {
    console.error('❌ [VISION] Fehler:', err);
  } finally {
    await browser.close();
  }
}

runVisionCheck();
