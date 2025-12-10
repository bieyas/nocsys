const db = require('./src/config/database');

async function checkData() {
    try {
        const [rows] = await db.query('SELECT id, username, full_name, customer_id FROM pppoe_clients LIMIT 10');
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkData();
