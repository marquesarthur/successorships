(function() {

	var indexHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Queuera</title>
    <link rel="stylesheet" type="text/css" href="css/queuera.css">
    <script src="js/jquery.js"></script>
    <script src="js/wsapi.js"></script>
</head>

<body>

    <div id="main">
        <div>
            <span>Hello </span><span id="name"></span><span>!</span>
        </div>
        <div>
            <span>Queue: </span><span id="queue"></span>
        </div>
        <div>
            <span>Student: </span>
            <a id="add" href="#">Add me!</a>
            <a id="remove" href="#">Remove me!</a>
        </div>
        <div>
            <span>TA: </span>
            <a id="pop" href="#">Pop</a>
        </div>
        
        <img src="jpg/squirrel.jpg">
    </div>

    <script src="js/queuera.js"></script>
</body>
</html>
`;

	var mimeTypes = {
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
			var url = event.request.url;
			if (url !== "/") {
				var filename = url.split("/").pop();
				var fileExtension = filename.split(".").pop();
				var mimeType = mimeTypes[fileExtension];
				var options = createOptions(mimeType);
				fetch(url)
					.then(response => response.blob())
					.then(blob => event.respondWith(new Response(blob, createOptions(mimeType))));
			} else {
				var options = createOptions("text/html");
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