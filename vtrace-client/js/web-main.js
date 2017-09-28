
    // <script type="text/javascript" src='/lib/d3.js'> </script>
    // <script type="text/javascript" src='/lib/underscore-min.js'> </script>
    // <script type="text/javascript" src='/lib/require.js'> </script>

requirejs(["/js/client.js"], function(client) {
    //This function is called when scripts/helper/util.js is loaded.
    //If util.js calls define(), then this function is not fired until
    //util's dependencies have loaded, and the util argument will hold
    //the module value for "helper/util".
    client.run();
});
