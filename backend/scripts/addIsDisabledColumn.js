const db = require('../src/config/database');

async function migrate() {
    try {
        console.log('Adding is_disabled column to pppoe_clients table...');
        await db.query(`
            ALTER TABLE pppoe_clients 
            ADD COLUMN is_disabled BOOLEAN DEFAULT FALSE AFTER service_name;
        `);
        console.log('Migration successful');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column is_disabled already exists');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        process.exit();
    }
}

migrate();
