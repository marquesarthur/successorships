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
const advertisement = mdns.createAdvertisement(mdns.tcp('flyweb'), port, {
	name: 'Queuera'
});

let state = {
	timestamp: new Date().getTime(),
	queue: [],
	successors: []
};

app.use(serveStatic('localapp', {
	index: ['index.html', 'index.htm']
}));

wss.on('connection', function(ws, req) {

	function sendStateUpdate(connection) {
		let payload = {
			name: "stateupdate",
			body: state
		};
		console.log(connection);
		connection.send(JSON.stringify(payload));
	}

	function broadcastState() {
		wss.clients.forEach(function(client) {
			if (client.readyState === WebSocket.OPEN) {
				console.log("HALLO");
				sendStateUpdate(client);
			}
		});
	}

	let queueMethods = {
		add: function(name) {
			if (state.queue.indexOf(name) < 0) {
				state.queue.push(name);
				state.timestamp = new Date().getTime();
				broadcastState();
			}
		},
		remove: function(name) {
			let index = state.queue.indexOf(name);
			if (index >= 0) {
				state.queue.splice(index, 1);
				state.timestamp = new Date().getTime();
				broadcastState();
			}
		},
		pop: function() {
			if (state.queue.length) {
				state.queue.shift();
				state.timestamp = new Date().getTime();
				broadcastState();
			}
		}
	};

	console.log("CONNECT");

	sendStateUpdate(ws);

	ws.on('message', function(json) {
		let payload = JSON.parse(json);
		let methodToCall = queueMethods[payload.name];
		methodToCall && methodToCall(payload.body);

		console.log('MESSAGE');
		console.log(payload);
	});

});

server.listen(port, function listening() {
	advertisement.start();
	console.log('Listening on %d', server.address().port);
});