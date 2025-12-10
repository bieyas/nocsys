import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Devices from './pages/Devices';
import Settings from './pages/Settings';
import Login from './pages/Login';
import OdpPop from './pages/OdpPop';
import MapComponent from './pages/Map';
import Packages from './pages/Packages';
import PackageTabs from './pages/PackageTabs';
import SyncMikrotik from './pages/SyncMikrotik';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="devices" element={<Devices />} />
              <Route path="infrastructure/odp-pop" element={<OdpPop />} />
              <Route path="infrastructure/map" element={<MapComponent />} />
              <Route path="settings" element={<Settings />} />
              <Route path="packages" element={<Packages />} />
              <Route path="package-menu" element={<PackageTabs />} />
              <Route path="packages/sync-mikrotik" element={<SyncMikrotik />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
} export default App;
