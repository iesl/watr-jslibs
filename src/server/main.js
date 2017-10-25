const options = require('commander');
const fs = require('fs');
const path = require('path');


// .option('-f, --file [vtrace-log]', 'vtrace log to view')

options
    .version('1.0')
    .option('--corpus [corpus root]', 'root path of corpus')
    .parse(process.argv);

if (options.corpus == undefined) {
    options.help();
}

var cwd = process.cwd();

var root = cwd + '/' + options.corpus;
options.corpusRoot = root;

console.log('starting in corpus', root);

require('./server.js').run(options);
