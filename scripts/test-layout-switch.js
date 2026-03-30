import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

async function testSwitch() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const filePath = `file://${path.join(projectRoot, "index.html").replace(/\\/g, "/")}`;

  console.log(`🚀 [TEST] Prüfe Layout-Switch auf: ${filePath}`);

  try {
    await page.goto(filePath, { waitUntil: "networkidle" });

    // 1. Status Quo (Form B)
    const initial = await page.evaluate(() => {
      const addr = document.querySelector("din-address-zone");
      return {
        layout: document.body.dataset.layout,
        addrTop: window.getComputedStyle(addr).top,
      };
    });
    console.log("Initial (Form B):", initial);

    // 2. Klick auf Form A
    console.log("🖱️ Klicke auf Form A...");
    await page.click("#layout-a");

    // Kurze Pause für View Transitions
    await page.waitForTimeout(500);

    // 3. Ergebnis prüfen
    const after = await page.evaluate(() => {
      const addr = document.querySelector("din-address-zone");
      return {
        layout: document.body.dataset.layout,
        addrTop: window.getComputedStyle(addr).top,
        fold1Top: window.getComputedStyle(
          document.querySelector(".mark-fold-1"),
        ).top,
      };
    });
    console.log("Nach Klick (Soll Form A):", after);

    if (after.layout === "form-a" && after.addrTop.includes("102")) {
      // 27mm * 3.78 ≈ 102px
      console.log("✅ SUCCESS: Layout-Switch funktioniert technisch!");
    } else {
      console.error(
        "❌ FAILURE: Layout-Switch hat keine Auswirkung im DOM/CSS.",
      );
    }
  } catch (err) {
    console.error("❌ TEST FEHLER:", err);
  } finally {
    await browser.close();
  }
}

testSwitch();
