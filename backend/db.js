const { createClient } = require('@libsql/client');
require('dotenv').config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Must be async
async function get(sql, args = []) {
  const result = await db.execute({ sql, args });
  return result.rows[0];
}

// Must be async
async function all(sql, args = []) {
  const result = await db.execute({ sql, args });
  return result.rows;
}

// Must be async
async function run(sql, args = []) {
  const result = await db.execute({ sql, args });
  return {
    // Convert BigInt to Number so JSON responses don't crash
    lastInsertRowid: result.lastInsertRowid != null ? Number(result.lastInsertRowid) : null,
    changes: result.rowsAffected,
  };
}

module.exports = { db, get, all, run };