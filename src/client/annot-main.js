/* global require $ */

import * as d3 from  'd3';
import * as panes from  './splitpane-utils.js';
import * as util from  './commons.js';
import * as tg from  './textgrid-interp.js';
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

let DrawingMethods = drawingMethods();

function drawingMethods() {
    return {
        'DocumentTextGrid' : tg.RenderTextGrid
    };
}

function onEndAll (transition, callback) {

    if (transition.empty()) {
        callback();
    } else {
        let n = transition.size();
        transition.on("end", function () {
            n--;
            if (n === 0) {
                callback();
            }
        });
    }
}

function stepper (steps) {
    if (steps.length > 0) {
        let step = steps[0];

        let method = DrawingMethods[step.Method];

        method(step)
            .transition()
            .delay(300)
            .call(onEndAll, function(){
                stepper(steps.slice(1));
            });
    }
}


function runLog(logData) {
    stepper(logData.steps);
}

function parseMultilog(multilog) {
    if (multilog.length == 1) {
        runLog(multilog[0]);
    } else {
        // Re-instate alternate visualization code
    }
    return;
}

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

export function runTrace() {
    d3.select('body')
        .append('div')
        .attr('id', 'content')
    ;
    setupFrameLayout();


    let entry = util.corpusEntry();

    globals.currentDocument = entry;
    console.log('globals', globals);

    let show = util.getParameterByName('show');

    d3.json(`/vtrace/json/${entry}/${show}`, function(error, jsval) {
        if (error) {
            $('.content-pane').append(`<div><p>ERROR: ${error}: ${error.target.responseText}</p></div>`);
        } else {
            parseMultilog(jsval);
        }

        return;
    });

}

runTrace();
