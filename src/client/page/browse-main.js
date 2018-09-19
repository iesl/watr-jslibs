/* global  */

import * as _ from 'lodash';
import * as $ from 'jquery';
// import * as Rx from 'rxjs';
import * as rx from "rxjs";
import * as rxop from "rxjs/operators";

import * as frame from '../lib/frame.js';
import {t, icon} from '../lib/jstags.js';

import * as server from '../lib/serverApi.js';
import * as qs from 'query-string';
import * as spu  from '../lib/SplitWin.js';


const DefaultListingLength = 50;

function createEntryItem(entry) {
    let labelList = _.map(entry.labels, l => t.li(`${l}`));
    let entryName = entry.stableId.replace(/\.pdf\.d/, '');

    let entryPanel =
        t.div('.listing-entry', [
            t.div('.listing-entry-grid', [
                t.div('.listing-title', [
                    t.span(` #${entry.num}: ${entryName}`, {
                        title: entryName
                    })
                ]),
                t.div('.listing-image', [
                    t.a({href: `/document/${entry.stableId}?show=textgrid.json`},[
                        t.img({src: `/api/v1/corpus/artifacts/entry/${entry.stableId}/image/thumb/1` })
                    ])
                ]),
                t.div('.listing-info', [
                    t.a({href: `/document/${entry.stableId}?show=tracelog`},[
                        t.span("tracelogs")
                    ]),
                    t.ul('.h-indent-ul', [t.li("Labels")], labelList)
                ])
            ])
        ]) ;

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
    const browseParams = getBrowseParams();
    const listingLen = browseParams.len;

    let prevPageRx = rx.fromEvent($(".prev-page"), "click");
    let nextPageRx = rx.fromEvent($(".next-page"), "click");
    let setPageRx = rx.fromEvent($(".set-page"), "change");

    prevPageRx.subscribe(() => {
        let newStart = _.clamp(currStart-listingLen, 0, corpusEntries.corpusSize-listingLen);
        navigateListing(newStart);
    });

    nextPageRx.subscribe(() => {
        let newStart = _.clamp(currStart+listingLen, 0, corpusEntries.corpusSize-listingLen);
        navigateListing(newStart);
    });

    setPageRx.subscribe(() => {
        let value = $('.set-page').prop('value');
        let newStart = _.clamp(+value, 0, corpusEntries.corpusSize-listingLen);
        navigateListing(newStart);
    });

}

function updatePage(corpusEntries) {
    let entryItems = createEntryItems(corpusEntries.entries);

    console.log('updatePage', corpusEntries);

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
    let rootFrame = spu.createRootFrame("#main-content");
    rootFrame.setDirection(spu.row);

    let [contentPane] = rootFrame.addPanes(1);

    $(contentPane.clientAreaSelector()).addClass('client-content');


    let listingFrame =
        t.div('.entry-listing-frame', [
            t.div('.listing-sidebar'),
            t.div('.listing-control-upper'),
            t.div('.listing-main')
        ]) ;


    contentPane.clientArea()
        .append(listingFrame) ;

}

function getBrowseParams() {
    const params = qs.parse(document.location.search);
    const from = params.from ? params.from : 0;
    const len = params.len ? params.len : DefaultListingLength;
    return { from, len };
}

function navigateListing(from) {

    const parsed = qs.parse(document.location.search);
    const listingLen = parsed.len? parsed.len : DefaultListingLength;

    parsed.from = from;
    parsed.len = listingLen;

    const stringified = qs.stringify(parsed);

    document.location.search = stringified;

}

function populateListing(from, len) {
    server.getCorpusListing(from, len)
        .then(updatePage);
}

export function runMain() {
    frame.setupFrameLayout();
    createEntryListingFrame();
    const browseParams = getBrowseParams();

    populateListing(browseParams.from, browseParams.len);
}
