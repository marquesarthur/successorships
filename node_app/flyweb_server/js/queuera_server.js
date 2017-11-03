let QUES = (function() {

	let wss = [];

	let wsToSelfEstablished = false;

	let listeners = {};

	let state = {
		timestamp: new Date().getTime(),
		queue: [],
		successors: []
	};

	function trigger(eventName, data) {
		if (listeners[eventName]) {
			for (let listener of listeners[eventName]) {
				listener(data);
			}
		}
	}

	function bind(eventName, callback) {
		if (!listeners[eventName]) {
			listeners[eventName] = [];
		}
		listeners[eventName].push(callback);
	}

	function send(ws, name, body) {
		let payload = {
			name: name,
			body: body
		};
		console.log(ws);
		ws.send(JSON.stringify(payload));
	}

	function broadcastState() {
		for (let ws of wss) {
			send(ws, "stateupdate", state);
		}
	}

	let routeMethods = {
		'handshake.client': function(data) {
			let clientId = new Date().getTime();
			state.successors.push(clientId);
			trigger("handshake.client", data);
			broadcastState();
		},
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

	FW.bind("websocket.open", function(e) {
		let ws = e.ws;
		console.log("Server: OPEN");

		wss.push(ws);

		ws.onmessage = function(e) {
			console.log("Server: MESSAGE");

			let payload = JSON.parse(e.data);
			let routeMethod = routeMethods[payload.name];
			routeMethod && routeMethod(payload.body);

			console.log(payload);
		};

		ws.onclose = function(json) {
			console.log("Server: CLOSE");
		};

		send(ws, "handshake.server");
	});

	return {
		bind: bind,
		getState: function() {
			return state;
		}
	}

}());