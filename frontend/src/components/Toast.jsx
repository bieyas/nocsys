import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            onClose && onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const bgColor =
        type === 'success' ? 'bg-green-600' :
            type === 'error' ? 'bg-red-600' :
                type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-600';

    return (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${bgColor} animate-fade-in`}
            role="alert"
        >
            {message}
            <button
                onClick={onClose}
                className="ml-4 text-white hover:text-gray-200 font-bold"
                aria-label="Close"
            >
                &times;
            </button>
        </div>
    );
};

export default Toast;
