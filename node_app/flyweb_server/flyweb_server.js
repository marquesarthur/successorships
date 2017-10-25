(function() {

	let indexHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Queuera</title>
    <link rel="stylesheet" type="text/css" href="css/queuera.css">
    <script src="js/handlebars.js"></script>
    <script src="js/jquery.js"></script>
    <script src="js/wsapi.js"></script>
</head>

<body>

    <div id="main">
    	<img src="jpg/biergarten.jpg">
	</div>

    <script src="js/queuera.js"></script>
</body>
</html>
`;

	let mimeTypes = {
		css: "text/css",
		js: "application/javascript",
		jpg: "image/jpeg"
	};

	function createOptions(mimeType) {
		return {
			headers: { 'Content-Type': mimeType }
		};
	}

	navigator.publishServer("FlyWeb Queuera").then(function(server) {
		server.onfetch = function(event) {
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
				event.respondWith(new Response(indexHtml, options));
			}


		};
		server.onwebsocket = function(evt) {
			console.log("WEBSOCKET");
		};
		server.onclose = function(evt) {
			console.log("CLOSE");
		};
	}).catch(function(err) {
		console.log("CATCH: " + errs);
	})


}());