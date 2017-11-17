let Shippy = (function() {

	let env = {
		state: {
			successors: []
		},
		currentFlywebService: null,
		appName: null,
		appSpec: null,
		clientId: null,
		isConnected: null,
		initialHtml: null
	};

	let listeners = {};

	function trigger(eventName, data) {
		if (listeners[eventName]) {
			for (let listener of listeners[eventName]) {
				listener(data);
			}
		}
	}

	function on(eventName, callback) {
		if (!listeners[eventName]) {
			listeners[eventName] = [];
		}
		listeners[eventName].push(callback);
	}

	function register(appName, appSpec) {
		env.appName = appName;
		env.appSpec = appSpec;

		if (typeof env.appSpec.init === "function") {
			env.appSpec.init(env.state);
		}

		if (!env.currentFlywebService && shouldBecomeServer()) {
			Shippy.Server.becomeServer();
		}
	}

	function call(operationName, params) {
		// If       I'm the server, call env.appSpec.operations[operationName](env.state, params)
		//          and broadcast the changes
		// Else If  I'm the client, send a WebSocket message to the server with operationName and params
		console.log("Operation called: " + operationName + "; params: " + JSON.stringify(params));
		Shippy.Client.call(operationName, params);
	}

	function isOrShouldBeServing() {
		return $('html').attr('data-flyweb-role') === 'server';
	}

	function shouldBecomeServer() {
		let successors = env.state.successors;
		let should = false;
		if (!successors.length) {
			should = isOrShouldBeServing();
		} else {
			should = successors[0] === env.clientId;
		}
		console.log("Should become server? " + should);
		return should;
	}

	function addSuccessor(successor) {
		env.state.successors.push(successor);
	}

	function clearSuccessors() {
		env.state.successors = [];
	}

	function connected(isConnected) {
		if (typeof isConnected !== 'undefined' && !(env.isConnected === null && isConnected === false)) {
			env.isConnected = isConnected;
			trigger(isConnected ? "connect" : "disconnect");
		} else {
			return env.isConnected;
		}
	}

	function clientId(clientId) {
		if (typeof clientId === 'undefined') {
			env.clientId = clientId;
		} else {
			return clientId;
		}
	}

	function appName() {
		return env.appName;
	}

	function appSpec() {
		return env.appSpec;
	}

	function state() {
		return env.state;
	}

	function currentFlywebService() {
		return env.currentFlywebService;
	}

	function initialHtml() {
		return env.initialHtml;
	}

	window.addEventListener("flywebServicesChanged", function(event) {
		env.currentFlywebService = null;
		if (env.appName) {
			let services = JSON.parse(event.detail).services;
			for (let service of services) {
				if (service.serviceName === env.appName) {
					env.currentFlywebService = service;
				}
			}
			if (env.currentFlywebService && env.isConnected === null) {
				Shippy.Client.becomeClient();
			} else if (env.isConnected === false && shouldBecomeServer()) {
				Shippy.Server.becomeServer();
			}
		}
		console.log("Current Flyweb Service: " + JSON.stringify(env.currentFlywebService));
	});

	window.onload = function() {
		env.initialHtml = '<html data-flyweb-role="client">'+$('html').html()+'</html>';
	};

	return {
		register: register,
		on: on,
		call: call,
		internal: {
			trigger: trigger,
			addSuccessor: addSuccessor,
			clearSuccessors: clearSuccessors,
			connected: connected,
			clientId: clientId,
			appName: appName,
			appSpec: appSpec,
			state: state,
			currentFlywebService: currentFlywebService,
			initialHtml: initialHtml
		}
	};

}());