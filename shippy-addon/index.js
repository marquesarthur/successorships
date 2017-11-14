// let self = require('sdk/self');
// let myflyweb = require('./lib/flyweb');

let Self = require('sdk/self');
let PageMod = require('sdk/page-mod');
//let API = require('./api');
let WindowUtils = require("sdk/window/utils");


PageMod.PageMod({
	include: "*",
	contentScriptFile: Self.data.url('page-script.js'),
	onAttach: function (worker) {
		dump("[MyFlyWeb-Addon] Attached to page!\n");
		let lastEmit = 0;
		let window = WindowUtils.getMostRecentBrowserWindow();
		let discoveryManager = new DiscoveryManager(window);
		let listeners;
		discoveryManager.start(function(rawServices) {
			let now = new Date().getTime();
			if (now - lastEmit > 1000) {
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

		// API.registerWorker(worker);
		// worker.port.on("request", function (message) {
		// 	let obj = JSON.parse(message);
		// 	// Only dump message contents if there is a message error.
		// 	if (!obj.messageName || !obj.messageId) {
		// 		dump("Addon got message: " + message + "\n");
		// 		if (!obj.messageName) {
		// 			dump("  No name for message!?\n");
		// 		}
		// 		if (!obj.messageId) {
		// 			dump("  No id for message!? (" + obj.messageName + ")\n");
		// 		}
		// 		return;
		// 	}
		// 	let {messageName, messageId} = obj;
		// 	delete obj.messageName;
		// 	delete obj.messageId;
		// 	API.dispatchRequest(worker, messageName, obj, resultObj => {
		// 		resultObj.messageName = messageName;
		// 		resultObj.messageId = messageId;
		// 		worker.port.emit("response", JSON.stringify(resultObj));
		// 	});
		// });
		// worker.on('detach', function () {
		// 	API.unregisterWorker(this);
		// });
	}
});


class DiscoveryManager {
	constructor(aWindow) {
		this._discoveryManager = new aWindow.FlyWebDiscoveryManager();
	}

	destroy() {
		if (this._id) {
			this.stop();
		}

		this._discoveryManager = null;
	}

	start(callback) {
		if (!this._id) {
			this._id = this._discoveryManager.startDiscovery(this);
		}

		this._callback = callback;
	}

	stop() {
		this._discoveryManager.stopDiscovery(this._id);

		this._id = null;
	}

	pairWith(serviceId, callback) {
		this._discoveryManager.pairWithService(serviceId, {
			pairingSucceeded(service) {
				callback(service);
			},

			pairingFailed(error) {
				console.error("FlyWeb failed to pair with service " + serviceId, error);
			}
		});
	}

	onDiscoveredServicesChanged(services) {
		if (!this._id || !this._callback) {
			return;
		}

		this._callback(services);
	}
}