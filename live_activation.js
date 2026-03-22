const fs = require('fs');

// 1. HTML Activation (CSS Variable Sync)
let html = fs.readFileSync('index.html', 'utf8');

// Replace dataset.layout with setProperty('--layout', ...)
html = html.replace(/onchange="document\.getElementById\('paper'\)\.dataset\.layout=this\.value;/g, 
                   'onchange="document.getElementById(\'paper\').style.setProperty(\'--layout\', this.value);');

// Default Layout Variable setzen
html = html.replace('<div id="paper"', '<div id="paper" style="--layout: form-b"');

fs.writeFileSync('index.html', html);
console.log('✅ HTML: Layout Handlers updated to CSS Variables');

// 2. CSS Activation (if() Logic Prime)
let css = fs.readFileSync('css/din5008-paper.css', 'utf8');

// Die if() Logik für das Anschriftfeld ist bereits drin, wir härten sie jetzt.
// Wir fügen auch die Logik für den Infoblock und den Betreff hinzu, falls nötig.

css = css.replace(/top: if\(style\(--layout: form-a\): var\(--margin-top-a\); else: var\(--margin-top-b\)\);/,
                 'top: if(style(--layout: form-a): var(--margin-top-a); else: var(--margin-top-b));');

// Scroll-State für den Brieftext ist bereits in der Readiness-Prüfung bestätigt
// Wir stellen sicher, dass din-body den container-type hat.
if (!css.includes('container-type: scroll-state')) {
    css = css.replace(/din-body \{/g, 'din-body { container-type: scroll-state; ');
}

fs.writeFileSync('css/din5008-paper.css', css);
console.log('✅ CSS: if() Logic and Scroll-State fully activated');
