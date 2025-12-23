import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Server, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white rounded shadow-sm border-t-4 border-${color}-500 p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide">{title}</h3>
                {typeof value === 'string' || typeof value === 'number' ? (
                    <span className="text-2xl font-bold text-gray-800 mt-1">{value}</span>
                ) : (
                    <div className="text-2xl font-bold text-gray-800 mt-1">{value}</div>
                )}
            </div>
            <div className={`text-${color}-500 opacity-80`}>
                <Icon size={32} />
            </div>
        </div>
        {trend && (
            <div className={`mt-4 flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                <span className="font-medium">{trendValue}</span>
                <span className="text-gray-400 ml-1 font-normal">Since last month</span>
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_clients: 0,
        active_sessions: 0,
        offline_clients: 0,
        bandwidth_usage: '0 Mbps'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/pppoe-clients/stats');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Home / <span className="text-gray-800 font-medium">Dashboard</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Clients"
                    value={loading ? "..." : stats.total_clients}
                    icon={Users}
                    color="blue"
                    trend="up"
                    trendValue="+2 new"
                    onClick={() => navigate('/clients')}
                />
                <StatCard
                    title="Active Sessions"
                    value={loading ? "..." : stats.active_sessions}
                    icon={Activity}
                    color="green"
                    trend="up"
                    trendValue="Live"
                    onClick={() => navigate('/clients?status=online')}
                />
                <StatCard
                    title="Offline"
                    value={loading ? "..." : stats.offline_clients}
                    icon={Server}
                    color="red"
                    trend="down"
                    trendValue="Disconnected"
                    onClick={() => navigate('/clients?status=offline')}
                />
                <StatCard
                    title="Isolir"
                    value={loading ? "..." : (typeof stats.isolir_clients !== 'undefined' ? stats.isolir_clients : 0)}
                    icon={Server}
                    color="yellow"
                    trend="down"
                    trendValue="Disconnected"
                    onClick={() => navigate('/clients?status=isolir')}
                />
                {/* <StatCard
                    title="Bandwidth Usage"
                    value={loading ? "..." : (
                        <div className="text-lg">
                            {stats.bandwidth_usage || "N/A"}
                        </div>
                    )}
                    icon={Activity}
                    color="purple"
                /> */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded shadow-sm border-t-2 border-blue-500">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                        <button className="text-gray-400 hover:text-gray-600"><Activity size={16} /></button>
                    </div>
                    <div className="p-4">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">Client connected</p>
                                        <p className="text-xs text-gray-500">User 'ngumpul' established connection</p>
                                    </div>
                                    <span className="text-xs text-gray-400">2m ago</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded shadow-sm border-t-2 border-purple-500">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">System Status</h2>
                        <button className="text-gray-400 hover:text-gray-600"><Server size={16} /></button>
                    </div>
                    <div className="p-4 space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 font-medium">CPU Usage</span>
                                <span className="text-gray-800 font-bold">45%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[45%] shadow-sm"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 font-medium">Memory Usage</span>
                                <span className="text-gray-800 font-bold">60%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[60%] shadow-sm"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 font-medium">Disk Space</span>
                                <span className="text-gray-800 font-bold">25%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[25%] shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
