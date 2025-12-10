import React, { useState, useEffect } from 'react';
import { Search, Plus, Server, Router, Globe, Edit, Trash2, MoreVertical } from 'lucide-react';
import api from '../services/api';
import DeviceModal from '../components/DeviceModal';

const Devices = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);

    const fetchDevices = async () => {
        try {
            const response = await api.get('/devices');
            if (response.data.success) {
                setDevices(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete device ${name}?`)) {
            try {
                await api.delete(`/devices/${id}`);
                setDevices(devices.filter(d => d.id !== id));
            } catch (error) {
                console.error('Error deleting device:', error);
                alert('Failed to delete device');
            }
        }
    };

    const handleAdd = () => {
        setEditingDevice(null);
        setIsModalOpen(true);
    };

    const handleEdit = (device) => {
        setEditingDevice(device);
        setIsModalOpen(true);
    };

    const handleSave = async (deviceData) => {
        try {
            if (editingDevice) {
                await api.put(`/devices/${editingDevice.id}`, deviceData);
            } else {
                await api.post('/devices', deviceData);
            }
            await fetchDevices();
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const filteredDevices = devices.filter(device =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.ip_address.includes(searchTerm)
    );

    const getIcon = (type) => {
        switch (type) {
            case 'mikrotik': return <Router size={24} className="text-blue-600" />;
            case 'olt': return <Server size={24} className="text-green-600" />;
            default: return <Globe size={24} className="text-gray-400" />;
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Router [NAS] List</h1>
                    <p className="text-gray-600 mt-1">Manage your routers, OLTs, and servers</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Router [NAS]</span>
                </button>
            </div>

            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search devices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading devices...</div>
            ) : filteredDevices.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                    <Server size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No devices found. Add your first device to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDevices.map((device) => (
                        <div key={device.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-400 transition-colors group shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-lg bg-gray-100 border border-gray-200">
                                    {getIcon(device.type)}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(device)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(device.id, device.name)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-1">{device.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-mono">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                {device.ip_address}:{device.port}
                            </div>

                            <div className="space-y-2 text-sm text-gray-500 border-t border-gray-200 pt-4">
                                <div className="flex justify-between">
                                    <span>Type</span>
                                    <span className="text-gray-700 capitalize">{device.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Username</span>
                                    <span className="text-gray-700">{device.username}</span>
                                </div>
                                {device.description && (
                                    <div className="pt-2 text-xs text-gray-400 line-clamp-2">
                                        {device.description}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <DeviceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                device={editingDevice}
            />
        </div>
    );
};

export default Devices;
