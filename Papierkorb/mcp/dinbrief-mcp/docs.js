'use strict';
/**
 * docs.js — duenne MCP-Query-Schicht.
 * ===================================
 * Die eigentliche Index-/Retrieval-Logik lebt in tools/docs_index.js
 * (EIN Builder, aufgerufen auch von tools/build_db.js). Diese Datei
 * re-exportiert sie nur, damit der MCP-Server seinen historischen
 * require('./docs.js')-Pfad behaelt.
 */
module.exports = require('../../../tools/docs_index.js');
