import React, { useEffect, useState } from 'react';
import {
    getPackages,
    createPackage,
    updatePackage,
    deletePackage
} from '../services/packageApi';
import Toast from '../components/Toast';

const Packages = () => {
    const [packages, setPackages] = useState([]);
    const [form, setForm] = useState({ name: '', price: '', bandwidth: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const [toast, setToast] = useState({ message: '', type: 'info' });

    const fetchPackages = async () => {
        const res = await getPackages();
        setPackages(res.data.data);
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updatePackage(editingId, form);
                setToast({ message: 'Paket berhasil diupdate', type: 'success' });
            } else {
                await createPackage(form);
                setToast({ message: 'Paket berhasil ditambah', type: 'success' });
            }
            setForm({ name: '', price: '', bandwidth: '', description: '' });
            setEditingId(null);
            fetchPackages();
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Gagal simpan paket', type: 'error' });
        }
    };

    const handleEdit = (pkg) => {
        setForm(pkg);
        setEditingId(pkg.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus paket ini?')) return;
        try {
            await deletePackage(id);
            setToast({ message: 'Paket berhasil dihapus', type: 'success' });
            fetchPackages();
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Gagal hapus paket', type: 'error' });
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-xl font-bold mb-4">Manajemen Paket Langganan</h2>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <input name="name" value={form.name} onChange={handleChange} placeholder="Nama Paket" className="w-full border px-3 py-2 rounded" required />
                <input name="price" value={form.price} onChange={handleChange} placeholder="Harga" type="number" className="w-full border px-3 py-2 rounded" />
                <input name="bandwidth" value={form.bandwidth} onChange={handleChange} placeholder="Bandwidth" className="w-full border px-3 py-2 rounded" />
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Deskripsi" className="w-full border px-3 py-2 rounded" />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Tambah'} Paket</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', price: '', bandwidth: '', description: '' }); }} className="ml-2 px-4 py-2 rounded border">Batal</button>}
            </form>
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2">Nama</th>
                        <th className="p-2">Harga</th>
                        <th className="p-2">Bandwidth</th>
                        <th className="p-2">Deskripsi</th>
                        <th className="p-2">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {packages.map(pkg => (
                        <tr key={pkg.id}>
                            <td className="p-2">{pkg.name}</td>
                            <td className="p-2">{pkg.price}</td>
                            <td className="p-2">{pkg.bandwidth}</td>
                            <td className="p-2">{pkg.description}</td>
                            <td className="p-2">
                                <button onClick={() => handleEdit(pkg)} className="px-2 py-1 bg-yellow-400 rounded mr-2">Edit</button>
                                <button onClick={() => handleDelete(pkg.id)} className="px-2 py-1 bg-red-500 text-white rounded">Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
        </div>
    );
};

export default Packages;
