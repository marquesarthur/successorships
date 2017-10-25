let WSAPI = (function() {

	let ws;

	function init(url) {
		ws = new WebSocket(url);
	}

	function send(name, body, callback) {
		let payload = {
			name: name,
			body: body
		};
		let json = JSON.stringify(payload);
		ws.send(json, callback);
	}

	function on(name, listener) {
		ws.addEventListener(name, listener);
	}

	return {
		init: init,
		on: on,
		send: send
	};

}());