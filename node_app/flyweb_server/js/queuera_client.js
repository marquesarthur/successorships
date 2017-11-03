let QUEC = (function() {

	let wsToSelfEstablished = false;
	let clientId;

	let state = {
		timestamp: 0,
		queue: [],
		successors: []
	};

	let config = {
		username: null
	};

	function updateState(newState) {
		if (newState.timestamp > state.timestamp) {
			Object.assign(state, newState);
			console.log("New state was assigned");
			console.log(state);
			updateUi();
		}
	}

	function updateUi() {
		$('#name').text(config.username);
		$('#queue').text(JSON.stringify(state.queue));
		$('#successors').text(JSON.stringify(state.successors));
	}

	let routeMethods = {
		stateupdate: function(body) {
			console.log("Client.routeMethod stateupdate => body: "+JSON.stringify(body));
			updateState(body);
			updateUi();
		},
		'handshake.server': function(body) {
			clientId = body.clientId;
			console.log("Client: handshake.server => body: "+JSON.stringify(body));
		}
	};

	function init() {
		WSAPI.on('message', function(evt) {
			console.log("MESSAGE");
			console.log(evt);
			let payload = JSON.parse(evt.data);
			let routeMethod = routeMethods[payload.name];
			routeMethod && routeMethod(payload.body);
		});

		WSAPI.on('open', function(evt) {
			console.log("Client: OPEN");
			WSAPI.send("handshake.client", {hostname: window.location.hostname}, function(response) {
				//
			});
		});

		WSAPI.on('close', function(evt) {
			console.log("Client: CLOSE");
			//updateState(state, evt.data.state);
		});

		$('#add').click(function(e) {
			e.preventDefault();
			WSAPI.send("add", config.username, function(response) {
				console.log(response);
			});
		});

		$('#remove').click(function(e) {
			e.preventDefault();
			WSAPI.send("remove", config.username, function(response) {
				console.log(response);
			});
		});

		$('#pop').click(function(e) {
			e.preventDefault();
			WSAPI.send("pop", null, function(response) {
				console.log(response);
			});
		});
	}

	if (!FW.isFlywebClient()) {
		FW.becomeFlywebServer("FlyWeb Server 1");
		QUES.bind("handshake.client", function(data) {
			if (!wsToSelfEstablished && data.hostname != window.location.hostname) {
				WSAPI.init("ws://" + data.hostname);
				init();
			}
		});
	}

	if (FW.isFlywebClient()) {
		WSAPI.init("ws://" + window.location.hostname);
		init();
	}

	$(document).ready(function() {
		config.username = prompt("Please enter your name");
		updateUi();
	});

	return {
		getClientId: function() {
			return clientId;
		}
	};

}());