(function() {

	let revealInitialized = false;
	let lastSetRevealStateCall = 0;

	let randonNames = ['John', 'Homer', 'Samus', 'Daenerys', 'Patrick', 'Nadine', 'Ned', 'Bart', 'Billy', 'Grim', 'Foo', 'Bar'];

	let myName, clientId, serving;

	function updateUi(state) {
		if (state && revealInitialized) {
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
				$('#server-name').html('<span>'+state.serverName+'</span>');
			}
		}
	}

	let init = function(state) {
		state.names = {};
		Shippy.Util.log("init called. State is now...", state);
		updateUi(state);
	};

	let operations = {
		setRevealState: function(appState, params) {
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
		Shippy.Util.log("App event received: stateupdate");
		updateUi(state);
	});

	Shippy.on("connect", function() {
		Shippy.Util.log("App event received: connect");
		$('html').addClass('connected');
	});

	Shippy.on("disconnect", function(state) {
		Shippy.Util.log("App event received: disconnect");
		$('html').removeClass('connected');
	});

	Shippy.on("servicefound", function(service) {
		let url = "http://" + service.serviceUrl;
		$('#current-service-name').text(service.serviceName);
		$('#current-service-url').attr("href", url).text(url);
	});

	Shippy.on("clientid", function(params) {
		Shippy.Util.log("CLIENTID", params);
		clientId = params.clientId;
		serving = params.serving;
		if (myName) {
			Shippy.call("addName", { clientId: clientId, name: myName });
		}
		if (serving) {
			Shippy.call("setServerName", { name: myName });
		}
	});


	$(document).ready(function() {
		myName = randonNames[Math.floor(Math.random() * randonNames.length)]; //prompt("Who are you?");

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
			if (new Date().getTime() - lastSetRevealStateCall > 300) {
				let revealState = Reveal.getState();
				Shippy.call("setRevealState", { revealState: revealState });
				lastSetRevealStateCall = new Date().getTime();
			} else {
				Shippy.Util.log("SLIDECHANGE IGNORED");
			}
		});

		revealInitialized = true;

		if (clientId) {
			Shippy.call("addName", { clientId: clientId, name: myName });
		}
		if (serving) {
			Shippy.call("setServerName", { name: myName });
		}
	});

}());