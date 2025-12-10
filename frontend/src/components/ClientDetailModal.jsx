import React from 'react';
import { X, MapPin, Globe, User, Server, Network, Phone, Home } from 'lucide-react';

const isClientDisabled = (c) => {
    const val = c.is_disabled;
    if (!val) return false;
    if (val === true || val === 1 || val === '1') return true;
    if (typeof val === 'object' && val.type === 'Buffer' && val.data?.[0] === 1) return true;
    return false;
};

const ClientDetailModal = ({ isOpen, onClose, client }) => {
    if (!isOpen || !client) return null;

    const isDisabled = isClientDisabled(client);

    const InfoRow = ({ icon: Icon, label, value, isMono = false }) => (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500">
                <Icon size={18} />
            </div>
            <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-0.5">{label}</div>
                <div className={`text-gray-800 ${isMono ? 'font-mono' : ''}`}>{value || '-'}</div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl border border-gray-200 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${isDisabled ? 'bg-red-100 text-red-700' : 'bg-blue-600 text-white'}`}>
                            {client.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                {client.full_name || client.username}
                                {isDisabled && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600 border border-red-200">
                                        Disabled
                                    </span>
                                )}
                            </h2>
                            <p className="text-gray-500 text-sm">ID: {client.customer_id || '-'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Account & Service */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Server size={16} /> Account & Service
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow icon={User} label="Username" value={client.username} />
                            <InfoRow icon={User} label="Password" value={client.password} isMono={true} />
                            <InfoRow icon={Server} label="Service Profile" value={client.service_name} />
                            <InfoRow icon={Server} label="Router / Device" value={client.device_name} />
                        </div>
                    </div>

                    {/* Network Information */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Network size={16} /> Network Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow icon={Globe} label="IP Address" value={client.ip_address} isMono={true} />
                            <InfoRow icon={Network} label="MAC Address" value={client.mac_address} isMono={true} />
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <User size={16} /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow icon={Phone} label="Phone Number" value={client.phone_number} />
                            <InfoRow icon={Home} label="Address" value={client.address} />
                        </div>
                    </div>

                    {/* Location */}
                    {(client.latitude || client.longitude) && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <MapPin size={16} /> Location
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoRow icon={MapPin} label="Latitude" value={client.latitude} isMono={true} />
                                <InfoRow icon={MapPin} label="Longitude" value={client.longitude} isMono={true} />
                            </div>
                            <div className="mt-4">
                                <a
                                    href={`https://www.google.com/maps?q=${client.latitude},${client.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors text-sm"
                                >
                                    <MapPin size={16} />
                                    View on Google Maps
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientDetailModal;