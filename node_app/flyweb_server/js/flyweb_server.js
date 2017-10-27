let FW = (function() {

	let mimeTypes = {
		css: "text/css",
		js: "application/javascript",
		jpg: "image/jpeg"
	};

	let initialHtml;
	let href = window.location.href;

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

	function onWebsocket(event) {
		let ws = event.accept();
		trigger("websocket.open", { ws: ws });
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

	function isFlywebClient() {
		// Hack: FlyWeb URLs have 4 dashes
		let numberOfDashes = (href.match(/-/g) || []).length;
		return numberOfDashes === 4;
	}

	$(document).ready(function() {
		initialHtml = $('html').html();
	});

	return {
		becomeFlywebServer: becomeFlywebServer,
		isFlywebClient: isFlywebClient,
		bind: bind
	};

}());