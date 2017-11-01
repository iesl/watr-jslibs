/* global define _ */

import * as d3 from  'd3';
import * as $ from  'jquery';
import * as _ from  'underscore';
// import {globals} from './globals';


function buildMenuList(entryData) {

    let menuItems = [];

    _.each(entryData, (entry, i) =>{
        menuItems.push(
            {'name': entry.entry, 'level': 1, 'num': i+1}
        );
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

makeMenu();
