require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../src/config/database');

async function addOdpIdColumn() {
    try {
        await db.query('ALTER TABLE pppoe_clients ADD COLUMN odp_id INT DEFAULT NULL');
        console.log('Column odp_id added to pppoe_clients');
        process.exit(0);
    } catch (err) {
        if (err.message.includes('Duplicate column name')) {
            console.log('Column odp_id already exists.');
            process.exit(0);
        }
        console.error('Error adding odp_id column:', err);
        process.exit(1);
    }
}

addOdpIdColumn();
