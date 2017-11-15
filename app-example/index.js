const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const serveStatic = require('serve-static');
const mdns = require('mdns');

const app = express();
const port = 3000;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(serveStatic('shippy_app', {
	index: ['index.html']
}));

server.listen(port, function listening() {
	console.log('Listening on %d', server.address().port);
});