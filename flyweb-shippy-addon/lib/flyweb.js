'use strict';

var {Class} = require('sdk/core/heritage');
var {Cc, Ci, Cu, Cm} = require('chrome');
var xpcom = require('sdk/platform/xpcom');
var categoryManager = Cc["@mozilla.org/categorymanager;1"]
    .getService(Ci.nsICategoryManager);

var contractId = '@mozilla.org/flyweb;1';

var DNSSD = require('./dns-sd');
var API = require('./api');
var PageMod = require('sdk/page-mod');
var Self = require('sdk/self');
var {HTTPServer} = require('./http-server');

PageMod.PageMod({
    include: "*",
    contentScriptFile: Self.data.url('page-script.js'),
    onAttach: function (worker) {
        dump("[FlyWeb-Addon] Attached to page!\n");
        API.registerWorker(worker);
        worker.port.on("request", function (message) {
            let obj = JSON.parse(message);
            // Only dump message contents if there is a message error.
            if (!obj.messageName || !obj.messageId) {
                dump("Addon got message: " + message + "\n");
                if (!obj.messageName) {
                    dump("  No name for message!?\n");
                }
                if (!obj.messageId) {
                    dump("  No id for message!? (" + obj.messageName + ")\n");
                }
                return;
            }
            let {messageName, messageId} = obj;
            delete obj.messageName;
            delete obj.messageId;
            API.dispatchRequest(worker, messageName, obj, resultObj => {
                resultObj.messageName = messageName;
                resultObj.messageId = messageId;
                worker.port.emit("response", JSON.stringify(resultObj));
            });
        });
        worker.on('detach', function () {
            API.unregisterWorker(this);
        });

        /**
         * FELIX'S CODE BELOW
         */
        // let Self = require('sdk/self');
        // let PageMod = require('sdk/page-mod');
        let WindowUtils = require("sdk/window/utils");
        let { DiscoveryManager } = require('./discovery-manager');

        dump("[MyFlyWeb-Addon] Attached to page!\n");
        let lastEmit = 0;
        let window = WindowUtils.getMostRecentBrowserWindow();
        let discoveryManager = new DiscoveryManager(window);
        discoveryManager.start(function (rawServices) {
            let now = new Date().getTime();
            if (now - lastEmit > 100) { // avoid duplicate triggers
                lastEmit = now;
                let services = [];
                dump("RAW SERVICES: " + JSON.stringify(rawServices) + '\n');

                // // XXX: hacks
                // if (rawServices.length > 1) {
                // for (let i = 1; i < rawServices.length; i++) {
                // 	rawServices[i].unregister
                // }
                // }
                for (let rawService of rawServices) {
                    // dump('\nraw service proto: ');
                    // dump(rawService.__proto__[0]);
                    // dump('\n');
                    // if (rawService.serviceType === "_flyweb._tcp.") {
                    if (rawService.serviceType.startsWith("_flyweb._tcp")) {
                        let rawServiceId = rawService.serviceId;
                        let rawServiceParts = rawServiceId.split("|");

                        let service = {
                            serviceUrl: rawServiceParts[0],
                            serviceName: rawServiceParts.pop()
                        };
                        services.push(service);
                    }
                }
                dump(JSON.stringify(services) + '\n');
                worker.port.emit("servicesChanged", services);
            }
        });

        /**
         * PAUL'S CODE
         */
            // periodically advertise registered flyweb services
        let advertiseRefreshMs = 5000;
        var periodicAdvertise = function () {
            DNSSD.advertise();
            window.setTimeout(periodicAdvertise, advertiseRefreshMs)
        };
        window.setTimeout(periodicAdvertise, advertiseRefreshMs);
    }
});
