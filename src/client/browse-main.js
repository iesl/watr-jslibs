
import * as d3 from  'd3';
import * as _ from  'lodash';
import * as frame from './frame.js';
import {t, icon} from './jstags.js';
import * as $ from 'jquery';

import Rx from 'rxjs/Rx';
import * as server from './serverApi.js';

import '../style/browse.less';

let pageLen = 20;

function createEntryItem(entry) {
    let interestingLabels = _.filter(entry.labels[0], l => l !== 'DocumentPages');
    let labelList = _.map(interestingLabels, l => t.li(` ${l}`));

    let entryPanel =
        t.div('.listing-entry', [
            t.div('.listing-entry-grid', [
                t.div('.listing-title', [
                    t.span(` #${entry.num} : ${entry.stableId}`)
                ]),
                t.div('.listing-image', [
                    t.a({href: `/document/${entry.stableId}?show=textgrid.json`},[
                        t.img({src: `/api/v1/corpus/artifacts/entry/${entry.stableId}/image/thumb/1` })
                    ])
                ]),
                t.div('.listing-info', [
                    t.ul('.h-indent-ul', [t.li("Labels")], labelList)
                ])
            ])
        ])
    ;

    return entryPanel;
}


function createEntryItems(corpusEntries) {
    return _.map(corpusEntries, entry => createEntryItem(entry));
}

function createPaginationDiv(corpusEntries) {
    let start = corpusEntries.start;
    let last = start+corpusEntries.entries.length;
    let count = corpusEntries.corpusSize;

    let paginationControls = t.div([
        t.span(`Displaying ${start} to ${last} of ${count};`),
        t.span('.pagination-controls', [
            t.button('.prev-page', [
                icon.fa('chevron-left'),
                icon.fa('chevron-left'),
            ]),
            t.input('.set-page', {value: start}),
            t.button('.next-page', [
                icon.fa('chevron-right'),
                icon.fa('chevron-right')
            ])
        ])
    ]) ;


    return paginationControls;
}
function setupPaginationRx(corpusEntries) {
    let currStart = corpusEntries.start;

    let prevPageRx = Rx.Observable.fromEvent($('.prev-page'), 'click');
    let nextPageRx = Rx.Observable.fromEvent($('.next-page'), 'click');
    let setPageRx = Rx.Observable.fromEvent($('.set-page'), 'change');
    prevPageRx.subscribe(() => {
        let newStart = _.clamp(currStart-pageLen, 0, corpusEntries.corpusSize-pageLen);
        server.getCorpusListing(newStart, pageLen)
            .then(resp => {
                // console.log('prev', resp);
                updatePage(resp);
            });
    });
    nextPageRx.subscribe(() => {
        let newStart = _.clamp(currStart+pageLen, 0, corpusEntries.corpusSize-pageLen);
        server.getCorpusListing(newStart, pageLen)
            .then(resp => {
                // console.log('next', resp);
                updatePage(resp);
            });
    });
    setPageRx.subscribe((e) => {
        let value = $('.set-page').prop('value');
        let newStart = _.clamp(+value, 0, corpusEntries.corpusSize-pageLen);
        server.getCorpusListing(newStart, pageLen)
            .then(resp => {
                updatePage(resp);
            });
    });
}

function updatePage(corpusEntries) {
    let entryItems = createEntryItems(corpusEntries.entries);

    $('.listing-main').empty();
    $('.listing-main').append(
        entryItems
    );

    let paginationControls = createPaginationDiv(corpusEntries);

    $('.listing-control-upper').empty();

    $('.listing-control-upper').append(
        paginationControls
    );

    setupPaginationRx(corpusEntries);
}

function createEntryListingFrame() {

    let listingFrame =
        t.div('.entry-listing-frame', [
            t.div('.listing-sidebar'),
            t.div('.listing-control-upper'),
            t.div('.listing-main')
        ]) ;

    $('.content-pane')
        .append(listingFrame) ;

}

function runMain() {
    frame.setupFrameLayout();
    createEntryListingFrame();

    server.getCorpusListing(0, pageLen)
        .then(resp => updatePage(resp));
}

runMain();
