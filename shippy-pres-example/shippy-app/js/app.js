(function() {

	let revealInitialized = false;

	function updateUi(state) {
		Lib.log("updateUi", state);
		if (revealInitialized && state.slide >= 0) {
			Reveal.slide(state.slide);
		}

	}

	let init = function(state) {
		if (typeof state.slide !== 'number') {
			state.slide = 0;
		}

		Lib.log("init called. State is now...", state);
		updateUi(state);
	};

	let operations = {
		setslide: function(state, params) {
			state.slide = params.slide;
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
	});

	Shippy.on("disconnect", function(state) {
		Lib.log("App event received: disconnect");
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
				{src: 'js/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad();}}
			]
		});
		Reveal.addEventListener('slidechanged', function(event) {
			Shippy.call("setslide", { slide: event.indexh });
			// event.previousSlide, event.currentSlide, event.indexh, event.indexv
		});
		revealInitialized = true;

	});

}());