// src/hooks/useClients.js
import { useState, useEffect, useRef } from 'react';
import { fetchDevices, fetchClients, syncClients, deleteClient, bulkDeleteClients, toggleStatus, saveClient } from '../services/clientApi';
import { connectWebSocket, onStatusUpdate } from '../services/ws';

export function useClients(statusFilter, searchTerm) {
    const [clients, setClients] = useState([]);
    const [devices, setDevices] = useState([]);
    const [onlineUsernames, setOnlineUsernames] = useState(new Set());
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'info' });
    const [selectedClients, setSelectedClients] = useState([]);
    const [packageUpdating, setPackageUpdating] = useState({});

    const pollingRef = useRef();

    useEffect(() => {
        fetchDevices().then(data => {
            if (data.success) {
                setDevices(data.data);
                if (data.data.length > 0) setSelectedDeviceId(data.data[0].id);
            }
        });
        fetchClientsData();
        connectWebSocket();
        onStatusUpdate((statusArr) => {
            setClients(prevClients => prevClients.map(c => {
                const found = statusArr.find(s => s.id === c.id);
                return found ? { ...c, status: found.status } : c;
            }));
            setOnlineUsernames(new Set(statusArr.filter(s => s.status === 'online').map(s => s.username)));
        });
        pollingRef.current = setInterval(fetchClientsData, 30000);
        return () => clearInterval(pollingRef.current);
    }, []);

    const fetchClientsData = async () => {
        setLoading(true);
        try {
            const { clients: cRes, onlineUsernames: oRes } = await fetchClients();
            if (cRes.success) setClients(cRes.data);
            if (oRes.success) setOnlineUsernames(new Set(oRes.data));
        } catch {
            // handle error
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!selectedDeviceId) {
            setToast({ message: 'Please select a device to sync', type: 'warning' });
            return;
        }
        setSyncing(true);
        try {
            await syncClients(selectedDeviceId);
            await fetchClientsData();
            setToast({ message: 'Sync status completed', type: 'success' });
        } catch (error) {
            setToast({ message: error.message || 'Sync failed', type: 'error' });
        } finally {
            setSyncing(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteClient(id, true);
            setClients(clients.filter(c => c.id !== id));
            setSelectedClients(selectedClients.filter(clientId => clientId !== id));
        } catch (error) {
            setToast({ message: error.message || 'Failed to delete client', type: 'error' });
        }
    };

    const handleBulkDelete = async () => {
        try {
            await bulkDeleteClients(selectedClients, true);
            setClients(clients.filter(c => !selectedClients.includes(c.id)));
            setSelectedClients([]);
        } catch (error) {
            setToast({ message: error.message || 'Failed to delete clients', type: 'error' });
        }
    };

    const handleBulkStatus = async (action) => {
        try {
            await toggleStatus(selectedClients, action);
            await fetchClientsData();
            setSelectedClients([]);
        } catch (error) {
            setToast({ message: error.message || `Failed to ${action} clients`, type: 'error' });
        }
    };

    const handleSave = async (editingClient, clientData) => {
        try {
            await saveClient(editingClient, clientData);
            await fetchClientsData();
            setToast({ message: 'Client saved successfully', type: 'success' });
        } catch (error) {
            setToast({ message: error.message || 'Failed to save client', type: 'error' });
            throw error;
        }
    };

    // Filtering logic (copy from Clients.jsx)
    const filteredClients = clients.filter(client => {
        const matchesSearch = client.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.full_name && client.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.customer_id && client.customer_id.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!matchesSearch) return false;
        if (statusFilter === 'online') return onlineUsernames.has(client.username);
        if (statusFilter === 'offline') return !onlineUsernames.has(client.username) && client.status !== 'isolir';
        if (statusFilter === 'isolir') return client.status === 'isolir';
        return true;
    });

    return {
        clients,
        devices,
        onlineUsernames,
        selectedDeviceId,
        setSelectedDeviceId,
        loading,
        syncing,
        toast,
        setToast,
        selectedClients,
        setSelectedClients,
        packageUpdating,
        setPackageUpdating,
        filteredClients,
        fetchClientsData,
        handleSync,
        handleDelete,
        handleBulkDelete,
        handleBulkStatus,
        handleSave
    };
}
