import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Menu, X, Activity, LogOut, Server, Network, ChevronDown, ChevronRight, Map, Box, Search, Bell, Package } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label, active, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={clsx(
            "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
            active
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-300 hover:bg-white/10 hover:text-white"
        )}
    >
        {Icon && <Icon size={18} />}
        <span className="font-medium">{label}</span>
    </Link>
);

const SidebarGroup = ({ icon: Icon, label, children, active, isOpen, onToggle }) => (
    <div>
        <button
            onClick={onToggle}
            className={clsx(
                "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
                active
                    ? "text-white bg-white/10"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
            )}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} />
                <span className="font-medium">{label}</span>
            </div>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {isOpen && (
            <div className="bg-black/20 py-1">
                {children}
            </div>
        )}
    </div>
);

const MainLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openGroups, setOpenGroups] = useState(['Devices']);
    const location = useLocation();
    const { user, logout } = useAuth();

    const toggleGroup = (label) => {
        setOpenGroups(prev =>
            prev.includes(label)
                ? prev.filter(g => g !== label)
                : [...prev, label]
        );
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/clients', label: 'Customers', icon: Users },
        { path: '/package-menu', label: 'Package', icon: Package },
        { path: '/devices', label: 'Router [NAS]', icon: Server },
        {
            label: 'Infrastructure',
            icon: Network,
            children: [
                { path: '/infrastructure/odp-pop', label: 'ODP | POP', icon: Box },
                { path: '/infrastructure/map', label: 'Map View', icon: Map }
            ]
        },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#f4f6f9] flex font-sans">
            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:static inset-y-0 left-0 z-50 w-[250px] bg-[#343a40] text-white transition-transform duration-300 ease-in-out flex flex-col shadow-xl",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Brand Logo */}
                <div className="h-[57px] flex items-center px-4 border-b border-gray-600 bg-[#343a40]">
                    <Activity className="text-blue-400 mr-3" size={24} />
                    <span className="font-light text-xl tracking-wide">NOC<span className="font-bold">SYS</span></span>
                </div>

                {/* User Panel */}
                <div className="p-4 border-b border-gray-600">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                            {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.username || 'Administrator'}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <p className="text-xs text-gray-400">Online</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Main Navigation
                    </div>
                    {navItems.map((item) => (
                        item.children ? (
                            <SidebarGroup
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                                isOpen={openGroups.includes(item.label)}
                                onToggle={() => toggleGroup(item.label)}
                                active={item.children.some(child => location.pathname === child.path)}
                            >
                                {item.children.map(child => (
                                    <Link
                                        key={child.path}
                                        to={child.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-2 pl-10 text-sm transition-colors",
                                            location.pathname === child.path
                                                ? "text-white bg-white/5"
                                                : "text-gray-400 hover:text-white"
                                        )}
                                    >
                                        <child.icon size={16} />
                                        <span>{child.label}</span>
                                    </Link>
                                ))}
                            </SidebarGroup>
                        ) : (
                            <SidebarItem
                                key={item.path}
                                to={item.path}
                                icon={item.icon}
                                label={item.label}
                                active={location.pathname === item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                        )
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-600 bg-[#343a40]">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors shadow-sm"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Navbar */}
                <header className="h-[57px] bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded lg:hidden"
                        >
                            <Menu size={20} />
                        </button>
                        <button className="hidden lg:block p-2 text-gray-500 hover:bg-gray-100 rounded">
                            <Menu size={20} />
                        </button>
                        <div className="hidden md:flex items-center gap-4 text-sm text-gray-500">
                            <Link to="/" className="hover:text-blue-600">Home</Link>
                            <Link to="/clients" className="hover:text-blue-600">Clients</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative hidden sm:block">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-gray-100 border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 w-48 transition-all"
                            />
                            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <button className="p-2 text-gray-500 hover:text-blue-600 relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-3 px-6 text-sm text-gray-500 flex justify-between items-center">
                    <div>
                        <strong>Copyright &copy; 2025 <a href="#" className="text-blue-600 hover:underline">NOC System</a>.</strong> All rights reserved.
                    </div>
                    <div className="hidden sm:block">
                        <b>Version</b> 1.0.0
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default MainLayout;