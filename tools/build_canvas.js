const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function getMdFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (!['website', '.git', 'tools', 'scratch', 'node_modules'].includes(file)) {
        getMdFiles(name, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(name);
    }
  }
  return fileList;
}

const mdFiles = getMdFiles(rootDir);
const nodes = [];
const edges = [];
const fileMap = {};

let idCounter = 1;

mdFiles.forEach((f, idx) => {
  const relPath = path.relative(rootDir, f).replace(/\\/g, '/');
  const basename = path.basename(f, '.md');
  const id = idCounter.toString();
  idCounter++;
  
  fileMap[basename.toLowerCase()] = id;
  
  const col = idx % 5;
  const row = Math.floor(idx / 5);
  
  nodes.push({
    id: id,
    type: 'file',
    file: relPath,
    x: col * 600,
    y: row * 400,
    width: 400,
    height: 300
  });
});

let edgeCounter = 1;

mdFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const basename = path.basename(f, '.md');
  const sourceId = fileMap[basename.toLowerCase()];
  
  if (!sourceId) return;

  const matches = [...content.matchAll(/\[\[(.*?)\]\]/g)];
  const seenTargets = new Set();
  
  matches.forEach(match => {
    let target = match[1].split('|')[0].split('#')[0].trim();
    if (target.endsWith('.md')) target = target.slice(0, -3);
    
    const targetId = fileMap[target.toLowerCase()];
    if (targetId && targetId !== sourceId && !seenTargets.has(targetId)) {
      seenTargets.add(targetId);
      edges.push({
        id: 'e' + edgeCounter++,
        fromNode: sourceId,
        fromSide: 'right',
        toNode: targetId,
        toSide: 'left'
      });
    }
  });
});

const canvasData = {
  nodes: nodes,
  edges: edges
};

fs.writeFileSync(path.join(rootDir, 'DIN-Brief-Architektur.canvas'), JSON.stringify(canvasData, null, 2), 'utf8');
console.log('Successfully generated DIN-Brief-Architektur.canvas with ' + nodes.length + ' nodes and ' + edges.length + ' edges.');
