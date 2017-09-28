
console.log('web-main');

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
// requirejs(['jquery', 'canvas', 'app/sub'],
//           function   ($,        canvas,   sub) {
//               //jQuery, canvas and the app/sub module are all
//               //loaded and can be used here now.
//           });
