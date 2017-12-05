Shippy.Util = (function() {

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

	// See https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
	function dataURItoBlob(dataURI) {
		let byteString = atob(dataURI.split(',')[1]);
		let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
		let ab = new ArrayBuffer(byteString.length);
		let ia = new Uint8Array(ab);
		for (let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		return new Blob([ab], {type: mimeString});
	}

	return {
		wsSend: wsSend,
		wsReceive: wsReceive,
		log: log,
		dataURItoBlob: dataURItoBlob
	};

}());