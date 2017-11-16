
import * as d3 from  'd3';
import * as _ from  'lodash';
import '../style/main.css';
import * as frame from './frame.js';
import * as t from './jstags.js';
import * as $ from 'jquery';

import '../style/browse.less';

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
        .append(t.div('#menu')) ;

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

function createEntryItems(corpusEntries) {
    return _.map(corpusEntries, entry => {
        return t.div('.listing-entry', [
            t.a({href: `/document/${entry.stableId}?show=textgrid.json`},[
                t.img({src: `/api/v1/corpus/artifacts/entry/${entry.stableId}/image/thumb/1` })
            ])
        ]);
    });
}

function createPaginationDiv(corpusEntries) {
    let start = corpusEntries.start;
    let last = start+corpusEntries.entries.length;
    let count = corpusEntries.corpusSize;

    let paginationControls = t.div([
        t.span(`Displaying ${start} to ${last} of ${count};`),
        t.icon.chevronLeft,
        t.icon.chevronLeft,
        t.span("--"),
        t.icon.chevronRight,
        t.icon.chevronRight
    ]) ;

    return paginationControls;
}
function renderPage(corpusEntries) {

    let listingFrame =
        t.div('.entry-listing-frame', [
            t.div('.listing-sidebar'),
            t.div('.listing-control-upper'),
            t.div('.listing-control-lower'),
            t.div('.listing-main')
        ]) ;

    $('.content-pane')
        .append(listingFrame) ;

    // let sampleEntries = _.times(100, _.constant(t.div('.listing-entry')));
    // let sampleEntries = _.map(_.range(100),  () => t.div('.listing-entry'));
    let entryItems = createEntryItems(corpusEntries.entries);
    console.log(entryItems);

    $('.listing-main').append(
        entryItems
    );


    let paginationControls = createPaginationDiv(corpusEntries);

    $('.listing-control-upper').append(
        paginationControls
    );


    // obj(
    //     ("num", Json.fromInt(skip+i)),
    //     ("stableId", Json.fromString(stableId.unwrap)),
    //     ("labels", docLabels)
    // )
    // obj(
    //     ("corpusSize", Json.fromInt(docCount)),
    //     ("entries", entries),
    //     ("start", Json.fromInt(skip))
    // )

}

function makeMenu() {
    frame.setupFrameLayout();
    d3.json("/api/v1/corpus/entries", function(error, corpusEntries) {
        let menuItems = renderPage(corpusEntries);
        renderMenuItems(menuItems);
    });
}

makeMenu();
