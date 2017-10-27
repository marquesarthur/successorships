let FW = (function() {

	let mimeTypes = {
		css: "text/css",
		js: "application/javascript",
		jpg: "image/jpeg"
	};

	let initialHtml = "<!DOCTYPE html>" + document.documentElement.innerHTML;
	let href = window.location.href;

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

	function becomeFlywebServer() {
		navigator.publishServer("FlyWeb Queuera").then(function(server) {
			server.onfetch = onFetch;
			server.onwebsocket = function(evt) {
				console.log("WEBSOCKET");
			};
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

	if (!isFlywebClient()) {
		becomeFlywebServer();
	}

	return {
		becomeFlywebServer: becomeFlywebServer
	};

}());