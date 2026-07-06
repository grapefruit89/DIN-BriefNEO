const fs = require('fs');
const path = require('path');
const { runReconciliation } = require('./reconciliation.js');

const targetDir = path.resolve(__dirname, '..');
const outputSqlFile = 'build/import.sql';

function getFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      const ignoredDirs = ['website', '.git', 'tools', 'build', 'venv', 'node_modules', '.agents', '.claude'];
      if (!ignoredDirs.includes(file)) {
        getFilesRecursively(name, fileList);
      }
    } else if (file.endsWith('.md') || file.endsWith('.json')) {
      fileList.push(name);
    }
  }
  return fileList;
}

function parseYamlFrontmatter(content) {
  const meta = { title: '', status: '', tags: [] };
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (match) {
    const yamlLines = match[1].split(/\r?\n/);
    for (const line of yamlLines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim().toLowerCase();
        let value = parts.slice(1).join(':').trim();
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
        } else {
          value = value.replace(/['"]/g, '');
        }
        if (key === 'title') meta.title = value;
        if (key === 'status') meta.status = value;
        if (key === 'tags') meta.tags = Array.isArray(value) ? value : [value];
      }
    }
  }
  return meta;
}

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

function main() {
  console.log('Running Reality Reconciliation & Fitness Check...');
  const report = runReconciliation();

  console.log('\n==================================================');
  console.log(`EVOLUTIONARY FITNESS SCORE: ${report.score}%`);
  console.log('--------------------------------------------------');
  console.log(`- Metadata Score:    ${report.dimensions.metadata}%`);
  console.log(`- Coherence Score:   ${report.dimensions.coherence}%`);
  console.log(`- Conformance Score: ${report.dimensions.conformance}%`);
  console.log(`- Features Score:    ${report.dimensions.features}%`);
  console.log('==================================================\n');

  if (report.logs.length > 0) {
    console.log('Diagnoses and Violations:');
    report.logs.forEach(log => {
      const icon = log.severity === 'critical' ? '🔴 [CRITICAL]' : log.severity === 'high' ? '🟡 [HIGH]' : log.severity === 'medium' ? '🔵 [MEDIUM]' : '⚪ [LOW]';
      console.log(`${icon} (${log.check_type}) in ${log.file_path || 'Global'}: ${log.message}`);
    });
    console.log('');
  }

  if (!report.success) {
    console.error('🔴 Build failed: Critical architectural violations found! Generation stopped.');
    process.exit(1);
  }

  console.log('Compiling documentation database...');
  const files = getFilesRecursively(targetDir);
  let sql = 'PRAGMA foreign_keys = ON;\n\n';
  sql += 'DROP TABLE IF EXISTS document_tags;\n';
  sql += 'DROP TABLE IF EXISTS document_relations;\n';
  sql += 'DROP TABLE IF EXISTS reconciliation_log;\n';
  sql += 'DROP TABLE IF EXISTS antipattern_definitions;\n';
  sql += 'DROP TABLE IF EXISTS documents;\n\n';

  sql += 'CREATE TABLE documents (\n';
  sql += '  id INTEGER PRIMARY KEY AUTOINCREMENT,\n';
  sql += '  path TEXT UNIQUE NOT NULL,\n';
  sql += '  title TEXT NOT NULL,\n';
  sql += '  status TEXT,\n';
  sql += '  content TEXT NOT NULL,\n';
  sql += '  content_hash TEXT,\n';   // NEU Paket 1: Content-Hash-Caching
  sql += '  embedding BLOB,\n';      // NEU Paket 1: sqlite-vec Embedding
  sql += '  embedding_model TEXT DEFAULT \'all-MiniLM-L6-v2\',\n';
  sql += '  embedding_dim INTEGER DEFAULT 384\n';
  sql += ');\n\n';

  // NEU Paket 1: Virtuelle Tabelle für sqlite-vec (Extension-Laden erfolgt später in Paket 3)
  sql += 'CREATE VIRTUAL TABLE IF NOT EXISTS vec_documents USING vec0(embedding FLOAT[384]);\n\n';

  sql += 'CREATE TABLE document_tags (\n';
  sql += '  document_id INTEGER,\n';
  sql += '  tag TEXT NOT NULL,\n';
  sql += '  FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,\n';
  sql += '  PRIMARY KEY (document_id, tag)\n';
  sql += ');\n\n';

  sql += 'CREATE TABLE document_relations (\n';
  sql += '  source_path TEXT NOT NULL,\n';
  sql += '  target_path TEXT NOT NULL,\n';
  sql += '  relation_type TEXT NOT NULL,\n';
  sql += '  FOREIGN KEY (source_path) REFERENCES documents (path) ON DELETE CASCADE,\n';
  sql += '  PRIMARY KEY (source_path, target_path, relation_type)\n';
  sql += ');\n\n';

  sql += 'CREATE TABLE antipattern_definitions (\n';
  sql += '  id TEXT PRIMARY KEY,\n';
  sql += '  severity TEXT NOT NULL,\n';
  sql += '  category TEXT NOT NULL,\n';
  sql += '  description TEXT NOT NULL,\n';
  sql += '  graveyard_ref TEXT,\n';
  sql += '  pattern TEXT NOT NULL,\n';
  sql += '  file_patterns TEXT NOT NULL,\n';
  sql += '  exemptions TEXT\n';
  sql += ');\n\n';

  sql += 'CREATE TABLE IF NOT EXISTS fitness_history (\n';
  sql += '  id INTEGER PRIMARY KEY AUTOINCREMENT,\n';
  sql += '  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,\n';
  sql += '  score REAL NOT NULL,\n';
  sql += '  metadata_score REAL NOT NULL,\n';
  sql += '  coherence_score REAL NOT NULL,\n';
  sql += '  conformance_score REAL NOT NULL,\n';
  sql += '  features_score REAL NOT NULL,\n';
  sql += '  details_json TEXT\n';
  sql += ');\n\n';

  sql += 'CREATE TABLE IF NOT EXISTS agent_session_logs (\n';
  sql += '  id INTEGER PRIMARY KEY AUTOINCREMENT,\n';
  sql += '  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,\n';
  sql += '  agent_name TEXT NOT NULL,\n';
  sql += '  action_type TEXT NOT NULL,\n';
  sql += '  file_path TEXT NOT NULL,\n';
  sql += '  description TEXT NOT NULL\n';
  sql += ');\n\n';

  sql += 'CREATE TABLE reconciliation_log (\n';
  sql += '  id INTEGER PRIMARY KEY AUTOINCREMENT,\n';
  sql += '  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,\n';
  sql += '  file_path TEXT,\n';
  sql += '  check_type TEXT NOT NULL,\n';
  sql += '  severity TEXT NOT NULL,\n';
  sql += '  message TEXT NOT NULL,\n';
  sql += '  antipattern_id TEXT,\n';
  sql += '  FOREIGN KEY (antipattern_id) REFERENCES antipattern_definitions (id) ON DELETE SET NULL\n';
  sql += ');\n\n';

  for (const file of files) {
    const relativePath = path.relative(targetDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf-8');
    const meta = file.endsWith('.md') ? parseYamlFrontmatter(content) : { title: relativePath, status: 'active', tags: ['json'] };
    
    // Remove YAML frontmatter from content for clean LLM indexing
    let cleanContent = content;
    if (file.endsWith('.md')) {
      cleanContent = content.replace(/^---\r?\n[\s\S]+?\r?\n---/, '').trim();
    }

    const title = meta.title || path.basename(file);
    const status = meta.status || 'active';

    sql += `INSERT INTO documents (path, title, status, content, content_hash, embedding, embedding_model, embedding_dim) VALUES (\n`;
    sql += `  '${escapeSql(relativePath)}',\n`;
    sql += `  '${escapeSql(title)}',\n`;
    sql += `  '${escapeSql(status)}',\n`;
    sql += `  '${escapeSql(cleanContent)}',\n`;
    sql += `  NULL,  -- content_hash (wird in Paket 2 gesetzt)\n`;
    sql += `  NULL,  -- embedding (wird in Paket 3 gesetzt)\n`;
    sql += `  'all-MiniLM-L6-v2',\n`;
    sql += `  384\n`;
    sql += `);\n\n`;

    if (meta.tags && meta.tags.length > 0) {
      for (const tag of meta.tags) {
        if (tag) {
          sql += `INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES ((SELECT id FROM documents WHERE path = '${escapeSql(relativePath)}'), '${escapeSql(tag)}');\n`;
        }
      }
    }
    sql += '\n';
  }

  // Insert relations
  // Insert antipattern definitions
  sql += '-- Antipattern Definitions\n';
  for (const rule of report.rules) {
    sql += `INSERT OR REPLACE INTO antipattern_definitions (id, severity, category, description, graveyard_ref, pattern, file_patterns, exemptions) VALUES (\n`;
    sql += `  '${escapeSql(rule.id)}',\n`;
    sql += `  '${escapeSql(rule.severity)}',\n`;
    sql += `  '${escapeSql(rule.category)}',\n`;
    sql += `  '${escapeSql(rule.description)}',\n`;
    sql += `  ${rule.graveyard_ref ? `'${escapeSql(rule.graveyard_ref)}'` : 'NULL'},\n`;
    sql += `  '${escapeSql(rule.pattern || '')}',\n`;
    sql += `  '${escapeSql(JSON.stringify(rule.file_patterns))}',\n`;
    sql += `  ${rule.exemptions ? `'${escapeSql(JSON.stringify(rule.exemptions))}'` : 'NULL'}\n`;
    sql += `);\n\n`;
  }

  // Insert relations
  sql += '-- Document Relations\n';
  for (const rel of report.relations) {
    sql += `INSERT OR IGNORE INTO document_relations (source_path, target_path, relation_type) VALUES (\n`;
    sql += `  '${escapeSql(rel.source_path)}',\n`;
    sql += `  '${escapeSql(rel.target_path)}',\n`;
    sql += `  '${escapeSql(rel.relation_type)}'\n`;
    sql += `);\n\n`;
  }

  // Insert fitness score history entry
  sql += '-- Evolutionary Fitness History\n';
  sql += `INSERT INTO fitness_history (score, metadata_score, coherence_score, conformance_score, features_score, details_json) VALUES (\n`;
  sql += `  ${report.score},\n`;
  sql += `  ${report.dimensions.metadata},\n`;
  sql += `  ${report.dimensions.coherence},\n`;
  sql += `  ${report.dimensions.conformance},\n`;
  sql += `  ${report.dimensions.features},\n`;
  sql += `  '${escapeSql(JSON.stringify(report.logs))}'\n`;
  sql += `);\n\n`;

  // Insert current reconciliation log entries
  sql += '-- Current Reconciliation Diagnostics\n';
  for (const log of report.logs) {
    sql += `INSERT INTO reconciliation_log (file_path, check_type, severity, message, antipattern_id) VALUES (\n`;
    sql += `  '${escapeSql(log.file_path || '')}',\n`;
    sql += `  '${escapeSql(log.check_type)}',\n`;
    sql += `  '${escapeSql(log.severity)}',\n`;
    sql += `  '${escapeSql(log.message)}',\n`;
    sql += `  ${log.antipattern_id ? `'${escapeSql(log.antipattern_id)}'` : 'NULL'}\n`;
    sql += `);\n\n`;
  }

  
  // NEU: Tri-direktionale Code Verknüpfung
  sql += '-- Code Links\n';
  sql += 'CREATE TABLE IF NOT EXISTS tbl_code_links (\n';
  sql += '  id INTEGER PRIMARY KEY AUTOINCREMENT,\n';
  sql += '  file_path TEXT NOT NULL,\n';
  sql += '  line_number INTEGER NOT NULL,\n';
  sql += '  adr_ref TEXT,\n';
  sql += '  guide_ref TEXT\n';
  sql += ');\n\n';

  const codeDirs = [path.join(targetDir, 'website'), path.join(targetDir, 'website', 'js'), path.join(targetDir, 'website', 'css')];
  const codeLinks = [];
  codeDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      if (fs.statSync(p).isFile() && (f.endsWith('.js') || f.endsWith('.css') || f.endsWith('.html'))) {
        const lines = fs.readFileSync(p, 'utf8').split('\n');
        lines.forEach((line, idx) => {
          const adrMatch = line.match(/@adr\s+\[\[(.*?)\]\]/);
          const guideMatch = line.match(/@guide\s+\[\[(.*?)\]\]/);
          if (adrMatch || guideMatch) {
            const adrRef = adrMatch ? adrMatch[1] : '';
            const guideRef = guideMatch ? guideMatch[1] : '';
            const relPath = path.relative(targetDir, p).replace(/\\/g, '/');
            
            // Vermeide Duplikate durch mehrfache codeDirs (z.B. website/ vs website/js)
            if (!codeLinks.some(l => l.file === relPath && l.line === idx + 1)) {
              codeLinks.push({ file: relPath, line: idx + 1, adr: adrRef, guide: guideRef });
              sql += `INSERT INTO tbl_code_links (file_path, line_number, adr_ref, guide_ref) VALUES ('${escapeSql(relPath)}', ${idx + 1}, '${escapeSql(adrRef)}', '${escapeSql(guideRef)}');\n`;
            }
          }
        });
      }
    });
  });
  sql += '\n';

  // Generate Code-Referenzen.md
  if (codeLinks.length > 0) {
    let md = '---\ntitle: Code-Referenzen\nstatus: active\ntags: [autogenerated, adr, guide, code]\n---\n\n# Code-Referenzen\n\nDiese Datei wird automatisch von `build_db.js` generiert und listet alle Architektur- und Guide-Verknüpfungen aus dem Quellcode auf.\n\n';
    md += '| Code Datei | Zeile | ADR | Guide |\n';
    md += '| :--- | :--- | :--- | :--- |\n';
    codeLinks.forEach(link => {
       const adrStr = link.adr ? `[[${link.adr}]]` : '-';
       const guideStr = link.guide ? `[[${link.guide}]]` : '-';
       md += `| ${link.file} | ${link.line} | ${adrStr} | ${guideStr} |\n`;
    });
    fs.writeFileSync(path.join(targetDir, 'docs', '10-architecture', 'ADR', 'Code-Referenzen.md'), md, 'utf8');
  }

  fs.writeFileSync(outputSqlFile, sql, 'utf-8');
  console.log(`Generated ${outputSqlFile} successfully!`);
}

main();

