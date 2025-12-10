import React, { useState } from 'react';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Settings = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/pppoe-clients/template', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'clients_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading template:', error);
            alert('Failed to download template');
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setImportResult(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setImportResult(null);

        try {
            const response = await api.post('/pppoe-clients/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setImportResult(response.data);
            setFile(null);
            // Reset file input
            document.getElementById('fileInput').value = '';
        } catch (error) {
            console.error('Error uploading file:', error);
            setImportResult({
                success: false,
                message: error.response?.data?.message || 'Upload failed'
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Settings</h1>
            <p className="text-gray-600 mb-8">System configuration and tools</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Import Clients Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Import Clients</h2>
                            <p className="text-sm text-gray-500">Bulk import clients from Excel</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Step 1: Download Template</h3>
                            <p className="text-xs text-gray-500 mb-3">
                                Download the Excel template to ensure your data is formatted correctly.
                                The template includes columns for username, password, service, and device name.
                            </p>
                            <button
                                onClick={handleDownloadTemplate}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm transition-colors"
                            >
                                <Download size={16} />
                                Download Template
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Step 2: Upload File</h3>
                            <p className="text-xs text-gray-500 mb-3">
                                Upload your filled Excel file here. Make sure the 'device_name' matches one of your configured devices.
                            </p>

                            <div className="flex gap-2">
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-lg file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-gray-200 file:text-gray-800
                                        hover:file:bg-gray-300
                                        cursor-pointer"
                                />
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} />
                                        Start Import
                                    </>
                                )}
                            </button>
                        </div>

                        {importResult && (
                            <div className={`p-4 rounded-lg border ${importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex items-start gap-3">
                                    {importResult.success ? (
                                        <CheckCircle className="text-green-600 shrink-0" size={20} />
                                    ) : (
                                        <AlertCircle className="text-red-600 shrink-0" size={20} />
                                    )}
                                    <div>
                                        <h4 className={`text-sm font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                            {importResult.message}
                                        </h4>
                                        {importResult.results && (
                                            <div className="mt-2 text-xs text-gray-600 space-y-1">
                                                <p>Success: {importResult.results.success}</p>
                                                <p>Failed: {importResult.results.failed}</p>
                                                {importResult.results.errors.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        <p className="font-medium mb-1">Errors:</p>
                                                        <ul className="list-disc list-inside space-y-1 text-red-600">
                                                            {importResult.results.errors.slice(0, 5).map((err, idx) => (
                                                                <li key={idx}>{err.username}: {err.error}</li>
                                                            ))}
                                                            {importResult.results.errors.length > 5 && (
                                                                <li>...and {importResult.results.errors.length - 5} more</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
