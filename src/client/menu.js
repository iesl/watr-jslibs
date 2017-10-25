/* global define _ */

define(['/js/d3.js', '/js/underscore-min.js'], function (d3, us) {

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
    // [{"entry":"004465.full.pdf.d","logfiles":["004465.full.pdf.d/page-0-textgrid.json","004465.full.pdf.d/page-1-textgrid.json",
    let entrySchema = {
        entry: 'id',
        pages: {num: 4},
        logfiles: []
    };

    function buildMenuList(entryData) {

        let menuItems = [];

        _.each(entryData, (entry, i) =>{
            menuItems.push(
                {'name': entry.entry, 'level': 1, 'num': i+1}
            );
            // _.each(entry.logfiles, (logfile) =>{
            //     menuItems.push(
            //         {'name': logfile, 'level': 2, 'url': logfile}
            //     );
            // });
        });

        return menuItems;
    }

    let svgMenuList = () => d3.select('.menuItems');

    function renderMenuItems(menuItems) {

        let anchor = svgMenuList()
            .selectAll('.menuItem')
            .data(menuItems)
            .enter()
            .append("li").classed('menuItem', true)
            .append("a").attr("href", d  => `/vtrace/${d.name}?show=textgrid.json`)
            .append('div')
            .classed('menuEntry', true)
        ;

        anchor.append("caption")
            .text(function(d){ return d.name; })
            .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
        ;

        anchor.append('img')
            .attr("src", d => `/entry/${d.name}/image/thumb/1` )
        ;


    }


    function makeMenu() {
        d3.json("/menu", function(error, menuData) {

            var menu = d3.select('#menu') ;

            menu.append('div').classed('menu', true)
                .append('ul').classed('menuItems', true)
            ;

            let menuItems = buildMenuList(menuData);
            renderMenuItems(menuItems);
        });
    }

    return {
        run: makeMenu
    };
});
