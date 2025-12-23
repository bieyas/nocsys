require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function migratePackagesTable() {
    const sqlPath = path.join(__dirname, '../database/addPackagesTable.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
    let success = true;
    for (const stmt of statements) {
        try {
            await db.query(stmt);
            console.log('Executed:', stmt.split('\n')[0]);
        } catch (err) {
            console.error('Migration error:', err.message);
            success = false;
        }
    }
    if (success) {
        console.log('Migration completed successfully.');
    } else {
        console.log('Migration completed with errors.');
    }
    db.end && db.end();
}

if (require.main === module) {
    migratePackagesTable();
}

module.exports = migratePackagesTable;
