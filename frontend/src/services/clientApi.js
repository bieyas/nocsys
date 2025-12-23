// src/services/clientApi.js
import api from './api';

export const fetchDevices = async () => {
    const response = await api.get('/devices');
    return response.data;
};

export const fetchClients = async () => {
    const [clientsRes, onlineRes] = await Promise.all([
        api.get('/pppoe-clients'),
        api.get('/pppoe-clients/online')
    ]);
    return {
        clients: clientsRes.data,
        onlineUsernames: onlineRes.data
    };
};

export const syncClients = async (deviceId) => {
    await api.post('/pppoe-clients/sync', { device_id: deviceId });
    return api.post('/pppoe-clients/sync-status', { device_id: deviceId });
};

export const deleteClient = (id, syncMikrotik) =>
    api.delete(`/pppoe-clients/${id}?sync_mikrotik=${syncMikrotik}`);

export const bulkDeleteClients = (ids, syncMikrotik) =>
    api.post('/pppoe-clients/bulk-delete', { ids, sync_mikrotik: syncMikrotik });

export const toggleStatus = (ids, action) =>
    api.post('/pppoe-clients/toggle-status', { ids, action });

export const saveClient = (editingClient, clientData) => {
    if (editingClient) {
        return api.put(`/pppoe-clients/${editingClient.id}`, clientData);
    } else {
        return api.post('/pppoe-clients', clientData);
    }
};
