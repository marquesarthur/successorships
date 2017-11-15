(function() {

	let init = function(state) {
		state.queue = [];
		console.log("INITIALIZED");
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

}());