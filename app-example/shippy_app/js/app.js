(function() {

	let myName;

	let init = function(state) {
		state.queue = [];
		console.log("init called. State is now: " + JSON.stringify(state));
	};

	let operations = {
		add: function(state, params) {
			state.queue.push(params.name);
		},
		remove: function(state, params) {
			Lib.removeFromArray(state.queue, params.name);
		}
	};

	Shippy.register("app", {
		init: init,
		operations: operations
	});

	Shippy.on("statechange", function() {
		console.log("STATECHANGE");
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