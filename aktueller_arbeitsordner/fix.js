const fs = require('fs');
const path = 'C:/Users/morit/Documents/Obsidian_Main/Websites & Software/DIN-Brief Neo/aktueller_arbeitsordner/Guides/glossary.md';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/\[([^\]]+)\]\(\.\.\/ADR\/([^\.]+)\.md(#?[^\)]*)\)/g, (match, text, file, anchor) => {
    return '[[' + file + anchor + '|' + text + ']]';
});
content = content.replace(/\[([^\]]+)\]\(([^\.]+)\.md(#?[^\)]*)\)/g, (match, text, file, anchor) => {
    return '[[' + file + anchor + '|' + text + ']]';
});

fs.writeFileSync(path, content, 'utf8');
console.log('done');
