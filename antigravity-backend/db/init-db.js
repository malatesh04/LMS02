require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
});

async function initDB() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');
        console.log('Executing schema.sql...');
        await pool.query(sql);
        console.log('Database tables created successfully!');
    } catch (err) {
        console.error('Error executing schema:', err);
    } finally {
        await pool.end();
    }
}

initDB();
