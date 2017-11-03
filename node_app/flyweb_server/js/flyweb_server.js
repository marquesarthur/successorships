let FW = (function() {

	let mimeTypes = {
		css: "text/css",
		js: "application/javascript",
		jpg: "image/jpeg"
	};

	let initialHtml;
	let href = window.location.href;

	let listeners = {};

	let flywebHostname;

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

	function onWebsocketOpen(initialEvent) {
		let ws = initialEvent.accept();
		ws.onopen = function(event) {
			trigger("websocket.open", { ws: ws });
		};
		ws.onmessage = function(event) {
			trigger("websocket.message", { ws: ws });
		};
		ws.onclose = function(event) {
			trigger("websocket.close", { ws: ws });
		};
		ws.onerror = function(event) {
			trigger("websocket.error", { ws: ws });
		};
	}

	function becomeFlywebServer(name) {
		navigator.publishServer(name).then(function(server) {
			server.onfetch = onFetch;
			server.onwebsocket = onWebsocketOpen;
			server.onclose = function(evt) {
				console.log("CLOSE");
			};
		}).catch(function(err) {
			console.log("CATCH: " + errs);
		});
	}

	function isFlywebClient() {
		return $('html').attr('data-flyweb-role') === 'client';
	}

	$(document).ready(function() {
		initialHtml = '<html data-flyweb-role="client">'+$('html').html()+'</html>';
	});

	return {
		becomeFlywebServer: becomeFlywebServer,
		isFlywebClient: isFlywebClient,
		bind: bind
	};

}());