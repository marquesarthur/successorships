(function() {

	let wss = [];

	let state = {
		timestamp: new Date().getTime(),
		queue: [],
		successors: []
	};

	function sendStateUpdate(ws) {
		let payload = {
			name: "stateupdate",
			body: state
		};
		console.log(ws);
		ws.send(JSON.stringify(payload));
	}

	function broadcastState() {
		for (let ws of wss) {
			sendStateUpdate(ws);
		}
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

	FW.bind("websocket.open", function(e) {
		let ws = e.ws;
		console.log("Server: OPEN");

		wss.push(ws);

		ws.onmessage = function(e) {
			console.log("Server: MESSAGE");

			let payload = JSON.parse(e.data);
			let methodToCall = queueMethods[payload.name];
			methodToCall && methodToCall(payload.body);

			console.log(payload);
		};

		ws.onclose = function(json) {
			console.log("Server: CLOSE");
		};
	});

}());