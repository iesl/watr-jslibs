/* global require  */

import * as d3 from  'd3';
import * as panes from  './splitpane-utils.js';
import * as util from  './commons.js';
import * as tg from  './textgrid-view.js';
import * as stepper from  './d3-stepper.js';
import * as $ from 'jquery';
import {globals} from './globals';
import {$id, div, a} from './jstags.js';

import '../style/main.css';
import '../style/split-pane.css';
import '../style/pretty-split-pane.css';
import '../style/selection.css';
import '../style/bootstrap.css';

import 'bootstrap';

import 'font-awesome/css/font-awesome.css';

function setupMenubar(menuBarId) {

    $id(menuBarId)
        .addClass('menubar')
        .css({overflow: 'hidden'});

    let statusBar =
        div('.container-fluid', [
            div('.row', [
                div('.col-lg-3', [
                    a({href: '/'}, "Browse")
                ])
            ])
        ]);


    $id(menuBarId)
        .append(statusBar);
}

function setupFrameLayout() {
    let splitPaneRootId = panes.createSplitPaneRoot("#content");

    let {topPaneId: topPaneId, bottomPaneId: bottomPaneId} =
        panes.splitHorizontal("#"+splitPaneRootId, {fixedTop: 40});

    $id(topPaneId)
        .addClass('menu-pane')
        .css({
            overflow: 'hidden'
        });

    $id(bottomPaneId).addClass('content-pane');

    setupMenubar(topPaneId);

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
