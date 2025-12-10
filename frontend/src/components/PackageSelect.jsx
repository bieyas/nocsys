import React, { useEffect, useState } from 'react';
import { getPackages } from '../services/packageApi';

const PackageSelect = ({ value, onChange }) => {
    const [packages, setPackages] = useState([]);

    useEffect(() => {
        getPackages().then(res => setPackages(res.data.data));
    }, []);

    return (
        <select name="package_id" value={value || ''} onChange={onChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors">
            <option value="">Pilih Paket Langganan</option>
            {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.bandwidth}) - Rp{pkg.price}
                </option>
            ))}
        </select>
    );
};

export default PackageSelect;
