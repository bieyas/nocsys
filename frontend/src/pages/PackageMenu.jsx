import React from 'react';
import { Link } from 'react-router-dom';
import { Package, RefreshCw, Plus } from 'lucide-react';

const menuItems = [
    {
        to: '/packages',
        icon: <Package size={20} className="text-blue-500" />,
        label: 'Daftar Paket Langganan',
        desc: 'Lihat dan kelola semua paket langganan yang tersedia.'
    },
    {
        to: '/packages/sync-mikrotik',
        icon: <RefreshCw size={20} className="text-green-500" />,
        label: 'Sinkronisasi Profile PPP Mikrotik',
        desc: 'Ambil dan update profile PPP dari Mikrotik ke paket.'
    },
    {
        to: '/packages/add',
        icon: <Plus size={20} className="text-indigo-500" />,
        label: 'Tambah Paket Baru',
        desc: 'Buat paket langganan baru sesuai kebutuhan.'
    }
];

const PackageMenu = () => (
    <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Manajemen Paket & Bandwidth</h2>
        <div className="grid gap-6">
            {menuItems.map(item => (
                <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-4 p-5 bg-white rounded-xl shadow hover:shadow-lg border border-gray-100 hover:bg-blue-50 transition"
                >
                    <div className="flex-shrink-0">{item.icon}</div>
                    <div>
                        <div className="font-semibold text-lg text-gray-700">{item.label}</div>
                        <div className="text-sm text-gray-500 mt-1">{item.desc}</div>
                    </div>
                </Link>
            ))}
        </div>
    </div>
);

export default PackageMenu;
