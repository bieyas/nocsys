// backend/websocket/server.js
// Modular WebSocket server for client status push
const http = require('http');
const WebSocket = require('ws');

let wss;

function startWebSocketServer(server) {
    wss = new WebSocket.Server({ server });
    wss.on('connection', (ws) => {
        ws.on('message', (msg) => {
            // Optionally handle messages from client
        });
    });
}

function broadcastStatusUpdate(data) {
    if (!wss) return;
    const msg = JSON.stringify({ type: 'status-update', data });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

module.exports = { startWebSocketServer, broadcastStatusUpdate };