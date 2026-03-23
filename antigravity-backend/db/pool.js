const { Pool } = require('pg');

let pool;

const getPool = () => {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DB_URL,
            ssl: { rejectUnauthorized: false }
        });
    }
    return pool;
};

module.exports = {
    query: (text, params) => getPool().query(text, params),
};
