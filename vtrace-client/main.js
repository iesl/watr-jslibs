const options = require('commander');
const fs = require('fs');
const path = require('path');


options
    .version('1.0')
    .option('-f, --file [vtrace-log]', 'vtrace log to view')
    .parse(process.argv);



if (options.file == undefined) {
    options.help();
}

var cwd = process.cwd();

var file = cwd + '/' + options.file;
var realFile = fs.realpathSync(file);
var dirname = path.dirname(realFile);
var basename = path.basename(realFile);
options.basename = basename;
options.dirname = dirname;

console.log('serving file', basename);
console.log('   in ', dirname);

require('./server.js').run(options);

