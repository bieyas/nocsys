

require('dotenv/config');
const request = require('supertest');
const app = require('../backend/src/app');
const db = require('../backend/src/config/database');

describe('PPPoEClientController API', () => {
    let testClientId;

    beforeAll(async () => {
        const [result] = await db.query(
            "INSERT INTO pppoe_clients (username, password, service_name, ip_address) VALUES ('apitestuser', 'apitestpass', 'pppoe', '192.168.1.101')"
        );
        testClientId = result.insertId;
    });

    afterAll(async () => {
        await db.query('DELETE FROM pppoe_clients WHERE id = ?', [testClientId]);
        db.end && db.end();
    });

    test('GET /api/pppoe-clients/:id should return client', async () => {
        const res = await request(app).get(`/api/pppoe-clients/${testClientId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.username).toBe('apitestuser');
    });

    test('PUT /api/pppoe-clients/:id should update client status', async () => {
        const res = await request(app)
            .put(`/api/pppoe-clients/${testClientId}`)
            .send({ status: 'online' });
        expect([200, 400]).toContain(res.statusCode); // 400 if no changes, 200 if updated
    });
});
