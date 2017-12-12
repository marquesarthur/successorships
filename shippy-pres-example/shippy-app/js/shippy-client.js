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
			Shippy.Util.log("Client route 'welcome' called", body);
			Shippy.internal.clientId(body.clientId);
			if (Shippy.internal.serving()) {
				// If we have the double role, we should tell the server such that he removes us from the
				// succ list.
				Shippy.Util.wsSend(ws, "_revealdoublerole", {clientId: body.clientId});
			}
			Shippy.internal.trigger("clientid", { serving: Shippy.internal.serving(), clientId: body.clientId });
		},
		// The state was updated. If we don't have the double role we need to tell Shippy to update it's state.
		stateupdate: function(body) {
			Shippy.Util.log("Client route 'stateupdate' called", body);

			if (!Shippy.internal.serving()) {
				updateState(body);
			}
			Shippy.internal.trigger("stateupdate", Shippy.internal.state());
		}
	};

    function isServerAhead(body) {
        let currentVersion = Shippy.internal.version();
        let serverVersion = body.version || body.state.version;

        return currentVersion <= serverVersion;
    }

    // it will check whether the server has a state newer then the client
    // If it does, it will apply the state update function
    // Otherwise, it will send a _mostuptodate message back to the server
    function updateState(body) {
    	let currentState = Shippy.internal.state();
        if (isServerAhead(body)){
        	if (body.state) {
		        Shippy.internal.state(body.state);
	        } else if (typeof body.version === 'number' && body.payload && body.route && routes[body.route]) {
		        routes[body.route](currentState, body.payload);
		        Shippy.internal.updateVersion(body.version);
	        } else {
        		Shippy.Util.log("Error in updateState", body);
	        }
        } else {
            Shippy.Util.wsSend(ws, "_mostuptodate", {state: currentState});
        }
    }

    // Become a Shippy client. When this is called there must be already a current Flyweb service available
    // and its URL will be used for the WS connection.
    function becomeClient() {
        // Mount the routes for the app operations onto our WS routes.
        // This is necessary in the client because state updates may carry operations rather than the entire state
        routes = Object.assign(routes, Shippy.internal.appSpec().operations);
		Shippy.Util.log("BECOME CLIENT");
        ws = new WebSocket("ws://" + Shippy.internal.currentFlywebService().serviceUrl);

        // Tell shippy that we are now connected.
        ws.addEventListener("open", function(e) {
            Shippy.Util.log("CLIENT: OPEN");
            Shippy.internal.connected(true);
        });

        // Delegate a received message to the associated route.
        ws.addEventListener("message", function(e) {
            Shippy.Util.log("CLIENT: MESSAGE");
            let data = Shippy.Util.wsReceive(e);
            routes[data.route] && routes[data.route](data.body);
        });

        // Tell shippy that we are now disconnected.
        ws.addEventListener("close", function(e) {
            Shippy.Util.log("CLIENT: CLOSE");
            Shippy.internal.connected(false);
        });

        // Don't really know what to do here
        ws.addEventListener("error", function(e) {
            Shippy.Util.log("CLIENT: ERROR");
        });
    }

    // We as client are responsible for calling the app operations. Essentially this will become
    // messages on our WS connection. Then on the server, the associated operations will be called with the
    // current state and the params below as arguments.
    function call(operationName, params) {
        Shippy.Util.wsSend(ws, operationName, params);
    }

    // Interface exposed as Shippy.Client
    return {
        becomeClient: becomeClient,
        call: call
    };

}());