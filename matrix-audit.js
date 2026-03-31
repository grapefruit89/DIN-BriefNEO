import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootPath = join(__dirname, '../');

async function runAudit() {
  console.log('🌐 Starte Webserver für Secure-Context Audit...');
  const server = spawn('npx', ['http-server', rootPath, '-p', '8081'], { shell: true });
  await new Promise(resolve => setTimeout(resolve, 2000));

  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('🚀 Starte Platinum-Audit via http://localhost:8081...');
  await page.goto('http://localhost:8081');

  const results = await page.evaluate(() => {
    const checkCSS = (prop) => CSS.supports(prop);
    const checkJS = (obj) => {
        try { return typeof eval(`globalThis.${obj}`) !== 'undefined'; } 
        catch { return false; }
    };
    const checkProto = (cls, prop) => {
        try { return prop in eval(`${cls}.prototype`); }
        catch { return false; }
    };

    return {
      'CSS @layer': checkCSS('@layer base { color: red; }'),
      '@property': checkJS('CSSPropertyRule'),
      '@scope': checkCSS('@scope (.a) { .b { color: red; } }'),
      'calc-size(auto)': checkCSS('width: calc-size(auto, 100%)'),
      'Scroll-Anims': checkCSS('animation-timeline: scroll()'),
      'View Transitions': checkJS('document.startViewTransition'),
      'field-sizing': checkCSS('field-sizing: content'),
      'oklch()': checkCSS('color: oklch(50% 0.1 20)'),
      'contrast-color': checkCSS('color: contrast-color(white)'),
      'Anchor Positioning': checkCSS('anchor-name: --a'),
      'Popover API': 'popover' in document.createElement('div'),
      'Invoker Commands': checkProto('HTMLButtonElement', 'commandForElement'),
      'Temporal API': checkJS('Temporal'),
      'CSS if()': checkCSS('color: if(style(--a: b): red; else: blue)'),
      'Sanitizer API': checkJS('Sanitizer'),
      'FileSystem Access': checkJS('showOpenFilePicker'),
      'Service Worker': 'serviceWorker' in navigator,
      'IdleDetector': checkJS('IdleDetector'),
      'EditContext': checkJS('EditContext'),
      'Gemini Nano (AI)': checkJS('ai?.languageModel')
    };
  });

  console.log('\n🛡️ SECURE CONTEXT AUDIT RESULTS');
  console.log('=======================================');
  for (const [api, status] of Object.entries(results)) {
    console.log(`${status ? '✅' : '❌'} ${api.padEnd(25)}: ${status ? 'SUPPORTED' : 'LOCKED/FUTURE'}`);
  }
  console.log('=======================================');

  await browser.close();
  server.kill();
  process.exit(0);
}

runAudit();
