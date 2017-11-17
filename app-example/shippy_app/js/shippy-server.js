Shippy.Server = (function() {

	let mimeTypes = {
		css: "text/css",
		js: "application/javascript",
		jpg: "image/jpeg"
	};

	let wss = [];

	let routes;

	function createOptions(mimeType) {
		return {
			headers: { 'Content-Type': mimeType }
		};
	}

	function onFetch(event) {
		Lib.log("ONFETCH");
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
			event.respondWith(new Response(Shippy.internal.initialHtml(), options));
		}
	}

	function broadcastState() {
		for (let ws of wss) {
			Lib.wsSend(ws, "stateupdate", { state: Shippy.internal.state() });
		}
	}

	function onWebsocket(event) {
		let ws = event.accept();

		console.log("SERVER: INITIAL");

		ws.addEventListener("open", function(e) {
			console.log("SERVER: OPEN");
			let clientId = new Date().getTime();
			ws.clientId = clientId;
			wss.push(ws);
			Shippy.internal.addSuccessor(clientId);
			Lib.wsSend(ws, "welcome", { clientId: clientId });
			broadcastState();
		});

		ws.addEventListener("message", function(e) {
			console.log("SERVER: MESSAGE");
			let data = Lib.wsReceive(e);
			let currentState = Shippy.internal.state();
			routes[data.route] && routes[data.route](currentState, data.body);
			broadcastState();
		});

		ws.addEventListener("close", function(e) {
			console.log("SERVER: CLOSE");
		});

		ws.addEventListener("error", function(e) {
			console.log("SERVER: ERROR");
		});

	}

	function onClose() {
		console.log("ON CLOSE");
	}

	function becomeServer() {
		routes = Shippy.internal.appSpec().operations;
		console.log("BECOME SERVER");
		navigator.publishServer(Shippy.internal.appName()).then(function(server) {
			Lib.log("New Server created for app:", Shippy.internal.appName());
			Shippy.internal.clearSuccessors();
			$('html').attr('data-flyweb-role', 'server');
			server.onfetch = onFetch;
			server.onwebsocket = onWebsocket;
			server.onclose = onClose;
			Lib.log(server);
		}).catch(function(err) {
			Lib.log("Error creating server", err);
		});
	}

	return {
		becomeServer: becomeServer
	};

}());