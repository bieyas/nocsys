import React, { useState } from 'react';
import { Package, Users, Zap } from 'lucide-react';

const tabs = [
    { key: 'profil', label: 'Profil', icon: Package },
    { key: 'group', label: 'Group Profil', icon: Users },
    { key: 'bandwidth', label: 'Bandwidth', icon: Zap },
];

const PackageTabs = () => {
    const [activeTab, setActiveTab] = useState('profil');

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Manajemen Paket</h2>
            <div className="flex gap-2 border-b mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors focus:outline-none ${activeTab === tab.key ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="bg-white rounded-xl shadow p-6 min-h-[300px]">
                {activeTab === 'profil' && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Profil PPP (Mikrotik)</h3>
                        <p className="text-gray-500 mb-4">Sinkronisasi dan pengaturan profil PPP yang terhubung ke Mikrotik.</p>
                        {/* TODO: Integrasi dan tabel profil PPP */}
                        <div className="text-gray-400 italic">Fitur akan ditampilkan di sini.</div>
                    </div>
                )}
                {activeTab === 'group' && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Group Profil</h3>
                        <p className="text-gray-500 mb-4">Kelompokkan profil untuk menentukan bandwidth dan pool IP client.</p>
                        {/* TODO: Tabel dan form group profil */}
                        <div className="text-gray-400 italic">Fitur akan ditampilkan di sini.</div>
                    </div>
                )}
                {activeTab === 'bandwidth' && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Pengaturan Bandwidth</h3>
                        <p className="text-gray-500 mb-4">Atur detail bandwidth, rate-limit, burst, dsb.</p>
                        {/* TODO: Form dan tabel bandwidth */}
                        <div className="text-gray-400 italic">Fitur akan ditampilkan di sini.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackageTabs;
