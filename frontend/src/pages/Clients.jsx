import React, { useState, useEffect, useRef } from 'react';
import PackageSelect from '../components/PackageSelect';
import { updateClientPackage } from '../services/packageApi';
import Toast from '../components/Toast';
import { useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, Plus, MoreVertical, Trash2, Edit, CheckCircle, XCircle, MessageCircle, MapPin, Power, PowerOff, Info, Globe } from 'lucide-react';
import api from '../services/api';
import { connectWebSocket, onStatusUpdate } from '../services/ws';
import ClientModal from '../components/ClientModal';
import ClientDetailModal from '../components/ClientDetailModal';

// Helper to safely check if client is disabled (handling boolean, number, string, or Buffer)
const isClientDisabled = (client) => {
    const val = client.is_disabled;
    if (!val) return false;
    if (val === true || val === 1 || val === '1') return true;
    // Handle MySQL BIT field returned as Buffer
    if (typeof val === 'object' && val.type === 'Buffer' && val.data?.[0] === 1) return true;
    return false;
};

const Clients = () => {
    const [toast, setToast] = useState({ message: '', type: 'info' });
    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get('status'); // 'online' or 'offline' or null

    const [clients, setClients] = useState([]);
    const [packageUpdating, setPackageUpdating] = useState({}); // { [clientId]: true }
    const [devices, setDevices] = useState([]);
    const [onlineUsernames, setOnlineUsernames] = useState(new Set());
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [detailClient, setDetailClient] = useState(null);
    const [selectedClients, setSelectedClients] = useState([]);

    const fetchDevices = async () => {
        try {
            const response = await api.get('/devices');
            if (response.data.success) {
                setDevices(response.data.data);
                if (response.data.data.length > 0) {
                    setSelectedDeviceId(response.data.data[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    const fetchClients = async () => {
        try {
            const [clientsRes, onlineRes] = await Promise.all([
                api.get('/pppoe-clients'),
                api.get('/pppoe-clients/online')
            ]);

            if (clientsRes.data.success) {
                setClients(clientsRes.data.data);
            }
            if (onlineRes.data.success) {
                setOnlineUsernames(new Set(onlineRes.data.data));
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!selectedDeviceId) {
            alert('Please select a device to sync');
            return;
        }
        setSyncing(true);
        try {
            await api.post('/pppoe-clients/sync', { device_id: selectedDeviceId });
            // Setelah sync data, lakukan sync status
            const statusRes = await api.post('/pppoe-clients/sync-status', { device_id: selectedDeviceId });
            await fetchClients();
            setToast({
                message: statusRes.data?.message || 'Sync status completed',
                type: statusRes.data?.success ? 'success' : 'warning'
            });
        } catch (error) {
            console.error('Error syncing:', error);
            setToast({
                message: error.response?.data?.message || 'Sync failed',
                type: 'error'
            });
        } finally {
            setSyncing(false);
        }
    };

    const handleDelete = async (id, username) => {
        if (!window.confirm(`Are you sure you want to delete client ${username}?`)) {
            return;
        }

        const syncMikrotik = window.confirm('Also delete from MikroTik Router?');

        try {
            await api.delete(`/pppoe-clients/${id}?sync_mikrotik=${syncMikrotik}`);
            setClients(clients.filter(c => c.id !== id));
            setSelectedClients(selectedClients.filter(clientId => clientId !== id));
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Failed to delete client');
        }
    };

    const handleBulkDelete = async () => {
        const shouldSync = window.confirm('Do you want to delete these clients from MikroTik as well?\n\nClick OK to delete from BOTH Database and MikroTik.\nClick Cancel to delete from Database ONLY.');

        // Note: window.confirm only returns true/false. 
        // If user cancels, they might mean "Cancel operation" or "No, don't sync".
        // This standard confirm is ambiguous.
        // Let's use a custom approach or just assume "Cancel" means abort.
        // But the user asked for a choice.

        // Better approach: Use a custom modal or a simple prompt?
        // Let's try a different UX: Add a checkbox near the bulk delete button?
        // Or just use two confirms?
        // "Are you sure you want to delete?" -> OK
        // "Also delete from MikroTik?" -> OK/Cancel

        if (!window.confirm(`Are you sure you want to delete ${selectedClients.length} clients?`)) {
            return;
        }

        const syncMikrotik = window.confirm('Also delete from MikroTik Router?');

        try {
            await api.post('/pppoe-clients/bulk-delete', { ids: selectedClients, sync_mikrotik: syncMikrotik });
            setClients(clients.filter(c => !selectedClients.includes(c.id)));
            setSelectedClients([]);
        } catch (error) {
            console.error('Error deleting clients:', error);
            alert('Failed to delete clients');
        }
    };

    const handleBulkStatus = async (action) => {
        try {
            await api.post('/pppoe-clients/toggle-status', { ids: selectedClients, action });
            await fetchClients(); // Refresh to get updated status
            setSelectedClients([]);
        } catch (error) {
            console.error(`Error ${action}ing clients:`, error);
            alert(`Failed to ${action} clients`);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedClients(filteredClients.map(c => c.id));
        } else {
            setSelectedClients([]);
        }
    };

    const handleSelect = (id) => {
        if (selectedClients.includes(id)) {
            setSelectedClients(selectedClients.filter(clientId => clientId !== id));
        } else {
            setSelectedClients([...selectedClients, id]);
        }
    };

    const handleAdd = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleSave = async (clientData) => {
        try {
            let response;
            if (editingClient) {
                response = await api.put(`/pppoe-clients/${editingClient.id}`, clientData);
            } else {
                response = await api.post('/pppoe-clients', clientData);
            }
            await fetchClients();
            setToast({
                message: response.data?.message || 'Client saved successfully',
                type: response.data?.success ? 'success' : 'warning'
            });
        } catch (error) {
            setToast({
                message: error.response?.data?.message || 'Failed to save client',
                type: 'error'
            });
            throw error; // Let the modal handle the error display
        }
    };

    const handleDetail = (client) => {
        setDetailClient(client);
        setIsDetailModalOpen(true);
    };

    const handleRemote = (ipAddress) => {
        if (!ipAddress) {
            alert('No IP address available for this client.');
            return;
        }
        window.open(`http://${ipAddress}`, '_blank');
    };

    const handleWhatsApp = (phoneNumber) => {
        if (!phoneNumber) {
            alert('No phone number available for this client.');
            return;
        }
        // Format phone number: replace 08 with 628, remove non-digits
        let formatted = phoneNumber.replace(/\D/g, '');
        if (formatted.startsWith('0')) {
            formatted = '62' + formatted.substring(1);
        }
        window.open(`https://wa.me/${formatted}`, '_blank');
    };

    const handleMap = (lat, long) => {
        if (!lat || !long) {
            alert('No coordinates available for this client.');
            return;
        }
        window.open(`https://www.google.com/maps?q=${lat},${long}`, '_blank');
    };

    // Hybrid polling + WebSocket
    const pollingRef = useRef();
    useEffect(() => {
        fetchDevices();
        fetchClients();
        connectWebSocket();
        // Listen for status push
        onStatusUpdate((statusArr) => {
            // statusArr: [{ id, username, status }]
            setClients(prevClients => prevClients.map(c => {
                const found = statusArr.find(s => s.id === c.id);
                return found ? { ...c, status: found.status } : c;
            }));
            setOnlineUsernames(new Set(statusArr.filter(s => s.status === 'online').map(s => s.username)));
        });
        // Polling fallback every 30s
        pollingRef.current = setInterval(fetchClients, 30000);
        return () => {
            clearInterval(pollingRef.current);
        };
    }, []);

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.full_name && client.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.customer_id && client.customer_id.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        if (statusFilter === 'online') {
            return onlineUsernames.has(client.username);
        }
        if (statusFilter === 'offline') {
            return !onlineUsernames.has(client.username);
        }
        return true;
    });

    return (
        <div>
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: 'info' })}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {statusFilter === 'online' ? 'Online Clients' :
                            statusFilter === 'offline' ? 'Offline Clients' :
                                'PPPoE Clients'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {statusFilter === 'online' ? 'Viewing currently active sessions' :
                            statusFilter === 'offline' ? 'Viewing disconnected clients' :
                                'Manage your network subscribers'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        className="bg-white text-gray-700 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-blue-500"
                    >
                        {devices.length === 0 && <option value="">No Devices</option>}
                        {devices.map(device => (
                            <option key={device.id} value={device.id}>{device.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleSync}
                        disabled={syncing || !selectedDeviceId}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync MikroTik'}</span>
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Client</span>
                    </button>
                </div>
            </div>

            {selectedClients.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
                    <span className="text-blue-700 font-medium">{selectedClients.length} clients selected</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleBulkStatus('enable')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors text-sm"
                        >
                            <Power size={16} />
                            <span className="hidden sm:inline">Enable</span>
                        </button>
                        <button
                            onClick={() => handleBulkStatus('disable')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors text-sm"
                        >
                            <PowerOff size={16} />
                            <span className="hidden sm:inline">Disable</span>
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors text-sm"
                        >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={filteredClients.length > 0 && selectedClients.length === filteredClients.length}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="p-4 font-medium">Customer</th>
                                <th className="p-4 font-medium">Service</th>
                                <th className="p-4 font-medium hidden md:table-cell">Device</th>
                                <th className="p-4 font-medium hidden md:table-cell">IP Address</th>
                                <th className="p-4 font-medium hidden lg:table-cell">MAC Address</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">Loading clients...</td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">No clients found</td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => {
                                    const isDisabled = isClientDisabled(client);
                                    // Status: online, isolir, offline
                                    let statusColor = 'bg-red-500';
                                    let statusText = 'Offline';
                                    if (client.status === 'online') {
                                        statusColor = 'bg-green-500';
                                        statusText = 'Online';
                                    } else if (client.status === 'isolir') {
                                        statusColor = 'bg-yellow-400';
                                        statusText = 'Isolir';
                                    }
                                    return (
                                        <tr key={client.id} className={`hover:bg-gray-50 transition-colors group ${isDisabled ? 'opacity-60 bg-gray-50' : ''}`}>
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedClients.includes(client.id)}
                                                    onChange={() => handleSelect(client.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-gray-600 font-bold ${isDisabled ? 'bg-red-100' : 'bg-gray-200'}`}>
                                                            {client.username.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${statusColor}`} title={statusText}></div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 flex items-center gap-2">
                                                            {client.full_name || client.username}
                                                            {isDisabled && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Disabled</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-500">ID: {client.customer_id || '-'}</div>
                                                        <div className="text-xs mt-1 font-semibold">
                                                            <span className={`px-2 py-0.5 rounded ${client.status === 'online' ? 'bg-green-100 text-green-700' : client.status === 'isolir' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{statusText}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                    {client.service_name}
                                                </span>
                                                <div className="mt-2">
                                                    <PackageSelect
                                                        value={client.package_id || ''}
                                                        onChange={async (e) => {
                                                            const newPackageId = e.target.value;
                                                            setPackageUpdating(prev => ({ ...prev, [client.id]: true }));
                                                            try {
                                                                await updateClientPackage(client.id, newPackageId);
                                                                setToast({ message: 'Paket langganan berhasil diubah', type: 'success' });
                                                                await fetchClients();
                                                            } catch (err) {
                                                                setToast({ message: 'Gagal mengubah paket langganan', type: 'error' });
                                                            } finally {
                                                                setPackageUpdating(prev => ({ ...prev, [client.id]: false }));
                                                            }
                                                        }}
                                                    />
                                                    {packageUpdating[client.id] && (
                                                        <span className="text-xs text-blue-500 ml-2">Updating...</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600 hidden md:table-cell text-sm">
                                                {client.device_name || <span className="text-gray-400 italic">Unknown</span>}
                                            </td>
                                            <td className="p-4 text-gray-600 hidden md:table-cell font-mono text-sm">
                                                {client.ip_address || '-'}
                                            </td>
                                            <td className="p-4 text-gray-600 hidden lg:table-cell font-mono text-sm">
                                                {client.mac_address || '-'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDetail(client)}
                                                        className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                                        title="Detail"
                                                    >
                                                        <Info size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemote(client.ip_address)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Remote Device"
                                                    >
                                                        <Globe size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleWhatsApp(client.phone_number)}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="WhatsApp"
                                                    >
                                                        <MessageCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleMap(client.latitude, client.longitude)}
                                                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Open Map"
                                                    >
                                                        <MapPin size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(client)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                    <span>Showing {filteredClients.length} clients</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50" disabled>Prev</button>
                        <button className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>

            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                client={editingClient}
            />

            <ClientDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                client={detailClient}
            />
        </div>
    );
};

export default Clients;

