
define(['/lib/d3.js', '/lib/underscore-min.js', '/js/colors.js'], function (d3, _, colors) {

    function makeMenu() {
        d3.json("/menu", function(error, jsval) {
            console.log("menu", jsval);

            let currTop = 20;

            var menu = d3.select('#menu') ;
            var menuSvg = menu.append('svg')
                .classed('menu', true)
                .attr('width', 1000)
                .attr('height', 1000)
            ;

            d3.select('svg.menu')
                .selectAll('.menu1')
                .data(jsval)
                .enter()
                .append("g")
                .classed('menu1', true)
            ;

            d3.selectAll('.menu1')
                .each(function (menu1, menui) {

                    var self = d3.select(this);
                    self.selectAll('.entry')
                        .data(function(d, i) {return d.logfiles; })
                        .enter()
                        .append("a")
                        .classed('entry', true)
                        .attr("xlink:href", function(d){ return '/vtrace/'+d; })
                        .append("text")
                        .text(function(d, i){ return "(" + i + ")"; })
                        .attr("y", function(d, i){ return 40 + (menui*40); })
                        .attr("x", function(d, i){ return 40 + (i*30); })
                        .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
                    ;
                })
            ;
        });
    }

    return {
        run: makeMenu
    };
});
