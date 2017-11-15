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
exports.DiscoveryManager = DiscoveryManager;