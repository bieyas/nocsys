import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { Box, Server, User } from 'lucide-react';
import { serverIcon, boxIcon, userIcon, onuIcon } from '../assets/mapIcons';

const MapComponent = () => {
    const [data, setData] = useState({ pops: [], odps: [], clients: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/infrastructure/map');
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching map data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate center based on data or default to Jakarta
    const defaultCenter = [-6.200000, 106.816666];
    const center = data.pops.length > 0
        ? [parseFloat(data.pops[0].latitude), parseFloat(data.pops[0].longitude)]
        : defaultCenter;

    if (loading) return <div className="text-center py-12 text-gray-500">Loading Map...</div>;

    return (
        <div className="h-[calc(100vh-100px)] rounded-xl overflow-hidden border border-gray-200 relative shadow-sm">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* POP Markers */}
                {data.pops.map(pop => (
                    <Marker
                        key={`pop-${pop.id}`}
                        position={[parseFloat(pop.latitude), parseFloat(pop.longitude)]}
                        icon={serverIcon}
                    >
                        <Popup>
                            <div className="font-sans">
                                <h3 className="font-bold text-red-600 flex items-center gap-2">
                                    <Server size={16} /> {pop.name}
                                </h3>
                                <p className="text-sm text-gray-600">{pop.address}</p>
                                <p className="text-xs text-gray-500 mt-1">{pop.description}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* ODP Markers */}
                {data.odps.map(odp => (
                    <Marker
                        key={`odp-${odp.id}`}
                        position={[parseFloat(odp.latitude), parseFloat(odp.longitude)]}
                        icon={boxIcon}
                    >
                        <Popup>
                            <div className="font-sans">
                                <h3 className="font-bold text-blue-600 flex items-center gap-2">
                                    <Box size={16} /> {odp.name}
                                </h3>
                                <p className="text-sm text-gray-600">{odp.address}</p>
                                <p className="text-xs text-gray-500 mt-1">Ports: {odp.total_ports}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Client/ONU Markers */}
                {data.clients.map(client => (
                    <Marker
                        key={`client-${client.id}`}
                        position={[parseFloat(client.latitude), parseFloat(client.longitude)]}
                        icon={onuIcon(client.status)}
                    >
                        <Popup>
                            <div className="font-sans">
                                <h3 className={`font-bold flex items-center gap-2 ${client.status === 'online' ? 'text-green-600' : client.status === 'offline' ? 'text-yellow-600' : 'text-red-600'}`}>
                                    <User size={16} /> {client.full_name}
                                </h3>
                                <p className="text-sm text-gray-600">{client.address}</p>
                                <p className="text-xs text-gray-500 mt-1">{client.service_name}</p>
                                <p className="text-xs mt-1 font-semibold">Status: <span className={client.status === 'online' ? 'text-green-600' : client.status === 'offline' ? 'text-yellow-600' : 'text-red-600'}>{client.status}</span></p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
                    <h4 className="font-bold text-gray-800 mb-2 text-sm">Legend</h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <img src={serverIcon.options.iconUrl} alt="POP" className="w-5 h-7" />
                            <span className="text-gray-700">POP (Point of Presence)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <img src={boxIcon.options.iconUrl} alt="ODP" className="w-5 h-7" />
                            <span className="text-gray-700">ODP (Distribution Point)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <img src={onuIcon('online').options.iconUrl} alt="ONU Online" className="w-5 h-7" />
                            <span className="text-gray-700">ONU Online</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <img src={onuIcon('isolir').options.iconUrl} alt="ONU Isolir" className="w-5 h-7" />
                            <span className="text-gray-700">ONU Isolir</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <img src={onuIcon('offline').options.iconUrl} alt="ONU Offline" className="w-5 h-7" />
                            <span className="text-gray-700">ONU Offline</span>
                        </div>
                    </div>
                </div>
            </MapContainer>
        </div>
    );
};

export default MapComponent;
