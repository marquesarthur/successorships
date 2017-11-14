let C = (function() {

	let clientId;

	let state = {
		successors: []
	};

	function updateUi() {
		$('#clientid').text(clientId);
		$('#successors').text(JSON.stringify(state.successors));
	}

	function isFlywebClient() {
		return $('html').attr('data-flyweb-role') === 'client';
	}

	function becomeFlywebClient(wsUrl) {
		let ws = new WebSocket(wsUrl);

		ws.addEventListener("open", function(e) {
			console.log("CLIENT: OPEN");
		});

		ws.addEventListener("message", function(e) {
			console.log("CLIENT: MESSAGE");
			let data = JSON.parse(e.data);
			if (data.name === "welcome") {
				clientId = data.body.clientId;
				Object.assign(state, data.body.state);
				updateUi();
			} else if (data.name === "stateupdate") {
				Object.assign(state, data.body.state);
				updateUi();
			}
		});

		ws.addEventListener("close", function(e) {
			if (state.successors[0] === clientId) {
				console.log("CLOSE: BECOME NEW SERVER");
				// setTimeout(function() {
				// 	S.becomeFlywebServer("b");
				// 	S.bind("stateupdate", function(data) {
				// 		Object.assign(state, data.state);
				// 		updateUi();
				// 	});
				// }, 10000);
			} else {
				console.log("CLOSE: WAIT FOR NEW SERVER");
				// setTimeout(function() {
				// 	navigator.discoverNearbyServices({
				// 		name: "b"
				// 	}).then(function(service) {
				// 		console.log(service);
				// 	}).catch(function(err) {
				// 		console.log("ERROR");
				// 	})
				// }, 20000);
			}
		});

		ws.addEventListener("error", function(e) {
			console.log("CLIENT: ERROR");
		});
	}

	if (isFlywebClient()) {
		becomeFlywebClient("ws://" + window.location.hostname + ":" + window.location.port);
	} else {
		clientId = 0;
		S.becomeFlywebServer("a", state);
		S.bind("stateupdate", function(data) {
			Object.assign(state, data.state);
			updateUi();
		});
	}

	$(document).ready(function() {
		updateUi();
	});

	return {
		becomeFlywebClient: becomeFlywebClient,
		becomeFlywebServer: function() {
			S.becomeFlywebServer("a", state);
		},
		getClientId: function() {
			return clientId;
		}
	};

}());