Shippy.Util = (function() {

	function wsSend(ws, route, body) {
		ws.send(JSON.stringify({
			route: route,
			body: body
		}));
	}

	function payloadSize(data) {
		let str = JSON.stringify(data);
		let m = encodeURIComponent(str).match(/%[89ABab]/g);
		return str.length + (m ? m.length : 0);
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

	return {
		wsSend: wsSend,
		wsReceive: wsReceive,
		log: log,
		payloadSize: payloadSize
	};

}());