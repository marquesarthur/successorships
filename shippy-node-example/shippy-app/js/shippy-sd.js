Shippy.SD = (function() {

    const msPerSecond = 1000;
    /**
     * Length of time a disconnected client will perform service discovery, before launching his own server.
     * This is on the longer side, since if this elapses it triggers a condition that can potentially result
     * in multiple servers.
     *
     * If each client has a different random timeout within a wide enough range,
     * this can potentially alleviate most multi-server scenarios arising from this situation.
     */
    const SHIPPY_SD_TIMEOUT = {
        min: 10 * msPerSecond,
        max: 15 * msPerSecond
    };

    const SHIPPY_SD_INTERVAL = 3 * msPerSecond;

    // Timeouts and intervals
    let pendingServiceDiscoveryTimeout = null;
    let currentServiceDiscovery = null;

    // Set to true once we've found a service that we should reasonably expect to connect to.
    let connectionRequestSent = false;

    let CurrentDiscoverList = null;

    function getRandSDTimeout() {
        return Math.random() * (SHIPPY_SD_TIMEOUT.max - SHIPPY_SD_TIMEOUT.min) + SHIPPY_SD_TIMEOUT.min;
    }


    function stopServiceDiscovery() {
        if (currentServiceDiscovery !== null) {
            clearInterval(currentServiceDiscovery);
            currentServiceDiscovery = null;
        }
        if (pendingServiceDiscoveryTimeout !== null) {
            clearTimeout(pendingServiceDiscoveryTimeout);
            pendingServiceDiscoveryTimeout = null;
        }
    }

    function connectToService(service) {
        navigator.connectToService(service.id).then(conn => {
            console.log("Connected to service!", conn);
            FlyWebConnection = conn;
            e = {
                serviceUrl: conn.url.replace("http://", '').slice(0,-1),
                name: service.name
            };
            Shippy.internal.currentFlywebService(e); // then set it in our env
        }).then(() => {
            Shippy.Client.becomeClient();
        }).catch((reason) => {
            console.log("[Shippy] Error encountered while connecting to service ", service);
            console.log("[Shippy] Reason: ", reason);
        });
    }

    function isServiceImLookingFor(svc) {
        // Note that the Shippy appName is set by the client-side app code as soon as it's retrieved
        // via that first GET request (assumed initiated exogenously)
        // TODO: Replace with a UUID, if possible...
        return Shippy.internal.appName() === svc.name;
    }

    function handleDiscoveredServices(serviceDiscoveryHelper) {
        CurrentDiscoverList = serviceDiscoveryHelper;

        // NOTE: the following callback can be executed multiple times for the same service within
        // a short span of time (shorter than it takes to connect to the service).
        // Thus many of the checks are to prevent multiple connection attempts from being made simultaneously.
        serviceDiscoveryHelper.onservicefound(event => {
            // just an object containing an attribute called serviceId
            const serviceId = event.serviceId;
            // object returned by get just has 3 attributes:
            //  - id (same as serviceId above)
            //  - name (name of the app)
            //  - http (bool indicating whether the service is an http server)
            const service = serviceDiscoveryHelper.get(serviceId);
            if (isServiceImLookingFor(service)) {
                stopServiceDiscovery();
                serviceDiscoveryHelper.stopDiscovery().then(() => {
                    if (!connectionRequestSent) {
                        // since all remaining calls here are asynchronous,
                        // don't touch this until we know the connection has failed.
                        connectionRequestSent = true;
                        connectToService(service);
                    }
                }).catch(reason => {
                    console.log("[Shippy] Error when stopping service discovery, reason: ", reason);
                    // Assume the `then' block above didn't get executed, so resume SD.
                    startServiceDiscovery();
                });
            }
        });

    }

    function discoverServices() {
        // Clear out FlyWebServices list.
        console.log("Shippy client discovery initiated");

        let stopOldDiscovery;
        if (CurrentDiscoverList) {
            stopOldDiscovery = CurrentDiscoverList.stopDiscovery();
            CurrentDiscoverList = null;
        } else {
            stopOldDiscovery = Promise.resolve();
        }
        stopOldDiscovery.then(() => {
            // provided by flyweb shippy addon
            return navigator.discoverNearbyServices()
        }).then(handleDiscoveredServices).catch(reason => {
            console.log("[Shippy] Error during service discovery, reason: ", reason);
        });
    }

    function startServiceDiscovery() {
        // Avoid having multiple SD loops happening concurrently.
        if (currentServiceDiscovery === null) {
            currentServiceDiscovery = setInterval(discoverServices, SHIPPY_SD_INTERVAL);
        }
        else {
            Lib.log("[Shippy SD] Already running service discovery, refrained from re-running");
        }
    }

    function setServiceDiscoveryTimeout(callback) {
        let timeout = getRandSDTimeout();
        pendingServiceDiscoveryTimeout = setTimeout(function() {
            // The service we were looking for has still not been discovered after timeout.
            // Clean up service discovery state.
            Lib.log("[Shippy SD] Failed to find an instance of " + Shippy.internal.appName() +
                " within " + timeout + " ms.");
            Shippy.SD.stopServiceDiscovery();
            if (typeof callback !== 'undefined') {
                callback();
            }
        }, timeout);
    }

    function resetConnectionState() {
        connectionRequestSent = false;
    }

    return {
        start: startServiceDiscovery,
        stopServiceDiscovery: stopServiceDiscovery,
        onTimeout: setServiceDiscoveryTimeout,
        resetConnectionState: resetConnectionState
    }
}());