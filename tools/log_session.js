const fs = require('fs');
const path = require('path');

let Database;
try {
  Database = require('node:sqlite').DatabaseSync;
} catch (e) {
  try {
    const sqlite3 = require('sqlite3').verbose();
    Database = class {
      constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath);
      }
      exec(sql) {
        return new Promise((resolve, reject) => {
          this.db.exec(sql, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      run(sql, params) {
        return new Promise((resolve, reject) => {
          this.db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
          });
        });
      }
      close() {
        this.db.close();
      }
    };
  } catch (err) {
    console.error('Neither node:sqlite nor sqlite3 package could be found. Please ensure Node.js 22.5.0+ or sqlite3 is installed.');
    process.exit(1);
  }
}

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  return null;
}

async function main() {
  const agentName = getArg('--agent') || getArg('-a');
  const actionType = getArg('--action') || getArg('-ac');
  const filePath = getArg('--file') || getArg('-f');
  const description = getArg('--desc') || getArg('-d');

  if (!agentName || !actionType || !filePath || !description) {
    console.error('Usage: node tools/log_session.js --agent <name> --action <action> --file <file> --desc <description>');
    console.error('Shortcuts: -a <name> -ac <action> -f <file> -d <description>');
    process.exit(1);
  }

  const dbPath = path.resolve(__dirname, '../agent/cache/DIN-Brief_docs.db');
  const db = new Database(dbPath);

  try {
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS agent_session_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        agent_name TEXT NOT NULL,
        action_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        description TEXT NOT NULL
      );
    `;
    
    if (typeof db.exec === 'function') {
      db.exec(createTableSql);
    } else {
      await db.run(createTableSql);
    }

    const escape = (val) => val.replace(/'/g, "''");
    
    const directInsert = `
      INSERT INTO agent_session_logs (agent_name, action_type, file_path, description)
      VALUES ('${escape(agentName)}', '${escape(actionType)}', '${escape(filePath)}', '${escape(description)}');
    `;

    if (typeof db.exec === 'function') {
      db.exec(directInsert);
    } else {
      await db.run(directInsert);
    }

    console.log(`Successfully logged session action for agent "${agentName}" on file "${filePath}".`);
  } catch (err) {
    console.error('Failed to log session:', err);
    process.exit(1);
  } finally {
    if (db && typeof db.close === 'function') {
      db.close();
    }
  }
}

main();
