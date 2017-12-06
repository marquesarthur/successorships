Shippy.Util = (function () {

	const payloadLength = [1, 4, 16, 64, 256, 1024, 4096, 1, 4, 16, 64, 256,
		1024, 4096, 1, 4, 16, 64, 256, 1024, 4096, 16384, 65536, 262144,
		1048576, 1, 4, 16, 64, 256, 1, 4, 16, 64, 256, 1024, 1, 4, 16, 64, 256,
		1, 4, 16, 64, 256, 1024, 1, 4, 16, 64, 256, 1024, 4096, 16384, 65536, 262144,
		1048576, 1, 4, 16, 64, 256, 1, 1, 4, 16, 64, 256, 1024, 1, 4, 16, 64, 256,
		4, 16, 64, 256, 1048576, 4194304, 16777216, 67108864, 1, 4, 16, 64,
		256, 1024, 4096, 16384, 65536, 262144,
		1024, 4096, 16384, 65536];

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

	// https://stackoverflow.com/questions/35786857/generate-random-string-with-a-specific-sign-in-it-using-js
	function stringGen(len) {
		let text = "";
		let charset = "abcdefghijklmnopqrstuvwxyz0123456789";

		for (let i = 0; i < len; i++) {
			text += charset.charAt(Math.floor(Math.random() * charset.length));
		}

		return text;
	}

	function randomPayload() {
		let strLength = payloadLength[Math.floor(Math.random() * payloadLength.length)];
		return stringGen(strLength);

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
		payloadSize: payloadSize,
		randomPayload: randomPayload
	};

}());