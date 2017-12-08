let {Utils} = require('../utils');

function extractStateConvergence(log) {
	let eventsOfInterest = ['shippy_client_received_stateupdate', 'shippy_client_call_remove', 'shippy_client_call_add', 'shippy_client_call_setRevealState', 'shippy_client_call_addName', 'shippy_client_call_setServerName'];



	return new Promise((fullfil, reject) => {
		try {
			let filtered = log.filter((e) => {
				return eventsOfInterest.includes(e.event);
			});

			let events = Utils.chronologicallySort(filtered);
			let header = 'convergence', eventEnds = ['shippy_client_received_stateupdate'];

			let result = ['event,operation,time,pkgSize,numSuccessors,version'];
			for (let idx = 0; idx < events.length; idx++) {
				let current = events[idx];
				if (current.event.includes('shippy_client_call_')) {
					let operation = current.event.split('_').pop();
					let nextIdx = idx + 1;
					let last = undefined;
					while (nextIdx < events.length) {
						let next = events[nextIdx];
						if (eventEnds.includes(next.event) && next.version === (current.version + 1) && next.isBroadcast === false ) {
							last = next;
							nextIdx += 1;

							if (nextIdx === events.length) {
								let elapsedTime = (last.timestamp - current.timestamp) / 1000;
								result.push(header + ',' + operation + ',' + elapsedTime + ',' +
									last.pkgSize + ',' + last.numSuccessors + ',' +
									last.version
								);
							}
						} else if (eventEnds.includes(next.event) && (next.version - current.version + 1 > 1)){
							let elapsedTime = (last.timestamp - current.timestamp) / 1000;
							result.push(header + ',' + operation + ',' + elapsedTime + ',' +
								last.pkgSize + ',' + last.numSuccessors + ',' +
								last.version
							);
							break;
						} else {
							nextIdx += 1;
						}
					}
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
	extract: extractStateConvergence
};