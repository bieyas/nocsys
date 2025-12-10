import React, { useState, useEffect } from 'react';
import { X, Save, Server, Router, Globe } from 'lucide-react';

const DeviceModal = ({ isOpen, onClose, onSave, device }) => {
    const [formData, setFormData] = useState({
        name: '',
        ip_address: '',
        username: '',
        password: '',
        type: 'mikrotik',
        port: 8728,
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (device) {
            setFormData({
                name: device.name || '',
                ip_address: device.ip_address || '',
                username: device.username || '',
                password: device.password || '',
                type: device.type || 'mikrotik',
                port: device.port || 8728,
                description: device.description || ''
            });
        } else {
            setFormData({
                name: '',
                ip_address: '',
                username: '',
                password: '',
                type: 'mikrotik',
                port: 8728,
                description: ''
            });
        }
        setError('');
    }, [device, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            setError(err.response?.data?.message || 'Failed to save device');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Server size={24} className="text-blue-600" />
                        {device ? 'Edit Router [NAS]' : 'Add New Router [NAS]'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Device Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Main Router"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="mikrotik">MikroTik</option>
                                <option value="olt">OLT</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                            <input
                                type="number"
                                name="port"
                                value={formData.port}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="8728"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IP Address *</label>
                        <input
                            type="text"
                            name="ip_address"
                            value={formData.ip_address}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="192.168.88.1"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="admin"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="******"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Location, notes, etc."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
                            {loading ? 'Saving...' : 'Save Device'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeviceModal;
