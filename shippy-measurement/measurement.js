let {Analysis} = require('./analysis/analysis');

console.log('Starting measurements...');

console.log('Clustering events...');
let log = Analysis.aggregate('./input');

console.log('Generating csv entries...');
Analysis.getEvents(log, './output');

console.log('done.');
