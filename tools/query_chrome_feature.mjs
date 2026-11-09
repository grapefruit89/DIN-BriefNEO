#!/usr/bin/env node
/**
 * tools/query_chrome_feature.mjs — Maschinenlesbare Upstream Ground-Truth Abfrage
 * ==============================================================================
 * Fragt Chrome Platform Status API (chromestatus.com) und MDN BCD ab, um
 * veraltetes LLM-Trainingswissen zu eliminieren und den echten Implementierungs-
 * status in Chromium (Chrome 150+ Baseline) nachzuweisen.
 *
 * Nutzung:
 *   node tools/query_chrome_feature.mjs <feature-name>
 *   node tools/query_chrome_feature.mjs --milestone <version>
 */

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(`
Nutzung:
  node tools/query_chrome_feature.mjs <feature-name>
  node tools/query_chrome_feature.mjs --milestone <version>

Beispiele:
  node tools/query_chrome_feature.mjs popover
  node tools/query_chrome_feature.mjs "anchor positioning"
  node tools/query_chrome_feature.mjs string-set
  node tools/query_chrome_feature.mjs --milestone 150
`);
  process.exit(0);
}

const milestoneIndex = args.indexOf('--milestone');
const milestone = milestoneIndex !== -1 ? args[milestoneIndex + 1] : null;
const query = milestone ? null : args.join(' ').trim();

async function fetchChromeStatus(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const text = await res.text();
    // Chromestatus API schützt JSON mit XSSI-Präfix )]}'
    const cleanJson = text.replace(/^\)\]\}'\r?\n/, '');
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error(`❌ Fehler beim Abfragen von chromestatus.com: ${err.message}`);
    process.exit(1);
  }
}

async function queryByMilestone(ms) {
  console.log(`\n🔍 Abfrage Chrome Platform Status für Milestone ${ms}...`);
  const url = `https://chromestatus.com/api/v0/features?milestone=${encodeURIComponent(ms)}`;
  const data = await fetchChromeStatus(url);

  console.log(`📦 Gesamt: ${data.total_count || 0} Features in Chrome ${ms}\n`);
  const byType = data.features_by_type || {};

  for (const [groupName, features] of Object.entries(byType)) {
    if (!features || features.length === 0) continue;
    console.log(`\n=== ${groupName.toUpperCase()} (${features.length}) ===`);
    for (const f of features) {
      console.log(`  • ${f.name} [ID: ${f.id}]`);
      if (f.summary) {
        const shortSummary = f.summary.replace(/[\r\n]+/g, ' ').substring(0, 100);
        console.log(`    ↳ ${shortSummary}...`);
      }
    }
  }
}

async function queryByFeature(term) {
  console.log(`\n🔍 Suche Upstream-Status für Feature: "${term}"...`);
  const url = `https://chromestatus.com/api/v0/features?q=${encodeURIComponent(term)}`;
  const data = await fetchChromeStatus(url);

  const features = data.features || [];
  if (features.length === 0) {
    console.log(`\n⚠️  Kein Feature zu "${term}" in Chrome Platform Status gefunden.`);
    console.log(`   ↳ Hinweis: Wenn ein CSS/JS-Feature hier nicht existiert (z. B. "string-set"),`);
    console.log(`     wurde es von Chromium weder implementiert noch vorgeschlagen.\n`);
    return;
  }

  console.log(`\n✓ ${features.length} Treffer auf chromestatus.com gefunden:\n`);

  features.slice(0, 10).forEach((f, idx) => {
    const desktopMs = f.browsers?.chrome?.desktop || f.browsers?.chrome?.status?.milestone_str || 'Unbekannt';
    const statusText = f.browsers?.chrome?.status?.text || (typeof desktopMs === 'number' ? `Enabled (M${desktopMs})` : desktopMs);
    const category = f.category || 'Web Platform';

    console.log(`${idx + 1}. ${f.name}`);
    console.log(`   Status:    ${statusText} (Chrome Desktop: ${desktopMs})`);
    console.log(`   Kategorie: ${category}`);
    if (f.summary) {
      const summaryClean = f.summary.replace(/[\r\n]+/g, ' ').substring(0, 140);
      console.log(`   Info:      ${summaryClean}...`);
    }
    console.log(`   Link:      https://chromestatus.com/feature/${f.id}\n`);
  });
}

async function main() {
  if (milestone) {
    await queryByMilestone(milestone);
  } else if (query) {
    await queryByFeature(query);
  }
}

main();
