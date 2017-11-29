(function() {

	let revealInitialized = false;
	let lastSlideChange = 0;

	let myName, clientId;

	function updateUi(state) {
		if (state && revealInitialized) {
			Lib.log("updateUi", state);
			Reveal.setState(state.revealState);
			$('#successors').html('');
			$('#server-name').html('');

			if (state.successors && state.names) {
				let successorNames = [];
				state.successors.forEach(function(clientId) {
					if (state.names[clientId]) {
						successorNames.push(state.names[clientId]);
					}
				});
				successorNames.forEach(function(name) {
					$('#successors').append('<span>'+name+'</span>');
				});
			}

			if (state.serverName) {
				$('#server-name').html(state.serverName);
			}
		}
	}

	let init = function(state) {
		state.names = {};
		Lib.log("init called. State is now...", state);
		updateUi(state);
	};

	let operations = {
		setRevealState: function(appState, params) {
			lastSlideChange = new Date().getTime();
			appState.revealState = params.revealState;
		},
		addName: function(appState, params) {
			if (clientId) {
				appState.names[params.clientId] = params.name;
			}
			console.log("ADDNAME", appState);
		},
		setServerName: function(appState, params) {
			appState.serverName = params.name;
		}
	};

	Shippy.register("527Presentation", {
		init: init,
		operations: operations
	});

	Shippy.on("stateupdate", function(state) {
		Lib.log("App event received: stateupdate");
		updateUi(state);
	});

	Shippy.on("connect", function() {
		Lib.log("App event received: connect");
		$('html').addClass('connected');
	});

	Shippy.on("disconnect", function(state) {
		Lib.log("App event received: disconnect");
		$('html').removeClass('connected');
	});

	Shippy.on("servicefound", function(service) {
		let url = "http://" + service.serviceUrl;
		Lib.log("SERVICE", service);
		$('#current-service-name').text(service.serviceName);
		$('#current-service-url').attr("href", url).text(url);
	});

	Shippy.on("clientid", function(params) {
		Lib.log("CLIENTID", params);
		clientId = params.clientId;
		if (myName) {
			Shippy.call("addName", { clientId: clientId, name: myName });
		}
		if (params.serving) {
			Shippy.call("setServerName", { name: myName });
		}
	});


	$(document).ready(function() {
		myName = prompt("Who are you?");

		Reveal.initialize({
			// Display controls in the bottom right corner
			controls: true,
			// Display a presentation progress bar
			progress: true,
			// If true; each slide will be pushed to the browser history
			history: true,
			// Loops the presentation, defaults to false
			loop: false,
			// Flags if mouse wheel navigation should be enabled
			mouseWheel: true,
			// Apply a 3D roll to links on hover
			rollingLinks: true,
			// UI style
			theme: 'black',
			// Transition style
			transition: 'slide',
			// Optional libraries used to extend on reveal.js
			dependencies: [
				{src: 'js/highlight.js', async: true, callback: function() { hljs.initHighlighting();}}
			]
		});
		Reveal.addEventListener('slidechanged', function(event) {
			if (new Date().getTime() - lastSlideChange > 500) {
				let revealState = Reveal.getState();
				Shippy.call("setRevealState", { revealState: revealState });
			} else {
				Lib.log("SLIDECHANGE IGNORED");
			}
		});

		revealInitialized = true;

		if (clientId) {
			Shippy.call("addName", { clientId: clientId, name: myName });
		}
	});

}());