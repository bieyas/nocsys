
require('dotenv/config');
const PPPoEClientModel = require('../backend/src/models/pppoeClientModel');
const db = require('../backend/src/config/database');

describe('PPPoEClientModel', () => {
    let testClientId;

    beforeAll(async () => {
        // Insert dummy client for testing
        const [result] = await db.query(
            "INSERT INTO pppoe_clients (username, password, service_name, ip_address) VALUES ('testuser', 'testpass', 'pppoe', '192.168.1.100')"
        );
        testClientId = result.insertId;
    });

    afterAll(async () => {
        // Clean up test client
        await db.query('DELETE FROM pppoe_clients WHERE id = ?', [testClientId]);
        db.end && db.end();
    });

    test('should update client status', async () => {
        const affected = await PPPoEClientModel.updateStatus(testClientId, 'online');
        expect(affected).toBe(1);
        const client = await PPPoEClientModel.getById(testClientId);
        expect(client.status).toBe('online');
    });

    test('should set status to isolir if ip_address starts with 10.127.', async () => {
        await PPPoEClientModel.update(testClientId, { ip_address: '10.127.1.1' });
        await PPPoEClientModel.updateStatus(testClientId, 'isolir');
        const client = await PPPoEClientModel.getById(testClientId);
        expect(client.status).toBe('isolir');
    });

    test('should update odp_id, latitude, and longitude', async () => {
        // Set new values
        const newOdpId = 123;
        const newLatitude = '-6.200000';
        const newLongitude = '106.800000';
        const affected = await PPPoEClientModel.update(testClientId, {
            odp_id: newOdpId,
            latitude: newLatitude,
            longitude: newLongitude
        });
        expect(affected).toBe(1);
        const client = await PPPoEClientModel.getById(testClientId);
        expect(client.odp_id).toBe(newOdpId);
        expect(client.latitude).toBe(newLatitude);
        expect(client.longitude).toBe(newLongitude);
    });
});
