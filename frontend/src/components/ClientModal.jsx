import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api, { getOdps } from '../services/api';
import PackageSelect from './PackageSelect';

const ClientModal = ({ isOpen, onClose, onSave, client }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        service_name: 'pppoe',
        ip_address: '',
        mac_address: '',
        address: '',
        phone_number: '',
        latitude: '',
        longitude: '',
        device_id: '',
        odp_id: '',
        sync_mikrotik: true,
        package_id: ''
    });
    const [devices, setDevices] = useState([]);
    const [odps, setOdps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await api.get('/devices');
                if (response.data.success) {
                    setDevices(response.data.data);
                    if (!client && response.data.data.length > 0) {
                        setFormData(prev => ({ ...prev, device_id: response.data.data[0].id }));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch devices', err);
            }
        };
        const fetchOdps = async () => {
            try {
                const response = await getOdps();
                if (response.data.success) {
                    setOdps(response.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch ODPs', err);
            }
        };
        if (isOpen) {
            fetchDevices();
            fetchOdps();
        }
    }, [isOpen, client]);

    useEffect(() => {
        if (client) {
            setFormData({
                username: client.username || '',
                password: client.password || '',
                full_name: client.full_name || '',
                service_name: client.service_name || 'pppoe',
                ip_address: client.ip_address || '',
                mac_address: client.mac_address || '',
                address: client.address || '',
                phone_number: client.phone_number || '',
                latitude: client.latitude || '',
                longitude: client.longitude || '',
                device_id: client.device_id || '',
                odp_id: client.odp_id || '',
                sync_mikrotik: true,
                package_id: client.package_id || ''
            });
        } else {
            setFormData(prev => ({
                username: '',
                password: '',
                full_name: '',
                service_name: 'pppoe',
                ip_address: '',
                mac_address: '',
                address: '',
                phone_number: '',
                latitude: '',
                longitude: '',
                device_id: prev.device_id || '',
                odp_id: '',
                sync_mikrotik: true,
                package_id: ''
            }));
        }
        {/* Package Selection */ }
        <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Paket Langganan</h3>
            <PackageSelect value={formData.package_id} onChange={handleChange} />
        </div>
        setError('');
    }, [client, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save client');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl border border-gray-200 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {client ? 'Edit Client' : 'Add New Client'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Account Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Account Info</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Router / Device *</label>
                                <select
                                    name="device_id"
                                    value={formData.device_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Select a Device</option>
                                    {devices.map(device => (
                                        <option key={device.id} value={device.id}>
                                            {device.name} ({device.ip_address})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="johndoe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input
                                    type="text" // Using text to see password easily as requested in NOC tools usually
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="secret123"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Profile *</label>
                                <input
                                    type="text"
                                    name="service_name"
                                    value={formData.service_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="pppoe"
                                />
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Personal Info</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="08123456789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Jl. Merdeka No. 1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ODP Selection - Always visible */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">ODP Selection</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ODP *</label>
                            <select
                                name="odp_id"
                                value={formData.odp_id}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="">Select an ODP</option>
                                {odps.map(odp => (
                                    <option key={odp.id} value={odp.id}>
                                        {odp.name} - {odp.location}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Location Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                <input
                                    type="text"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="-6.200000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                <input
                                    type="text"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="106.816666"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Network Configuration */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Network Configuration (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Static IP Address</label>
                                <input
                                    type="text"
                                    name="ip_address"
                                    value={formData.ip_address}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="192.168.1.100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address</label>
                                <input
                                    type="text"
                                    name="mac_address"
                                    value={formData.mac_address}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="AA:BB:CC:DD:EE:FF"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Device Selection - Only for new clients */}
                    {!client && (
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Device Selection</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Device *</label>
                                <select
                                    name="device_id"
                                    value={formData.device_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    {devices.length === 0 ? (
                                        <option value="">No devices found</option>
                                    ) : (
                                        devices.map(device => (
                                            <option key={device.id} value={device.id}>
                                                {device.name} - {device.type}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="sync_mikrotik"
                                    name="sync_mikrotik"
                                    checked={formData.sync_mikrotik}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="sync_mikrotik" className="text-sm text-gray-700">
                                    Create in MikroTik Router as well
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Save size={18} />
                            {loading ? (client ? 'Updating...' : 'Saving...') : (client ? 'Update Client' : 'Save Client')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientModal;