/* global  */

import * as d3 from  'd3';
import * as _ from  'lodash';
import '../style/main.css';

function buildMenuList(entryData) {

    let menuItems = [];

    _.each(entryData, (entry, i) =>{
        menuItems.push(
            {'name': entry.entry, 'level': 1, 'num': i+1}
        );
    });

    return menuItems;
}


function renderMenuItems(menuItems) {
    let menu = d3.select('#menu') ;

    let menuTable = menu.append('table')
        .classed('menu-table', true)
    ;

    let menuItemChunks = _.chunk(menuItems, 4);

    let tableRows = menuTable
        .selectAll('tr')
        .data(menuItemChunks)
        .enter()
        .append('tr').classed('menu-row', true)
    ;

    let menuEntryDivs = tableRows
        .selectAll('tr.menu-row')
        .data(d => d)
        .enter()
        .append("td").classed('menu-item', true)
        .append("a").attr("href", d  => `/vtrace/${d.name}?show=textgrid.json`)
        .append('div').classed('menu-entry', true)
    ;



    menuEntryDivs
        .append("caption")
        .text(function(d){ return d.name; })
    ;

    menuEntryDivs.append('img')
        .attr("src", d => `/entry/${d.name}/image/thumb/1` )
    ;

}


function makeMenu() {
    d3.json("/menu", function(error, menuData) {

        let menuItems = buildMenuList(menuData);
        renderMenuItems(menuItems);
    });
}

makeMenu();
