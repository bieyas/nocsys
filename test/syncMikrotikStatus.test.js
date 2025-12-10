
require('dotenv/config');
const syncMikrotikStatus = require('../backend/scripts/syncMikrotikStatus');

describe('syncMikrotikStatus', () => {
    test('should run without throwing error', async () => {
        await expect(syncMikrotikStatus()).resolves.not.toThrow();
    });
});
