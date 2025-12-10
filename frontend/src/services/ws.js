// frontend/src/services/ws.js
// Simple modular WebSocket client for hybrid status update
let ws;
let listeners = [];

export function connectWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) return;
    const url = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.hostname + ':6001';
    ws = new window.WebSocket(url);
    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'status-update') {
                listeners.forEach(fn => fn(msg.data));
            }
        } catch { }
    };
    ws.onclose = () => {
        setTimeout(connectWebSocket, 5000); // Auto-reconnect
    };
}

export function onStatusUpdate(fn) {
    listeners.push(fn);
}

export function disconnectWebSocket() {
    if (ws) ws.close();
    ws = null;
}
