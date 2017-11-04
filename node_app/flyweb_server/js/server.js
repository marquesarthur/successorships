let S = (function() {

	let mimeTypes = {
		css: "text/css",
		js: "application/javascript",
		jpg: "image/jpeg"
	};

	let initialHtml;

	let state = {
		successors: []
	};

	let wss = [];

	let listeners = {};

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

	function createOptions(mimeType) {
		return {
			headers: { 'Content-Type': mimeType }
		};
	}

	function onFetch(event) {
		let url = event.request.url;
		if (url !== "/") {
			let filename = url.split("/").pop();
			let fileExtension = filename.split(".").pop();
			let mimeType = mimeTypes[fileExtension];
			let options = createOptions(mimeType);
			fetch(url)
				.then(response => response.blob())
				.then(blob => event.respondWith(new Response(blob, createOptions(mimeType))));
		} else {
			let options = createOptions("text/html");
			event.respondWith(new Response(initialHtml, options));
		}
	}

	function broadcastState(exceptWs) {
		for (let ws of wss) {
			if (ws !== exceptWs) {
				ws.send(JSON.stringify({name: "stateupdate",body:{state: state}}));
			}
		}
	}

	function onWebsocket(event) {
		let ws = event.accept();

		console.log("SERVER: INITIAL");

		ws.onopen = function(event2) {
			console.log("SERVER: OPEN");
			let clientId = new Date().getTime();
			this.clientId = clientId;
			wss.push(ws);
			state.successors.push(clientId);
			trigger('stateupdate', {state: state});
			broadcastState(this);
			this.send(JSON.stringify({name: "welcome",body:{clientId: clientId, state: state}}));
		};
		ws.onmessage = function(event2) {
			console.log("SERVER: MESSAGE");
		};
		ws.onclose = function(event2) {
			if (this.clientId) {
				let index = state.successors.indexOf(this.clientId);
				if (index >= 0) {
					state.successors.splice(index, 1);
					trigger('stateupdate', {state: state});
					broadcastState(this);
				}
			}

		};
		ws.onerror = function(event2) {
			console.log("SERVER: ERROR");
		};
	}

	function becomeFlywebServer(name) {
		navigator.publishServer(name).then(function(server) {
			server.onfetch = onFetch;
			server.onwebsocket = onWebsocket;
			server.onclose = function(evt) {
				console.log("CLOSE");
			};
		}).catch(function(err) {
			console.log("CATCH: " + errs);
		});
	}

	$(document).ready(function() {
		initialHtml = '<html data-flyweb-role="client">'+$('html').html()+'</html>';
	});

	return {
		becomeFlywebServer: becomeFlywebServer,
		bind: bind
	};

}());