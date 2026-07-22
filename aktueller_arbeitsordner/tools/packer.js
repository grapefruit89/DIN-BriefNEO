const fs = require('fs');
const path = require('path');

// Target directory paths
const rootDir = path.resolve(__dirname, '..');
const websiteDir = path.join(rootDir, 'website');
const buildDir = path.join(rootDir, 'build');
const outputFile = path.join(buildDir, 'din-brief-offline.html');

console.log('=== DIN-Brief Neo Packer ===');
console.log(`Website directory: ${websiteDir}`);
console.log(`Output file:       ${outputFile}`);

// 1. Read index.html
if (!fs.existsSync(path.join(websiteDir, 'index.html'))) {
  console.error('Error: index.html not found!');
  process.exit(1);
}
let html = fs.readFileSync(path.join(websiteDir, 'index.html'), 'utf8');

// 2. Inline CSS @imports: @import url("css/filename.css") layer(layername);
const importRegex = /@import\s+url\(["']css\/([^"']+)["']\)\s+layer\(([^)]+)\);/g;
html = html.replace(importRegex, (match, filename, layername) => {
  const cssPath = path.join(websiteDir, 'css', filename);
  if (!fs.existsSync(cssPath)) {
    console.error(`Error: CSS file not found at ${cssPath}`);
    process.exit(1);
  }
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  console.log(`- Inlining CSS @import: css/${filename} into layer ${layername}`);
  return `@layer ${layername} {\n${cssContent}\n}`;
});

// 3. Inline <link rel="stylesheet"> tags
// Match: <link rel="stylesheet" href="css/print.css" media="print"> or similar
const linkRegex = /<link\s+([^>]*rel=["']stylesheet["'][^>]*)>/gi;
html = html.replace(linkRegex, (match, attributes) => {
  // Extract href
  const hrefMatch = attributes.match(/href=["']([^"']+)["']/i);
  if (!hrefMatch) return match;
  
  const href = hrefMatch[1];
  // Do not inline remote styles
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
    return match;
  }
  
  // Extract media
  const mediaMatch = attributes.match(/media=["']([^"']+)["']/i);
  const mediaAttr = mediaMatch ? ` media="${mediaMatch[1]}"` : '';
  
  const cssPath = path.join(websiteDir, href);
  if (!fs.existsSync(cssPath)) {
    console.error(`Error: Linked CSS file not found at ${cssPath}`);
    process.exit(1);
  }
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  console.log(`- Inlining link stylesheet: ${href}${mediaAttr}`);
  return `<style${mediaAttr}>\n${cssContent}\n</style>`;
});

// 4. Bundle JS Files
const jsFilesOrder = [
  'js/30-utils/01-constants.js',
  'js/30-utils/02-storage.js',
  'js/30-utils/03-metadata.js',
  'js/30-utils/04-dev-tools.js',
  'js/10-ui/01-format-toolbar.js',
  'js/10-ui/02-toast.js',
  'js/10-ui/03-postvermerk.js',
  'js/20-features/01-salutation-engine.js',
  'js/20-features/02-signature.js',
  'js/20-features/03-geoapify.js',
  'js/20-features/04-sender-sync.js',
  'js/20-features/05-address-book-helper.js',
  'js/20-features/07-date-format.js',
  'js/00-core/01-draft-manager.js',
  'js/00-core/02-settings-manager.js',
  'js/00-core/03-ui-protections.js',
  'js/main.js'
];

let bundledJs = '';

for (const jsFile of jsFilesOrder) {
  const jsPath = path.join(websiteDir, jsFile);
  if (!fs.existsSync(jsPath)) {
    console.error(`Error: JS file not found at ${jsPath}`);
    process.exit(1);
  }
  
  console.log(`- Reading and processing: ${jsFile}`);
  let content = fs.readFileSync(jsPath, 'utf8');
  
  // Remove import statements (single-line ES6 imports)
  // Match: import { ... } from '...'; or import '...';
  content = content.replace(/^[ \t]*import\s+[^;\n]+;\r?\n?/gm, '');
  
  // Strip export keywords: export class, export const, export function
  // Match: export class Name -> class Name
  content = content.replace(/^[ \t]*export\s+(class|const|function)\b/gm, '$1');
  
  bundledJs += `\n/* --- Start: ${jsFile} --- */\n${content}\n/* --- End: ${jsFile} --- */\n`;
}

// 5. Replace the `<script type="module" src="js/main.js"></script>` tag in website/index.html with the bundled JS
const scriptRegex = /<script\s+type=["']module["']\s+src=["']js\/main\.js["']>\s*<\/script>/i;
if (!scriptRegex.test(html)) {
  console.error('Error: Main script tag <script type="module" src="js/main.js"></script> not found in index.html!');
  process.exit(1);
}

html = html.replace(scriptRegex, `<script type="module">\n${bundledJs}\n</script>`);

// 6. Ensure build directory exists and write output
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

fs.writeFileSync(outputFile, html, 'utf8');
const stats = fs.statSync(outputFile);
const fileSizeKB = (stats.size / 1024).toFixed(2);
console.log(`\n🎉 Success! Standalone single-file HTML written to: ${outputFile} (${fileSizeKB} KB)`);
