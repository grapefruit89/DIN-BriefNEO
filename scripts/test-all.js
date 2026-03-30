import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

/**
 * DIN-BriefNEO v4 Core Validation Suite
 * Consolidates Geometry Check (DIN 5008) and Layout Switching.
 */
async function runFullValidation() {
  console.log("🚀 [VALIDATION] Starte v4 Core Engine Check...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 1600 },
    deviceScaleFactor: 2, // Hi-DPI for precise measurements
  });

  const page = await context.newPage();
  const filePath = `file://${path.join(projectRoot, "index.html").replace(/\\/g, "/")}`;

  try {
    await page.goto(filePath, { waitUntil: "networkidle" });

    // --- TEST 1: GEOMETRY CHECK (DIN 5008) ---
    console.log("\n--- 📏 TEST 1: DIN 5008 Geometrie-Metriken ---");
    const metrics = await page.evaluate(() => {
      const paper = document.getElementById("paper") || document.body;
      const fold1 =
        document.querySelector(".mark-fold-1") ||
        document.querySelector(".fold-mark-1");
      const fold2 =
        document.querySelector(".mark-fold-2") ||
        document.querySelector(".fold-mark-2");
      const addr = document.querySelector("din-anschriftfeld");

      const toMm = (px) => (px / 96) * 25.4;

      return {
        paper: {
          w: toMm(paper.offsetWidth).toFixed(1) + "mm",
          h: toMm(paper.offsetHeight).toFixed(1) + "mm",
        },
        fold1: { top: fold1 ? toMm(fold1.offsetTop).toFixed(1) + "mm" : "N/A" },
        fold2: { top: fold2 ? toMm(fold2.offsetTop).toFixed(1) + "mm" : "N/A" },
        address: {
          top: addr ? toMm(addr.offsetTop).toFixed(1) + "mm" : "N/A",
          left: addr ? toMm(addr.offsetLeft).toFixed(1) + "mm" : "N/A",
        },
      };
    });
    console.table(metrics);

    // --- TEST 2: LAYOUT SWITCHING (Form A <-> B) ---
    console.log("\n--- 🖱️ TEST 2: Layout-Switch (Form A/B) ---");

    // Initial state
    const initial = await page.evaluate(() => ({
      bodyLayout: document.body.dataset.layout,
      paperForm: document.getElementById("paper")?.dataset.form,
      addrTop: window.getComputedStyle(
        document.querySelector("din-anschriftfeld"),
      ).top,
    }));
    console.log("Initial Status:", initial);

    // Switch to Form A
    const layoutARadio = await page.$("#layout-a");
    if (layoutARadio) {
      console.log("🖱️ Klicke auf #layout-a...");
      await layoutARadio.click();

      // Den State-Change und DOM-Sync abwarten
      await page.waitForTimeout(1000);

      const after = await page.evaluate(() => {
        const bodyLayout = document.body.dataset.layout;
        const paperForm = document.getElementById("paper")?.dataset.form;
        const addr = document.querySelector("din-anschriftfeld");
        return {
          bodyLayout,
          paperForm,
          addrTop: window.getComputedStyle(addr).top,
        };
      });

      console.log("Status nach Klick:", after);

      // Validation logic: either the attribute or the physical position must change
      const isA =
        after.bodyLayout === "form-a" ||
        after.paperForm === "A" ||
        after.addrTop.includes("102");

      if (isA) {
        console.log(
          "✅ SUCCESS: Layout-Switch visuell oder strukturell erkannt.",
        );
        console.log(`   Adresse-Position (px): ${after.addrTop}`);
      } else {
        console.error(
          "❌ FAILURE: Layout-Switch wurde nicht im DOM reflektiert.",
        );
        // Screenshot zur Fehlerdiagnose
        const errPath = path.join(
          projectRoot,
          "assets/screenshots/layout-switch-error.png",
        );
        await page.screenshot({ path: errPath });
        console.log(`📸 Fehler-Screenshot: ${errPath}`);
      }
    } else {
      console.log("⚠️ INFO: #layout-a nicht gefunden.");
    }

    // --- FINAL: SCREENSHOT ---
    const screenshotPath = path.join(
      projectRoot,
      "assets/screenshots/v4-core-validation-report.png",
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 [REPORT] Screenshot erstellt: ${screenshotPath}`);
  } catch (err) {
    console.error("\n❌ [CRITICAL] Validierung abgebrochen:", err);
  } finally {
    await browser.close();
    console.log("\n🏁 [DONE] Validierung abgeschlossen.");
  }
}

runFullValidation();
