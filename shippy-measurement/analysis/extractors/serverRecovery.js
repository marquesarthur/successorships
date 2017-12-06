let {Utils} = require('../utils');

function extractServerRecovery(log) {

	let eventsOfInterest = ['shippy_become_server_begin', 'shippy_become_server_end', 'shippy_become_server_error', 'disconnecting'];

	return new Promise((fullfil, reject) => {
		try {
			let filtered = log.filter((e) => {
				return eventsOfInterest.includes(e.event);
			});

			let events = Utils.chronologicallySort(filtered);
			let header = 'server_recovery,', eventBegin = ['disconnecting'], eventEnds = ['shippy_become_server_begin'];

			let idx = 0;
			let result = ['event,time'];
			while (idx < events.length) {
				let current = events[idx];
				if (eventBegin.includes(current.event) && current.isServer) {
					let nextIdx = idx + 1;
					while (nextIdx < events.length) {
						let next = events[nextIdx];
						if (eventEnds.includes(next.event)) {
							let elapsedTime = (next.timestamp - current.timestamp) / 1000;
							result.push(header + elapsedTime);
							idx = nextIdx;
							break;
						} else {
							nextIdx += 1;
						}
					}
					if (nextIdx === events.length) {
						break;
					}
				} else {
					idx += 1;
				}
			}
			fullfil(result);
		} catch (err) {
			console.log(err);
			fullfil([]);
		}
	});
}

module.exports = {
	extract: extractServerRecovery
};
