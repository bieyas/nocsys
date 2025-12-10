const { getMikrotikClient } = require('../src/config/mikrotik');

/**
 * Sync PPP profiles from MikroTik to local packages table
 * - Fetch all PPP profiles from MikroTik
 * - Update or insert into packages table
 */
const db = require('../src/config/database');

async function syncPPPProfilesToPackages() {
    const client = await getMikrotikClient();
    try {
        const profiles = await client.write('/ppp/profile/print');
        for (const profile of profiles) {
            // Map profile to package fields
            const name = profile.name;
            const bandwidth = profile['rate-limit'] || '';
            // Upsert package by name
            const [rows] = await db.query('SELECT id FROM packages WHERE name = ?', [name]);
            if (rows.length > 0) {
                await db.query('UPDATE packages SET bandwidth = ? WHERE id = ?', [bandwidth, rows[0].id]);
            } else {
                await db.query('INSERT INTO packages (name, bandwidth) VALUES (?, ?)', [name, bandwidth]);
            }
        }
        console.log('PPP profiles synced to packages table.');
    } catch (err) {
        console.error('Sync error:', err.message);
    } finally {
        client.close();
        db.end && db.end();
    }
}

if (require.main === module) {
    syncPPPProfilesToPackages();
}

module.exports = syncPPPProfilesToPackages;
