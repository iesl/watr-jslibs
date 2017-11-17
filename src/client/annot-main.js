/**
 *
 **/

import * as util from  './commons.js';
import * as $ from 'jquery';
import * as frame from './frame.js';
import {globals} from './globals';
import * as global from './globals';
import * as server from './serverApi.js';
import * as panes from  './splitpane-utils.js';
import {$id} from './jstags.js';
import * as _ from  'lodash';

import '../style/split-pane.css';
import '../style/pretty-split-pane.css';
import '../style/selection.css';
import '../style/bootstrap.css';

import '../style/browse.less';

import 'bootstrap';

import 'font-awesome/css/font-awesome.css';

import * as pageview from  './view-pdf-pages.js';
import * as textview from  './view-pdf-text.js';

function setupFrameLayout() {

    let {leftPaneId: leftPaneId, rightPaneId: rightPaneId} =
        panes.splitVertical('.content-pane', {fixedLeft: 200});

    $id(leftPaneId).addClass('view-pdf-pages');
    $id(rightPaneId).addClass('page-textgrids');

}

function runMain() {

    frame.setupFrameLayout();

    let entry = util.corpusEntry();

    globals.currentDocument = entry;

    // let show = util.getParameterByName('show');

    server.getCorpusArtifactTextgrid(entry)
        .then(jsdata => {
            let dataBlock = jsdata[0].steps[0];
            let pages = dataBlock.pages;
            let textgrids = _.map(pages, p => p.textgrid);
            let pageShapes = _.map(pages, p => p.shapes);

            global.initGlobalMouseTracking();

            setupFrameLayout();

            pageview.setupPageImages('div.view-pdf-pages', pageShapes);
            textview.setupPageTextGrids('div.page-textgrids', textgrids);

        })
        .catch(error => {
            $('.content-pane').append(`<div><p>ERROR: ${error}: ${error.target.responseText}</p></div>`);
        })
    ;
}

runMain();
