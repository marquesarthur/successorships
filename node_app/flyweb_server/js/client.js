let CLIENT = (function() {

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

	if (isFlywebClient()) {
		let ws = new WebSocket("ws://" + window.location.hostname);

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
			console.log("CLIENT: CLOSE");
		});

		ws.addEventListener("error", function(e) {
			console.log("CLIENT: ERROR");
		});

	} else {
		S.becomeFlywebServer("FlyWeb WS-SIMPLE");
		clientId = 0;
		S.bind("stateupdate", function(data) {
			Object.assign(state, data.state);
			updateUi();
		});
	}

	$(document).ready(function() {
		updateUi();
	});

	return {
		getClientId: function() {
			return clientId;
		}
	};

}());