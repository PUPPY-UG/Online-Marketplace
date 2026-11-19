const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runInit() {
  console.log('--- UniTrade MySQL Database Initializer ---');
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'unitrade_db';

  try {
    console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);
    const conn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
    
    console.log(`Reading SQL schema file...`);
    const schemaFile = path.resolve(__dirname, '../../database/unitrade_full.sql');
    if (!fs.existsSync(schemaFile)) {
      throw new Error(`File not found: ${schemaFile}`);
    }

    const sql = fs.readFileSync(schemaFile, 'utf-8');
    console.log(`Importing database and seeding demonstration records into ${database}...`);
    await conn.query(sql);

    console.log('SUCCESS! UniTrade MySQL database schema and seed data imported successfully.');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Initialization failed:', err.message);
    console.log('Note: If MySQL is not currently running, UniTrade will automatically use the built-in Embedded Campus DB engine.');
    process.exit(1);
  }
}

runInit();
