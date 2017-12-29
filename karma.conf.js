// Karma configuration
// Generated on Thu Dec 28 2017 15:47:42 GMT-0500 (EST)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'fixture'],

        // list of files / patterns to load in the browser
        files: [
            {pattern: 'src/client/*.js', watched:true, served:false, included:false, nocache:false},
            {pattern: 'test/*.js',watched:true,served:true,included:true},
            {pattern: 'test/*.html',watched:true,served:true,included:true},
            /* parameters */
            //    watched: if autoWatch is true all files that have set watched to true will be watched for changes
            //    served: should the files be served by Karma's webserver?
            //    included: should the files be included in the browser using <script> tag?
            //    nocache: should the files be served from disk on each request by Karma's webserver?
            /* assets*/
            //    {pattern: '*.html', watched:true, served:true, included:false}
            //    {pattern: 'images/*', watched:false, served:true, included:false}
        ],


        // list of files / patterns to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
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

        // test results reporter to use
        // possible values: 'dots', 'progress'
        reporters: ['mocha','kjhtml', 'progress' /*,'dots','progress','spec'*/],

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        //if true, Karma fails on running empty test-suites
        failOnEmptyTestSuite:false,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        browsers: ['Firefox' /* 'Chrome','PhantomJS','Firefox','Edge','ChromeCanary','Opera','IE','Safari'*/],

        client: {
            //capture all console output and pipe it to the terminal, true is default
            captureConsole:false,
            //if true, Karma clears the context window upon the completion of running the tests, true is default
            clearContext:false,
            //run the tests on the same window as the client, without using iframe or a new window, false is default
            runInParent: false,
            //true: runs the tests inside an iFrame; false: runs the tests in a new window, true is default
            useIframe:true,
            jasmine:{
                //tells jasmine to run specs in semi random order, false is default
                random: false
            }
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
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
            noInfo: true,
            stats: 'errors-only'
        },

        /*karma-mocha-reporter config*/
        mochaReporter: {
            output: 'noFailures'  //full, autowatch, minimal
        }
    });
}

// "babel-jest": "^21.2.0",
// "css-loader": "^0.28.7",
// "extract-text-webpack-plugin": "^3.0.2",
// "file-loader": "^1.1.5",
// "form-serializer": "^2.5.0",
// "jasmine-core": "^2.8.0",
// "jest": "^21.2.1",
// "jquery": "^3.2.1",
// "less-loader": "^4.0.5",
// "mocha": "^4.0.1",
// "mocha-loader": "^1.1.1",
// "requirejs": "^2.3.5",
// "rxjs": "^5.5.6",
// "style-loader": "^0.19.0",
// "url-loader": "^0.6.2",
// "webpack": "^3.8.1"

