function chronologicallySort(array) {
	return array.sort(function (a, b) {
		return ((a.timestamp < b.timestamp) ? -1 : (a.timestamp > b.timestamp) ? 1 : 0 );
	});
}

exports.Utils = {
	chronologicallySort
};