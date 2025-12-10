require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../src/config/database');

async function addStatusColumn() {
    try {
        await db.query('ALTER TABLE pppoe_clients ADD COLUMN status VARCHAR(16) DEFAULT "offline"');
        console.log('Column status added to pppoe_clients');
        process.exit(0);
    } catch (err) {
        if (err.message.includes('Duplicate column name')) {
            console.log('Column status already exists.');
            process.exit(0);
        }
        console.error('Error adding status column:', err);
        process.exit(1);
    }
}

addStatusColumn();
