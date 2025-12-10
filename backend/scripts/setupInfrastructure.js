const db = require('../src/config/database');

const setupInfrastructure = async () => {
    try {
        console.log('Setting up Infrastructure tables...');

        // Create POPs table
        await db.query(`
            CREATE TABLE IF NOT EXISTS pops (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(50),
                address TEXT,
                latitude VARCHAR(50),
                longitude VARCHAR(50),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('POPs table created or already exists.');

        // Create ODPs table
        await db.query(`
            CREATE TABLE IF NOT EXISTS odps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(50),
                pop_id INT,
                address TEXT,
                latitude VARCHAR(50),
                longitude VARCHAR(50),
                total_ports INT DEFAULT 8,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (pop_id) REFERENCES pops(id) ON DELETE SET NULL
            )
        `);
        console.log('ODPs table created or already exists.');

        console.log('Infrastructure setup completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up infrastructure:', error);
        process.exit(1);
    }
};

setupInfrastructure();
