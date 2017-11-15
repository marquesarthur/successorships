let Self = require('sdk/self');
let PageMod = require('sdk/page-mod');
let WindowUtils = require("sdk/window/utils");
let { DiscoveryManager } = require('./lib/discovery-manager');

PageMod.PageMod({
	include: "*",
	contentScriptFile: Self.data.url('page-script.js'),
	onAttach: function (worker) {
		dump("[MyFlyWeb-Addon] Attached to page!\n");
		let lastEmit = 0;
		let window = WindowUtils.getMostRecentBrowserWindow();
		let discoveryManager = new DiscoveryManager(window);
		discoveryManager.start(function(rawServices) {
			let now = new Date().getTime();
			if (now - lastEmit > 100) { // avoid duplicate triggers
				lastEmit = now;
				let services = [];
				for (let rawService of rawServices) {
					if (rawService.serviceType === "_flyweb._tcp.") {
						let rawServiceId = rawService.serviceId;
						let rawServiceParts = rawServiceId.split("|");

						let service = {
							serviceUrl: rawServiceParts[0],
							serviceName: rawServiceParts.pop()
						};
						services.push(service);
					}
				}
				dump(JSON.stringify(services));
				worker.port.emit("servicesChanged", services);
			}
		});
	}
});