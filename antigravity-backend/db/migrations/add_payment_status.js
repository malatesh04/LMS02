const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        // Check if columns exist
        const checkResult = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'enrollments' AND column_name = 'payment_status'
        `);

        if (checkResult.rows.length === 0) {
            console.log('Adding payment_status column to enrollments...');
            await pool.query(`
                ALTER TABLE enrollments 
                ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending',
                ADD COLUMN payment_id TEXT,
                ADD COLUMN amount_paid DECIMAL(10, 2)
            `);
            console.log('✅ Columns added successfully');
        } else {
            console.log('✅ Payment columns already exist');
        }

        // Update existing enrollments to completed (for free access during demo)
        const updateResult = await pool.query(`
            UPDATE enrollments 
            SET payment_status = 'completed' 
            WHERE payment_status IS NULL OR payment_status = 'pending'
        `);
        console.log(`✅ Updated ${updateResult.rowCount} existing enrollments to completed`);

    } catch (err) {
        console.error('Migration error:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
