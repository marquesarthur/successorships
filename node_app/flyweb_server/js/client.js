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
		ws.onopen = function(e) {
			console.log("CLIENT OPEN");
		};
		ws.onmessage = function(e) {
			let data = JSON.parse(e.data);
			if (data.name === "welcome") {
				clientId = data.body.clientId;
				Object.assign(state, data.body.state);
				updateUi();
			} else if (data.name === "stateupdate") {
				Object.assign(state, data.body.state);
				updateUi();
			}

			console.log("CLIENT MESSAGE");
		};
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