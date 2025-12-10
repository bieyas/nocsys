import React, { useState, useEffect } from 'react';
import { Search, Plus, Box, MapPin, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';

const OdpPop = () => {
    const [activeTab, setActiveTab] = useState('odp'); // 'odp' or 'pop'
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [pops, setPops] = useState([]); // For ODP modal dropdown

    const fetchItems = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'odp' ? '/infrastructure/odps' : '/infrastructure/pops';
            const response = await api.get(endpoint);
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPops = async () => {
        try {
            const response = await api.get('/infrastructure/pops');
            if (response.data.success) {
                setPops(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching POPs:', error);
        }
    };

    useEffect(() => {
        fetchItems();
        if (activeTab === 'odp') {
            fetchPops();
        }
    }, [activeTab]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const endpoint = activeTab === 'odp' ? `/infrastructure/odps/${id}` : `/infrastructure/pops/${id}`;
                await api.delete(endpoint);
                fetchItems();
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Failed to delete item');
            }
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setFormData({});
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = activeTab === 'odp' ? '/infrastructure/odps' : '/infrastructure/pops';
            if (editingItem) {
                await api.put(`${endpoint}/${editingItem.id}`, formData);
            } else {
                await api.post(endpoint, formData);
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Failed to save item');
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Infrastructure</h1>
                    <p className="text-gray-600 mt-1">Manage ODPs and POPs</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add {activeTab.toUpperCase()}</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('odp')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'odp' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                        }`}
                >
                    ODP List
                    {activeTab === 'odp' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('pop')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'pop' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                        }`}
                >
                    POP List
                    {activeTab === 'pop' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                </button>
            </div>

            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab.toUpperCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Code</th>
                                    {activeTab === 'odp' && <th className="p-4">POP</th>}
                                    <th className="p-4">Coordinates</th>
                                    <th className="p-4">Address</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900">{item.name}</td>
                                        <td className="p-4 font-mono text-xs">{item.code || '-'}</td>
                                        {activeTab === 'odp' && <td className="p-4">{item.pop_name || '-'}</td>}
                                        <td className="p-4 font-mono text-xs">
                                            {item.latitude && item.longitude ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-blue-600 hover:underline"
                                                >
                                                    <MapPin size={12} />
                                                    {item.latitude}, {item.longitude}
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 truncate max-w-xs">{item.address || '-'}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredItems.length === 0 && (
                                    <tr>
                                        <td colSpan={activeTab === 'odp' ? 6 : 5} className="p-8 text-center text-gray-500">
                                            No items found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg shadow-2xl">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingItem ? 'Edit' : 'Add'} {activeTab.toUpperCase()}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                <input
                                    type="text"
                                    value={formData.code || ''}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {activeTab === 'odp' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent POP</label>
                                    <select
                                        value={formData.pop_id || ''}
                                        onChange={e => setFormData({ ...formData, pop_id: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select POP</option>
                                        {pops.map(pop => (
                                            <option key={pop.id} value={pop.id}>{pop.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                    <input
                                        type="text"
                                        value={formData.latitude || ''}
                                        onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                    <input
                                        type="text"
                                        value={formData.longitude || ''}
                                        onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    rows="2"
                                    value={formData.address || ''}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OdpPop;
