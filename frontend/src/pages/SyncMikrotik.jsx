import React, { useState } from 'react';
import api from '../services/api';
import Toast from '../components/Toast';

const SyncMikrotik = () => {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'info' });

    const handleSync = async () => {
        setLoading(true);
        try {
            const res = await api.post('/packages/sync-mikrotik');
            setToast({ message: res.data.message, type: 'success' });
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Gagal sinkronisasi', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
            <h2 className="text-xl font-bold mb-4">Sinkronisasi Profile PPP Mikrotik</h2>
            <p className="mb-4 text-gray-600">Klik tombol di bawah untuk mengambil profile PPP dari Mikrotik dan update ke paket langganan.</p>
            <button
                onClick={handleSync}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Sinkronisasi...' : 'Sinkronisasi Sekarang'}
            </button>
        </div>
    );
};

export default SyncMikrotik;
