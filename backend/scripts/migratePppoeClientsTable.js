// backend/scripts/migratePppoeClientsTable.js
require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../src/config/database');

const columns = [
    { name: 'customer_id', type: 'VARCHAR(32)' },
    { name: 'full_name', type: 'VARCHAR(128)' },
    { name: 'service_name', type: "VARCHAR(32) DEFAULT 'pppoe'" },
    { name: 'ip_address', type: 'VARCHAR(64)' },
    { name: 'mac_address', type: 'VARCHAR(32)' },
    { name: 'address', type: 'VARCHAR(255)' },
    { name: 'phone_number', type: 'VARCHAR(32)' },
    { name: 'latitude', type: 'VARCHAR(32)' },
    { name: 'longitude', type: 'VARCHAR(32)' },
    { name: 'device_id', type: 'INT' },
    { name: 'odp_id', type: 'INT' },
    { name: 'is_disabled', type: 'TINYINT(1) DEFAULT 0' },
    { name: 'status', type: "VARCHAR(16) DEFAULT 'offline'" },
    { name: 'package_id', type: 'INT' },
    { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
];

async function migrate() {
    for (const col of columns) {
        try {
            await db.query(`ALTER TABLE pppoe_clients ADD COLUMN ${col.name} ${col.type}`);
            console.log(`Added column: ${col.name}`);
        } catch (err) {
            if (err.message.includes('Duplicate column name')) {
                console.log(`Column already exists: ${col.name}`);
            } else {
                console.error(`Error adding column ${col.name}:`, err.message);
            }
        }
    }
    process.exit(0);
}

migrate();
