// Karma configuration
// Generated on Thu Dec 28 2017 15:47:42 GMT-0500 (EST)

/* global module */

let watrmarksJsPath = '../watr-marks/js/target/scala-2.12/';
let watrmarksLib = watrmarksJsPath + 'watrmarks-fastopt.js';
let watrmarksSrcMap = watrmarksJsPath + 'watrmarks-fastopt.js.map';

module.exports = function(config) {
    config.set({

        basePath: '',

        frameworks: ['jasmine', 'fixture'],

        files: [
            // parameters
            //    watched: if autoWatch is true all files that have set watched to true will be watched for changes
            //    served: should the files be served by Karma's webserver?
            //    included: should the files be included in the browser using <script> tag?
            //    nocache: should the files be served from disk on each request by Karma's webserver?

            {pattern: 'node_modules/jquery/dist/jquery.min.js', watched:false, served:true, included:true, nocache:false},
            {pattern: 'node_modules/lodash/lodash.min.js', watched:false, served:true, included:true, nocache:false},
            {pattern: 'node_modules/d3/build/d3.min.js', watched:false, served:true, included:true, nocache:false},
            {pattern: 'dist/app.css', watched:false, served:true, included:false, nocache:true},

            {pattern: 'src/client/*.js', watched:true,   served:false, included:false, nocache:false},
            {pattern: 'test/*.js',       watched:true,   served:true,  included:true},
            {pattern: 'test/*.html',     watched:true,   served:true,  included:true},
            {pattern: watrmarksLib,      watched:true,   served:true,  included:true},
            {pattern: watrmarksSrcMap,   watched:true,   served:true,  included:false}

            // assets
            //    {pattern: '*.html', watched:true, served:true, included:false}
            //    {pattern: 'images/*', watched:false, served:true, included:false}
        ],

        exclude: [
        ],


        preprocessors: {
            '**/*.html'   : ['html2js'],
            '**/*.json'   : ['json_fixtures'],
            //use webpack to support require() in test-suits .js files
            //use babel-loader from webpack to compile es2015 features in .js files
            //add webpack as preprocessor
            './test/*.js': ['webpack']
        },

        jsonFixturesPreprocessor: {
            variableName: '__json__'
        },

        reporters: ['mocha','kjhtml', 'progress', 'dots' /*,'dots','progress','spec'*/],

        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        //  config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // if true, Karma fails on running empty test-suites
        failOnEmptyTestSuite:false,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        browsers: ['Firefox' /* 'Chrome','PhantomJS','Firefox','Edge','ChromeCanary','Opera','IE','Safari'*/],

        client: {
            //capture all console output and pipe it to the terminal, true is default
            captureConsole: false,
            //if true, Karma clears the context window upon the completion of running the tests, true is default
            clearContext: false,
            //run the tests on the same window as the client, without using iframe or a new window, false is default
            runInParent: false,
            //true: runs the tests inside an iFrame; false: runs the tests in a new window, true is default
            useIframe: true,
            jasmine: {
                //tells jasmine to run specs in semi random order, false is default
                random: false
            }
        },

        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // how many browser should be started simultaneous
        concurrency: Infinity,

        //when a browser crashes, karma will try to relaunch, 2 is default
        retryLimit:0,
        //how long does Karma wait for a browser to reconnect, 2000 is default
        browserDisconnectTimeout: 5000,
        //how long will Karma wait for a message from a browser before disconnecting from it, 10000 is default
        browserNoActivityTimeout: 10000,
        //timeout for capturing a browser, 60000 is default
        captureTimeout: 60000,


        webpackMiddleware: {
            //turn off webpack bash output when run the tests
            noInfo: false,
            stats: 'errors-only'
        },

        /*karma-mocha-reporter config*/
        mochaReporter: {
            output: 'noFailures'  //full, autowatch, minimal
        }
    });
}
