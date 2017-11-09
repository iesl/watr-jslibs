/* global require  */

import * as d3 from  'd3';
import * as panes from  './splitpane-utils.js';
import * as util from  './commons.js';
import * as tg from  './textgrid-interp.js';
import * as stepper from  './d3-stepper.js';
import * as $ from 'jquery';
import * as mouseTracking from './mouse-tracking.js';
import {globals} from './globals';

import '../style/main.css';
import '../style/split-pane.css';
import '../style/pretty-split-pane.css';
import '../style/selection.css';
import '../style/bootstrap.css';

import 'bootstrap';

let selectId = util.selectId;


function setupMenubar() {
    let menuBarList = d3.select('.menu-pane')
        .append('ul').classed('menubar', true);

    menuBarList
        .append('li')
        .append('a')
        .attr('href', '/')
        .text('Browse  :: ');

   menuBarList
        .append('li')
        .append('span')
        .attr('id', 'mousepos')
        .text('??');

}


function setupFrameLayout() {
    let splitPaneRootId = panes.createSplitPaneRoot("#content");

    let {topPaneId: topPaneId, bottomPaneId: bottomPaneId} =
        panes.splitHorizontal(splitPaneRootId, {fixedTop: 40});

    selectId(topPaneId).addClass('menu-pane');
    selectId(bottomPaneId).addClass('content-pane');

    setupMenubar();

    mouseTracking.initGlobalMouseTracking([]);

}

function runMain() {
    d3.select('body')
        .append('div')
        .attr('id', 'content')
    ;

    setupFrameLayout();

    let entry = util.corpusEntry();

    globals.currentDocument = entry;

    let show = util.getParameterByName('show');

    d3.json(`/vtrace/json/${entry}/${show}`, function(error, jsdata) {
        if (error) {
            $('.content-pane').append(`<div><p>ERROR: ${error}: ${error.target.responseText}</p></div>`);
        } else {
            stepper.stepThrough(tg.RenderTextGrid, jsdata[0].steps);
        }

        return;
    });

}

runMain();
