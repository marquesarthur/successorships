/**
 * Our trace module. This is only used for evalation purposes and should not be shipped with a productive version
 * of our library. Also, it introduces a second global object `Trace` which we want to avoid in case of becoming
 * productive.
 */
let Trace = (function () {

	const TRACE_ENABLED = false;

	const logKey = 'shippy:log:' + Date.now().toString() + ':' + Math.random().toString();

	let shippyLog = [];
	const thresholdInc = 500;
	let backupThreshold = 500;

	function save() {
		if (!TRACE_ENABLED) {
			return;
		}
		// Creates chuncks of the log with at most 500 events.
		// This will prevent POSTs with a payload size higher than what our measurement server can handle
		let chunks = [], size = 500;

		while (shippyLog.length > 0) {
			chunks.push(shippyLog.splice(0, size));
		}

		let i = 0;
		for (let chunk of chunks) {
			let payload = {clientId: Shippy.internal.clientId(), log: chunk, id: i++};
			$.ajax({
				type: "POST",
				url: 'http://127.0.0.1:4321',
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				async: false,
				//json object to sent to the authentication url
				data: JSON.stringify(payload),
				success: function () {
				}
			});
		}
	}

	function backup() {
		if (shippyLog.length > backupThreshold){
			sessionStorage.setItem(logKey, JSON.stringify(shippyLog));
			backupThreshold += thresholdInc;
		}
	}

	function log(traceData) {
		if (!TRACE_ENABLED) {
			return;
		}
		shippyLog.push(traceData);
		backup();
	}

	return {
		log: log,
		save: save
	};

})();