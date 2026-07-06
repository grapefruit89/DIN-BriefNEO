const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '..');

function getFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (file !== 'website' && file !== '.git' && file !== 'tools') {
        getFilesRecursively(name, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(name);
    }
  }
  return fileList;
}

function hasYamlFrontmatter(content) {
  return /^---\r?\n[\s\S]+?\r?\n---/.test(content);
}

function extractFirstHeading(content) {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].trim().replace(/[\[\]]/g, ''); // Remove markdown link brackets in titles
  }
  return null;
}

function main() {
  const files = getFilesRecursively(targetDir);
  console.log(`Scanning ${files.length} Markdown files for missing YAML frontmatter...`);

  for (const file of files) {
    const relPath = path.relative(targetDir, file).replace(/\\/g, '/');
    let content = fs.readFileSync(file, 'utf-8');

    if (!hasYamlFrontmatter(content)) {
      console.log(`Injecting YAML frontmatter into ${relPath}...`);
      
      const heading = extractFirstHeading(content);
      const title = heading || path.basename(file, '.md');
      
      let tags = ['documentation'];
      if (relPath.startsWith('ADR/')) tags.push('adr', 'architecture');
      if (relPath.startsWith('Guides/')) tags.push('guide', 'manual');
      if (relPath.toLowerCase().includes('roadmap')) tags.push('roadmap', 'future');
      if (relPath.toLowerCase().includes('changelog')) tags.push('changelog', 'history');
      if (relPath.toLowerCase().includes('decision')) tags.push('decision-log', 'architecture');
      if (relPath.toLowerCase().includes('spec')) tags.push('spec', 'requirements');
      if (relPath.toLowerCase().includes('task')) tags.push('tasks', 'todo');
      if (relPath.toLowerCase().includes('law') || relPath.toLowerCase().includes('deprecat')) tags.push('rules', 'standards');
      
      const yamlHeader = `---
title: ${title}
status: active
tags: [${tags.join(', ')}]
---

`;
      fs.writeFileSync(file, yamlHeader + content, 'utf-8');
    }
  }

  console.log('YAML Injection complete.');
}

main();
