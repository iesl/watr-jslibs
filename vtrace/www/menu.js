
define(['/lib/d3.js', '/lib/underscore-min.js', '/js/colors.js'], function (d3, _, colors) {

    function makeMenu() {
        d3.json("/menu", function(error, jsval) {
            console.log("menu", jsval);
            var menu = d3.select('#menu') ;
            var menuSvg = menu.append('svg')
                .classed('menu', true)
                .attr('width', 400)
                .attr('height', 1000)
            ;


            d3.select('svg.menu')
                .selectAll('.menu1')
                .data(jsval)
                .enter()
                .append("a")
                .classed('menu1', true)
                .attr("xlink:href", function(d){ return '/vtrace/'+d.entry; })
                .append('text')
                .attr("y", function(d, i){ return 20 + (i * 20); })
                .attr("x", function(d, i){ return 10; })
                .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
                .text(function(d, i){ return "> " + d.entry; })
            ;
        });
    }

    return {
        run: makeMenu
    };
});
