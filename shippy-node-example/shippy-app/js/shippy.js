/**
 * The main Shippy controller.
 *
 * Exposes the interface specified as return statement to the module at the bottom.
 */
let Shippy = (function() {

    /**
	 * The Shippy environment. This contains the state, the app name and specification, etc.
	 * This is exposed to other Shippy modules currently with the 'internal' property in the exposed interface.
	 * It contains single-function getters/setters depending on whether an argument is specified.
	 *
	 * e.g.
	 * Shippy.internal.state() => getter
	 * Shippy.internal.state({...}) => setter
	 */
	let env = {
		state: {
			successors: []
		},
		currentFlywebService: null,
		appName: null,
		appUuid: null,
		appSpec: null,
		clientId: null, // TODO: move state out of here if it is not meant to be synchronized across nodes in the shippy network.
		initialHtml: null,
		isServing: null
	};

	// Listeners registered via Shippy.on(...)
	let listeners = {};

	// Trigger Shippy events that will call listeners specified with Shippy.on(...)
	function trigger(eventName, data) {
		if (listeners[eventName]) {
			for (let listener of listeners[eventName]) {
				listener(data);
			}
		}
	}

	// Register listeners for Shippy events
	function on(eventName, callback) {
		if (!listeners[eventName]) {
			listeners[eventName] = [];
		}
		listeners[eventName].push(callback);
	}

	// Register the app
	function register(appName, appSpec) {
		Lib.log("SERVER: Registering " + appName);
		env.appName = appName;
		env.appSpec = appSpec;

		// If an init function was specified by the app, call it with the state
		if (typeof env.appSpec.init === 'function') {
			env.appSpec.init(env.state);
		}

		// When the app is registered and there is currently no FlyWeb service with that name, we
		// want to become the server.
		if (!env.currentFlywebService && shouldBecomeNextServer()) {
			Shippy.Server.becomeServer();
		}

        Shippy.SD.start();
	}

	// Operation calls are actually delegated to the Client module since these are called from clients
	function call(operationName, params) {
		Lib.log('Operation called: ' + operationName + '; params:', params);
		Shippy.Client.call(operationName, params);
	}

	// This initial HTML has this flag set to 'server' when the webapp is accessed.
	// FlyWeb clients will have this flag set to 'client'
	function hasServerRole() {
		return $('html').attr('data-flyweb-role') === 'server';
	}

	// Determine if I should become the next server
	function shouldBecomeNextServer() {
		let successors = env.state.successors;
		let should = false;
		if (!successors.length) { // If there are no successors, just check the server role flag
			should = hasServerRole();
		} else { // If there are successors, check if I'm the first one
			should = successors[0] === env.clientId;
		}
		Lib.log('Should become server? ' + should);
		return should;
	}

	function addSuccessor(successor) {
		env.state.successors.push(successor);
	}

	function removeSuccessor(successor) {
		let index = env.state.successors.indexOf(successor);
		if (index >= 0) {
			env.state.successors.splice(index, 1);
		}
	}

	function clearSuccessors() {
		env.state.successors = [];
	}

	// ========
	// Below are single-function getters/setters
	// ========

	function onConnect() {
		trigger('connect');
	}

	function onDisconnect() {
		trigger('disconnect');
	}

	function clientId(paramClientId) {
		if (typeof paramClientId !== 'undefined') {
			env.clientId = paramClientId;
		} else {
			return env.clientId;
		}
	}

	function serving(paramServing) {
		if (typeof paramServing !== 'undefined') {
			env.serving = paramServing;
			$('html').attr('data-flyweb-role', serving ? 'server' : 'client');
		} else {
			return env.serving;
		}
	}

	function appName() {
		return env.appName;
	}

	function appSpec() {
		return env.appSpec;
	}

	function state(paramState) {
		if (typeof paramState !== 'undefined') {
			Object.assign(env.state, paramState);
		} else {
			return env.state;
		}
	}

	function currentFlywebService(newValue) {
		if (typeof newValue !== 'undefined') {
			env.currentFlywebService = newValue;
		} else {
            return env.currentFlywebService;
        }
	}

	function initialHtml() {
		return env.initialHtml;
	}

	function succeedPreviousServer() {
		Shippy.Server.becomeServer();
		Shippy.SD.start();
	}

    /**
     * Make sure this is only ever triggered if we're absolutely sure that the lost connection
     * is unrecoverable (i.e. it isn't just a temporary blip in connectivity).
	 *
	 * Also, should only ever be triggered for a client that has had a connection at some point
	 * in the past (not suitable to be called by a new client that's never been connected, since
	 * it's possible a new server is started here).
     */
    function onConnectionLost() {
        onDisconnect();
        Shippy.SD.resetConnectionState();
        if (shouldBecomeNextServer()) {
            succeedPreviousServer();
        }
        else {
            Shippy.SD.start();
            // May as well start our own server, since we've been connected in the past, and therefore have
            // a client id, some version of the state, etc.
            Shippy.SD.onTimeout(succeedPreviousServer);
        }
    }

	// When the document has loaded, we save the initial HTML such that it can be served by our Flyweb server.
	window.onload = function() {
		env.initialHtml = '<html data-flyweb-role="client">'+$('html').html()+'</html>';
	};

	// This will be the exposed interface. The global Shippy object.
	// The internal sub-object "should" only be used by other Shippy modules (this could be improved).
	return {
		register: register,
		on: on,
		call: call,
		internal: {
			trigger: trigger,
			addSuccessor: addSuccessor,
			removeSuccessor: removeSuccessor,
			clearSuccessors: clearSuccessors,
			clientId: clientId,
			appName: appName,
			appSpec: appSpec,
			state: state,
			currentFlywebService: currentFlywebService,
			initialHtml: initialHtml,
			serving: serving,
			onConnectionLost: onConnectionLost,
			onConnect: onConnect,
			onDisconnect: onDisconnect
		}
	};

}());

// $(document).ready(Shippy.internal.startServiceDiscovery);