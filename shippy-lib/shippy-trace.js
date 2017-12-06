let Trace = (function () {

	const logKey = 'shippy:log:' + Date.now().toString() + ':' + Math.random().toString();

	let shippyLog = [];
	const thresholdInc = 500;
	let backupThreshold = 500;

	function save() {
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
		shippyLog.push(traceData);
		backup();
	}

	return {
		log: log,
		save: save
	};

})();