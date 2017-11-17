(function() {

	let myName;

	let appState;

	function updateUi(state) {
		$('#state').text(JSON.stringify(state));
	}

	let init = function(state) {
		state.queue = [];
		console.log("init called. State is now: " + JSON.stringify(state));
		updateUi(state);
	};

	let operations = {
		add: function(state, params) {
			if (state.queue.indexOf(params.name) < 0) {
				state.queue.push(params.name);
			}
		},
		remove: function(state, params) {
			let index = state.queue.indexOf(params.name);
			if (index >= 0) {
				state.queue.splice(index, 1);
			}
		}
	};

	Shippy.register("app", {
		init: init,
		operations: operations
	});

	Shippy.on("stateupdate", function(state) {
		console.log("STATEUPDATE");
		updateUi(state);
	});

	Shippy.on("connect", function(state) {
		console.log("CONNECT");
		$('#connection-status').addClass('connected');

	});
	Shippy.on("disconnect", function(state) {
		console.log("DISCONNECT");
		$('#connection-status').removeClass('connected');
	});

	function onAddClick(e) {
		e.preventDefault();
		Shippy.call("add", { name: myName });
	}

	function onRemoveClick(e) {
		e.preventDefault();
		Shippy.call("remove", { name: myName });
	}

	$(document).ready(function() {
		myName = prompt("Please tell me your name");
		$("#myname").text(myName);
		$("#add-button").click(onAddClick);
		$("#remove-button").click(onRemoveClick);
	});

}());