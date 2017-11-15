let console = content.console;

console.log("== My Flyweb Start ==");

let listeners = {};

self.port.on("servicesChanged", function(services) {
	let data = { services: services };
	content.dispatchEvent(new CustomEvent('flywebServicesChanged', {
		detail: JSON.stringify(data)
	}));
});