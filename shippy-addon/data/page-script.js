let console = content.console;

console.log("== My Flyweb Start ==");

let listeners = {};

self.port.on("servicesChanged", function(services) {
	for (let service of services) {
		let name = service.serviceName;
		if (listeners[name]) {
			for (let listener of listeners[name]) {
				listener(JSON.stringify(service));
			}
		}
	}
});

function onServiceChanged(name, listener) {
	if (typeof listener === 'function') {
		if (!listeners[name]) {
			listeners[name] = [];
		}
		listeners[name].push(listener);
	}
}

exportFunction(onServiceChanged, window.navigator, {
	defineAs: 'onServiceChanged'
});