/**
 * Only Shippy client-specific logic
 */
Shippy.Client = (function() {

	// Our (single) WS connection.
	let ws;

	// Our routes for messages received from the server. These will be called from WS message events.
	let routes = {
		// The server accepted us and gave us a clientId. We want to save this so we will know when we should
		// become the next server depending on the succ list.
		welcome: function(body) {
			Lib.log("Client route 'welcome' called", body);
			Shippy.internal.clientId(body.clientId);
			if (Shippy.internal.serving()) {
				// If we have the double role, we should tell the server such that he removes us from the
				// succ list.
				Lib.wsSend(ws, "_revealdoublerole", {clientId: body.clientId});
			}
		},
		// The state was updated. If we don't have the double role we need to tell Shippy to update it's state.
		stateupdate: function(body) {
			Lib.log("Client route 'stateupdate' called", body);
			if (!Shippy.internal.serving()) {
				Shippy.internal.state(body.state);
			}
			Shippy.internal.trigger("stateupdate", body.state);
		}
	};

	// Become a Shippy client. When this is called there must be already a current Flyweb service available
	// and its URL will be used for the WS connection.
	function becomeClient() {
		console.log("BECOME CLIENT");
		let socketURL = "ws://" + Shippy.internal.currentFlywebService().serviceUrl + "/web/socket";
		console.log("Trying to connect to " + socketURL);
		ws = new WebSocket(socketURL);

		// Tell shippy that we are now connected.
		ws.addEventListener("open", function(e) {
			Lib.log("CLIENT: OPEN");
			Shippy.internal.connected(true);
		});

		// Delegate a received message to the associated route.
		ws.addEventListener("message", function(e) {
			Lib.log("CLIENT: MESSAGE");
			let data = Lib.wsReceive(e);
			routes[data.route] && routes[data.route](data.body);
		});

		// Tell shippy that we are now disconnected.
		ws.addEventListener("close", function(e) {
			Lib.log("CLIENT: CLOSE");
			Shippy.internal.connected(false);
		});

		// Don't really know what to do here
		ws.addEventListener("error", function(e) {
			Lib.log("CLIENT: ERROR");
			// Presumably the websocket connection can also be considered to be "closed" if it throws an error
      		Shippy.internal.connected(false);
		});
	}

	// We as client are responsible for calling the app operations. Essentially this will become
	// messages on our WS connection. Then on the server, the associated operations will be called with the
	// current state and the params below as arguments.
	function call(operationName, params) {
		Lib.wsSend(ws, operationName, params);
	}

    // Returns true if the web socket is open.
    // Mainly for debugging purposes
    function checkSocketStatus() {
		return ws.readyState === 1;
	}

	// Interface exposed as Shippy.Client
	return {
		becomeClient: becomeClient,
		call: call,
		checkSocketStatus: checkSocketStatus
	};

}());