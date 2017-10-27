(function() {

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
		}
	}

	function updateUi() {
		$('#queue').html(JSON.stringify(state.queue));
	}

	function init() {
		WSAPI.on('message', function(evt) {
			console.log("MESSAGE");
			let payload = JSON.parse(evt.data);
			if (payload.name === "stateupdate") {
				let newState = payload.body;
				updateState(newState);
			}
		});

		WSAPI.on('open', function(evt) {
			console.log("Client: OPEN");
			//updateState(state, evt.data.state);
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
		FW.becomeFlywebServer("Initial FlyWeb Server");
	}

	if (FW.isFlywebClient()) {
		WSAPI.init("ws://" + window.location.hostname);
		init();
	}

	$(document).ready(function() {
		config.username = prompt("Please enter your name");
		$('#name').text(config.username);
		$('#queue').text(JSON.stringify(state.queue));
	});



}());