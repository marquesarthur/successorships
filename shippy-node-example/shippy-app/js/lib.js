let Lib = (function() {

	let connectionOverheadRoutes = {};

	function registerOverheadRoutes (routes) {
		for (route in routes) {
			connectionOverheadRoutes[route] = routes[route];
		}
	}

    function wsOverhead(message) {
        let isConnectionOverhead = message.route in connectionOverheadRoutes;
        if (isConnectionOverhead) {
            connectionOverheadRoutes[message.route](message.body);
        }
        return isConnectionOverhead;
    }

	function wsSend(ws, route, body) {
		ws.send(JSON.stringify({
			route: route,
			body: body
		}));
	}

	function wsReceive(event) {
		return JSON.parse(event.data);
	}

	function log(msg, argument) {
		console.log(msg);
		if (argument) {
			console.log(argument);
		}
	}

	function err(msg, argument) {
		console.err(msg);
		if (argument) {
			console.err(argument);
		}
	}

	return {
		wsSend: wsSend,
		wsReceive: wsReceive,
		wsOverhead: wsOverhead,
		log: log,
		err: err,
        registerOverheadRoutes: registerOverheadRoutes
	};

}());