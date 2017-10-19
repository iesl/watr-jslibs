
define(['/lib/d3.js', '/lib/underscore-min.js'], function (d3, us) {

    function makeMenuOrig() {
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

    function makeMenu() {
        d3.json("/menu", function(error, jsval) {
            console.log("menu", jsval);

            let menuItems = [];

            _.each(jsval, (entry, i) =>{
                menuItems.push(
                    {'name': entry.entry, 'level': 1, 'num': i}
                );
                _.each(entry.logfiles, (logfile) =>{
                    menuItems.push(
                        {'name': logfile, 'level': 2, 'url': logfile}
                    );
                });
            });

            console.log('menuItems', menuItems.length, ':', menuItems);

            let height = (menuItems.length * 20 ) + 50;

            console.log('height', height);

            var menu = d3.select('#menu') ;
            var menuSvg = menu.append('svg')
                .classed('menu', true)
                .attr('width', 1000)
                .attr('height', height)
            ;

            d3.select('svg.menu')
                .selectAll('.menuItem')
                .data(menuItems)
                .enter()
                .append("g")
                .classed('menuItem', true)
                .append("a")
                .attr("xlink:href", function(d){ return '/vtrace/'+d.url; })
                .append("text")
                .text(function(d, i){ return d.num ?  '(' + d.num + ')    ' + d.name : d.name; })
                .attr("x", function(d, i){ return 40 + (d.level*25); })
                .attr("y", function(d, i){ return  40 + (i*16);})
                .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
            ;
        });
    }

    return {
        run: makeMenu
    };
});
