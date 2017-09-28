
// requirejs.config({
//     //By default load any module IDs from js/lib
//     baseUrl: 'js/lib',
//     paths: {
//         app: '../app'
//     }
// });

require(["/js/client.js"],
        function(client) {
            client.run();
        });
