
import * as d3 from  'd3';
import * as _ from  'lodash';
import '../style/main.css';
import * as frame from './frame.js';
import {$id, div, a} from './jstags.js';
import * as $ from 'jquery';

function buildMenuList(entryData) {
    // console.log(entryData);

    let menuItems = [];

    _.each(entryData.entries, (entry) =>{
        menuItems.push({
            'name': entry.stableId,
            'num': entry.num,
            'labels': entry.labels
        });
    });

    return menuItems;
}


function renderMenuItems(menuItems) {
    // let menu = d3.select('.content-pane')
    $('.content-pane')
        .append(div('#menu')) ;

    let menu = d3.select('#menu') ;

    let menuTable = menu.append('table')
        .classed('menu-table', true)
    ;

    let menuItemChunks = _.chunk(menuItems, 4);

    let tableRows = menuTable
        .selectAll('tr.menu-row')
        .data(menuItemChunks)
        .enter()
        .append('tr').classed('menu-row', true)
    ;

    let menuEntryTD = tableRows
        .selectAll('tr.menu-row')
        .data(d => d)
        .enter()
        .append("td").classed('menu-item', true)
    ;

    let menuEntryAnchor = menuEntryTD
        .append('div').classed('inline-block', true)
        .classed('pull-left', true)
        .append("a").attr("href", d  => `/document/${d.name}?show=textgrid.json`)
    ;

    let menuEntryDiv = menuEntryTD
        .append('div')
        .classed('menu-entry', true)
    ;

    menuEntryAnchor
        .append('div') // .classed('inline-block', true)
        .append('img')
        .attr("src", d => `/api/v1/corpus/artifacts/entry/${d.name}/image/thumb/1` )
    ;

    let entryInfo = menuEntryDiv
        .append('div')  // .classed('inline-block', true)
    ;

    let labelList = entryInfo
        .append('ul').classed('dlabels', true)
    ;

    // .text(d => `${d.num}: ${d.name}`)

    labelList
        .selectAll('li.dlabel')
        .data(d => d.labels)
        .enter()
        .append("li").classed('dlabel', true)
        .append('span')
        .text(d => `${d}`)
    ;

   // entryInfo
   //      .append("caption")
   //      .text(d => `${d.labels}`)
   //  ;

    // entryInfo
    //     .append("caption")
    //     .text(d => `${d.labels}`)
    // ;

}


function makeMenu() {
    frame.setupFrameLayout();
    d3.json("/api/v1/corpus/entries", function(error, menuData) {
        let menuItems = buildMenuList(menuData);
        renderMenuItems(menuItems);
    });
}

makeMenu();
