import api from './api';

export const getPackages = () => api.get('/packages');
export const getPackage = (id) => api.get(`/packages/${id}`);
export const createPackage = (data) => api.post('/packages', data);
export const updatePackage = (id, data) => api.put(`/packages/${id}`, data);
export const deletePackage = (id) => api.delete(`/packages/${id}`);

export const updateClientPackage = (clientId, packageId) =>
    api.put(`/pppoe-clients/${clientId}/package`, { package_id: packageId });
