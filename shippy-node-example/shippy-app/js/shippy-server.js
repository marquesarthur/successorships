/**
 * Only Shippy server-specific logic
 */
Shippy.Server = (function() {

  // HTTP status code
	let OK = 200;

	let mimeTypes = {
		css: "text/css",
		js: "application/javascript",
		jpg: "image/jpeg"
	};

	// Dictionary of web socket connections in form clientId => websocket object
	let wss = {};

	// Routes for WS requests to our server. Routes beginning with _ are private Shippy-internal routes.
	// Other routes will be mounted on this object from the operations registered from the app. This happens
	// when we become the server.
	let routes = {
		// This route is called by the client that has both the server and the client role upon connect.
		// We don't want the client that is also the server in our successor list because when the server dies
		// this client dies too.
		_revealdoublerole: function(state, params) {
			Lib.log("Double role revealed: ", params.clientId);
			Shippy.internal.removeSuccessor(params.clientId);
			// Should we trigger a broadcast here? I think I will always be the first client when I reveal
			// myself but I'm not really sure.
		}
	};

	function createOptions(mimeType) {
		return {
			headers: { 'Content-Type': mimeType }
		};
	}

  // This function handles the special request events generated by the FlyWeb add-on
	function onRequest(requestEvent) {
        console.log("http server received request: ", requestEvent);
        
        var rawReq = requestEvent.requestRaw();

        // Not sure how necessary this asynchronousness is, but this is how the FlyWeb add-on does it
        var streamReader = new StreamReader(rawReq);
        streamReader.readHeader().then(reqinfo => {
            console.log("HEADER: ", reqinfo);
            // var method = reqinfo.method;
            var path = reqinfo.path;
            
            // Not sure if there's a better way of doing this, but this is how the FlyWeb add-on does it
            if (path === "/web/socket") {
                serveWebSocket(requestEvent, streamReader, reqinfo.headers);
            }
            // Signals we should serve the main page
            else if (path === "/") {
                serveMain(requestEvent);
            }
            // Pray that the file they're asking for can be located
            else {
            	serveFile(requestEvent, path);
			}
		})
			.catch((err) => {console.log(err);});
	}

	function serveMain(requestEvent) {
		Lib.log("SERVE MAIN PAGE");

		let options = createOptions("text/html");
        requestEvent.sendResponse(OK, options.headers, Shippy.internal.initialHtml()).then();
	}

	function serveFile(requestEvent, url) {
		console.log("Got request for " + url);
        let filename = url.split("/").pop();
        let fileExtension = filename.split(".").pop();
        let mimeType = mimeTypes[fileExtension];
        let options = createOptions(mimeType);
        fetch(url)
            .then(response => response.blob())
        	.then(blob => {
                var reader = new FileReader();
                reader.onload = function(readerEvent) {
                    // reader.result contains the contents of blob as a typed array
                    requestEvent.sendResponse(OK, options.headers, readerEvent.target.result);
                };
                reader.readAsText(blob);
            });
	}

    function serveWebSocket(requestEvent, instream, headers) {

        requestEvent.stream().then(outstream => {
            function onmessage(msg) {
                // Whenever the server receives a message it calls the associated route that's extracted from the payload.
                // The route will either be a mounted on from the app operations or a private _ one (e.g. _revealdoublerole).
                Lib.log("SERVER: MESSAGE");
                let data = Lib.wsReceive({data: msg});
                let currentState = Shippy.internal.state();
                routes[data.route] && routes[data.route](currentState, data.body);
                broadcastState();
            }
            function onerror(msg) {
                // When a client closed the connection we remove it from the succ list and broadcast the state.
                Lib.log("SERVER: ERROR");
                if (ws.clientId) {
                    delete wss[ws.clientId];
                    Shippy.internal.removeSuccessor(ws.clientId);
                    broadcastState();
                }
            }

            var ws = new ServerWebSocket({
                instream, outstream, headers, onmessage, onerror,
                stringMessage: true});
            // Not sure what this actually does, but it's in the FlyWeb add-on code
            window.SERVER_WS = ws;

            // Open is the event when a the connection for a client is opened.
            // Here we create the client ID and add the WS connection to our collection. Then we add the client ID to
            // our successor list (if this client has also the server role this id will be removed later when the
            // _revealdoublerole route is called from this client). We send a welcome message to the client containing
            // the clientId. We also broadcast the state because the contained successor list changed.
			Lib.log("SERVER: OPEN");
			let clientId = new Date().getTime();
			ws.clientId = clientId;
			wss[clientId] = ws;
			Shippy.internal.addSuccessor(clientId);
			Lib.wsSend(ws, "welcome", { clientId: clientId });
			broadcastState();
        });
    }

	// Run through all WS connections and send the state.
	function broadcastState() {
		for (let clientId in wss) {
			Lib.wsSend(wss[clientId], "stateupdate", { state: Shippy.internal.state() });
		}
	}

	function becomeServer() {
		// Mount the routes for the app operations onto our WS routes.
		routes = Object.assign(routes, Shippy.internal.appSpec().operations);
		Lib.log("BECOME SERVER");
		// Now REALLY become the server!
		navigator.publishServerAddOn(Shippy.internal.appName()).then(function(server) {
			Lib.log("New Server created for app:" + Shippy.internal.appName());
			Lib.log("Here's what that server looks like, before the shiny bells and whistles: ", server);
			// When we have a new server we want to start with a fresh succ list.
			Shippy.internal.clearSuccessors();
			// Indicate that we are now the serving node.
			Shippy.internal.serving(true);
			server.onrequest(onRequest);
			Lib.log(server);
		}).catch(function(err) {
			Lib.log("Error creating server", err);
		});


	}

	// Interface exposed as Shippy.Server
	return {
		becomeServer: becomeServer
	};

}());