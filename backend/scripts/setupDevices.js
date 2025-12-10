const db = require('../src/config/database');

async function setupDevices() {
    try {
        console.log('Setting up Devices table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS devices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                ip_address VARCHAR(45) NOT NULL,
                username VARCHAR(100) NOT NULL,
                password VARCHAR(255) NOT NULL,
                type ENUM('mikrotik', 'olt', 'other') DEFAULT 'mikrotik',
                port INT DEFAULT 8728,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Devices table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up devices table:', error);
        process.exit(1);
    }
}

setupDevices();
