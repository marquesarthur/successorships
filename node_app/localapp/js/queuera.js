(function() {

	WSAPI.init("ws://localhost:3000");

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
			$('#queue').html(JSON.stringify(state.queue));
		}
	}

	function init() {
		WSAPI.on('message', function(evt) {
			let payload = JSON.parse(evt.data);
			if (payload.name === "stateupdate") {
				let newState = payload.body;
				updateState(newState);
			}
		});

		WSAPI.on('open', function(evt) {
			console.log(evt);
			//updateState(state, evt.data.state);
		});

		WSAPI.on('close', function(evt) {
			console.log("CLOSE");
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

	config.username = prompt("Please enter your name");
	if (config.username) {
		$('#name').text(config.username);
		init();
	} else {
		alert("Doesn't work without name");
		$('body').hide();
	}

}());