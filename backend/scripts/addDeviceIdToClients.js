const db = require('../src/config/database');

async function addDeviceId() {
    try {
        console.log('Adding device_id to pppoe_clients...');
        
        // Add device_id column
        try {
            await db.query(`
                ALTER TABLE pppoe_clients
                ADD COLUMN device_id INT NULL AFTER id
            `);
            console.log('Column device_id added.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Column device_id already exists.');
            } else {
                throw e;
            }
        }

        // Add Foreign Key
        try {
            await db.query(`
                ALTER TABLE pppoe_clients
                ADD CONSTRAINT fk_device
                FOREIGN KEY (device_id) REFERENCES devices(id)
                ON DELETE SET NULL
            `);
            console.log('Foreign key constraint added.');
        } catch (e) {
            if (e.code === 'ER_DUP_KEY' || e.code === 'ER_CANT_CREATE_TABLE') {
                 console.log('Foreign key already exists or cannot be created (check if devices table exists).');
            } else {
                throw e;
            }
        }

        console.log('Schema update completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

addDeviceId();
