Shippy.Client = (function() {

	let ws;

	let routes = {
		welcome: function(body) {
			Lib.log("Client route 'welcome' called", body);
			Shippy.internal.clientId(body.clientId);
		},
		stateupdate: function(body) {
			Lib.log("Client route 'stateupdate' called", body);
			Shippy.internal.trigger("stateupdate", body.state);
		}
	};

	function becomeClient() {
		ws = new WebSocket("ws://" + Shippy.internal.currentFlywebService().serviceUrl);

		ws.addEventListener("open", function(e) {
			console.log("CLIENT: OPEN");
			Shippy.internal.connected(true);
		});

		ws.addEventListener("message", function(e) {
			console.log("CLIENT: MESSAGE");
			let data = Lib.wsReceive(e);
			routes[data.route] && routes[data.route](data.body);
		});

		ws.addEventListener("close", function(e) {
			console.log("CLIENT: CLOSE");
			Shippy.internal.connected(false);
		});

		ws.addEventListener("error", function(e) {
			console.log("CLIENT: ERROR");
		});
	}

	function call(operationName, params) {
		Lib.wsSend(ws, operationName, params);
	}

	return {
		becomeClient: becomeClient,
		call: call
	};

}());