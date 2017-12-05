/**
 *
 **/

import * as util from  './commons.js';
import * as $ from 'jquery';
import * as frame from './frame.js';
import {shared} from './shared-state';
import * as global from './shared-state';
import * as server from './serverApi.js';
import * as panes from  './splitpane-utils.js';
import * as rtrees from  './rtrees.js';
import {$id} from './jstags.js';
import * as _ from  'lodash';
import d3 from './d3-loader.js';
// import keyboardJS from 'keyboardjs';

import '../style/split-pane.css';
import '../style/pretty-split-pane.css';
import '../style/selection.css';

// import '../style/bootstrap.css';
// import 'bootstrap';

import '../style/browse.less';


import 'font-awesome/css/font-awesome.css';

import * as pageview from  './view-pdf-pages.js';
import * as textview from  './view-pdf-text.js';
import * as auth from './auth.js';

function setupFrameLayout() {

    let {leftPaneId: leftPaneId, rightPaneId: rightPaneId} =
        panes.splitVertical('.content-pane', {fixedLeft: 200});

    $id(leftPaneId).addClass('view-pdf-pages');
    $id(rightPaneId).addClass('page-textgrids');

}

export function runMain() {

    frame.setupFrameLayout();

    let entry = util.corpusEntry();

    shared.currentDocument = entry;


    server.getCorpusArtifactTextgrid(entry)
        .then(jsdata => {
            let dataBlock = jsdata[0];
            let pages = dataBlock.pages;
            let textgrids = _.map(pages, p => p.textgrid);
            let pageShapes = _.map(pages, p => p.shapes);

            global.initGlobalMouseTracking();

            setupFrameLayout();

            pageview.setupPageImages('div.view-pdf-pages', pageShapes);
            textview.setupPageTextGrids('div.page-textgrids', textgrids);

            rtrees.initPageAndGridRTrees(textgrids);

            d3.selectAll('svg.textgrid')
                .each(function (){
                    let d3$svg = d3.select(this);
                    textview.textgridSvgHandlers(d3$svg);
                });

        })
        .catch(error => {
            $('.content-pane').append(`<div><p>ERROR: ${error}: ${error}</p></div>`);
        }) ;

}

