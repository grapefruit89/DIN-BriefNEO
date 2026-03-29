/**
 * DIN-BriefNEO — Mission Readiness Prompt (Premium v25.0)
 * Chrome 147/148/149 Readiness Check
 * ─────────────────────────────────────────────────────────
 * Anleitung: Den gesamten Code kopieren und in die 
 * Browser-Konsole (F12 -> Console) einfügen.
 */
(function checkAviationReadinessPremium() {
  const f = (name, supported, baseline) => ({ name, supported, baseline });

  const features = [
    f('Temporal API (TOMB-L001)', !!globalThis.Temporal, 'Chrome 146/Stable'),
    f('CSS @property (CMA-Typed)', CSS.supports('--x: 1mm') && !!window.CSSPropertyRule, 'Chrome 146/Stable'),
    f('CSS @scope (Isolation)', typeof CSSScopeRule !== 'undefined', 'Chrome 118/Stable'),
    f('CSS if() Logic', CSS.supports('top: if(style(--x: 1): 1px; else: 2px)'), 'Chrome 148'),
    f('Scroll-State Queries', CSS.supports('container-type: scroll-state'), 'Chrome 147'),
    f('Native Invokers (commandfor)', 'commandfor' in document.createElement('button'), 'Chrome 147'),
    f('Advanced attr() Typisierung', CSS.supports('width: attr(data-x type(<length>))'), 'Chrome 133/149'),
    f('View Transitions (Scoped)', !!document.startViewTransition, 'Chrome 146/Stable'),
    f('CSS contrast-color()', CSS.supports('color: contrast-color(white)'), 'Chrome 147'),
    f('CSS border-shape', CSS.supports('border-shape: circle'), 'Chrome 147'),
    f('Math.sumPrecise', !!Math.sumPrecise, 'Chrome 147'),
    f('Sanitizer API (Native)', !!globalThis.Sanitizer, 'Chrome 147'),
    f('Element.setHTML()', !!Element.prototype.setHTML, 'Chrome 147'),
    f('CSS calc-size(auto)', CSS.supports('height: calc-size(auto, 100%)'), 'Chrome 129/Stable')
  ];

  const header = `# 🛫 DIN-BriefNEO — High-Integrity Readiness Report\n` +
                 `## Baseline: Chrome 147.0+ | Generiert: ${Temporal.Now.plainDateTimeISO().toString()}\n\n` +
                 `| Feature | Status | Baseline | Architektur-Nutzen |\n` +
                 `| :--- | :--- | :--- | :--- |\n`;

  const rows = features.map(feat => {
    const icon = feat.supported ? '✅ **READY**' : '⏳ *PENDING*';
    const benefit = feat.supported ? 'Aktiviert (Produktiv)' : 'Future-Proof (Inaktiv)';
    return `| ${feat.name.padEnd(28)} | ${icon.padEnd(12)} | ${feat.baseline.padEnd(18)} | ${benefit} |`;
  }).join('\n');

  const footer = `\n\n---\n**System-Check vollständig.** Das Projekt reift in seine Zielplattform hinein.`;

  console.clear();
  console.log(header + rows + footer);
})();
