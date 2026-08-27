const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'build/LLM_CONTEXT.md';

// Liste der absolut kritischen Kern-Dokumente für LLMs
const CORE_FILES = [
    'README.md',
    'docs/index.md',
    'AGENTS.md',
    'docs/00-foundation/constitution.md',
    'docs/00-foundation/longevity-guidelines.md',
    'docs/00-foundation/Immutable-Law-Catalog.md',
    'docs/00-foundation/spec.md'
];

const PREAMBLE = `---
title: LLM Context Bundle
status: active
tags: [context, llm, prompt]
---

> [!IMPORTANT]
> **SYSTEM-PROMPT / CORE CONTEXT**
> Dieses Dokument ist eine automatisch generierte, aggregierte Landkarte der aktuellen Projektarchitektur.
> Es enthält alle kritischen Verfassungen, Guidelines und Spezifikationen, die du als KI-Agent zwingend beachten musst.
> Das Projekt "DIN-Brief Neo" strebt nach absoluter **Zero-Dependency** und **100% Offline-Fähigkeit** via W3C Living Standards in Chrome 148+.
> Nutze KEINE veralteten APIs (z.B. execCommand) und KEINE Frameworks.
> 
> Dies ist dein maßgeblicher System-Prompt.
> Generiert am: ${new Date().toISOString()}
> ==============================================================================

`;

function generateContext() {
    console.log('Generiere LLM_CONTEXT.md...');
    let outputContent = PREAMBLE;

    for (const file of CORE_FILES) {
        const filePath = path.join(__dirname, '..', file);
        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                outputContent += `\n\n# ==========================================\n`;
                outputContent += `# FILE: ${file}\n`;
                outputContent += `# ==========================================\n\n`;
                outputContent += content;
                console.log(`✅ Eingebunden: ${file}`);
            } else {
                console.warn(`⚠️ Warnung: Datei nicht gefunden: ${file}`);
            }
        } catch (err) {
            console.error(`❌ Fehler beim Lesen von ${file}: ${err.message}`);
        }
    }

    const outPath = path.join(__dirname, '..', OUTPUT_FILE);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, outputContent, 'utf8');
    
    console.log(`\n🎉 Erfolgreich generiert: ${OUTPUT_FILE} (${(outputContent.length / 1024).toFixed(2)} KB)`);
    console.log('Du kannst diese Datei nun an KIs als gebündelten System-Prompt übergeben.');
}

generateContext();
