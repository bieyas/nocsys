/**
 * Main Application Entry Point
 * @module index
 */

const app = require('./app');
const http = require('http');
const { startWebSocketServer } = require('../websocket/server');
const PORT = process.env.PORT || 6001;

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startWebSocketServer(server);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
