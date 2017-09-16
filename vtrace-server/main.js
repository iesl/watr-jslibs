
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {

    var options = require('commander');
    var fs = require('fs');

    require('./server.js');

    // options
    //     .version('1.0')
    //     .option('-f, --file [pdf]', 'pdf input filename')
    //     .parse(process.argv);


    // if (options.file == undefined) {
    //     options.help();
    // }

    // Loading file from file system into typed array
    // var pdfPath = options.file;
    // var data = new Uint8Array(fs.readFileSync(pdfPath));

    // var p2x;
    // if (options.meta) {
    // } else if (options.svg) {
    // } else {
    //     options.help();
    // }

});
