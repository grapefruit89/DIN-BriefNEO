const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/morit/Documents/Obsidian_Main/Websites & Software/DIN-Brief Neo/aktueller_arbeitsordner/ADR';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Update tags to include obsidian, adr
  content = content.replace(/tags: \[(.*?)\]/, (m, p1) => {
    if (!p1.includes('obsidian')) {
       return 	ags: [obsidian, adr, ];
    }
    return m;
  });

  // Add alias if not present
  if (!content.includes('aliases:')) {
     const titleMatch = content.match(/title: "(.*?)"/);
     if (titleMatch) {
       content = content.replace(/tags: \[(.*?)\]\n/, 	ags: []\naliases: [""]\n);
     }
  }

  // Add callout to "Kontext & Problemstellung"
  if (content.includes('## Kontext & Problemstellung\n') && !content.includes('> [!info]')) {
    content = content.replace(
      /## Kontext & Problemstellung\n([\s\S]*?)\n---/m,
      (m, p1) => {
        const calloutText = p1.trim().split('\n').map(line => '> ' + line).join('\n');
        return ## Kontext & Problemstellung\n\n> [!info] Hintergrund\n\n\n---;
      }
    );
  }

  // Links: related array in YAML
  // related: [ADR-HTML.md, ../Guides/longevity-guidelines.md] -> convert to [[ADR-HTML]], etc.
  content = content.replace(/related: \[(.*?)\]/, (m, p1) => {
    const arr = p1.split(',').map(s => s.trim());
    const newArr = arr.map(link => {
       if (link.endsWith('.md')) {
          const basename = link.split('/').pop().replace('.md', '');
          return "[[]]"; // Put in quotes in YAML
       }
       return link;
    });
    return elated: [];
  });

  // Markdown links to Wiki-links
  content = content.replace(/\[([^\]]+)\]\(\.\.\/Guides\/([^\.]+)\.md(#?[^\)]*)\)/g, (match, text, filename, anchor) => {
      return '[[' + filename + anchor + '|' + text + ']]';
  });
  content = content.replace(/\[([^\]]+)\]\(([^\.]+)\.md(#?[^\)]*)\)/g, (match, text, filename, anchor) => {
      return '[[' + filename + anchor + '|' + text + ']]';
  });

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('done updating ADRs');
