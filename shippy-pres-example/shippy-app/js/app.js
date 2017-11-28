(function() {

	let revealInitialized = false;

	function updateUi(state) {
		if (state && revealInitialized) {
			Lib.log("updateUi", state);
			Reveal.setState(state.revealState);
		}
	}

	let init = function(state) {
		Lib.log("init called. State is now...", state);
		updateUi(state);
	};

	let operations = {
		setRevealState: function(appState, params) {
			appState.revealState = params.revealState;
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


	$(document).ready(function() {
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
			let revealState = Reveal.getState();
			Shippy.call("setRevealState", { revealState: revealState });
			// event.previousSlide, event.currentSlide, event.indexh, event.indexv
		});
		revealInitialized = true;

	});

}());