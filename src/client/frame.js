/* global require  */

import * as d3 from  'd3';
import * as panes from  './splitpane-utils.js';
import * as util from  './commons.js';
import * as tg from  './view-pdf-text.js';
import * as stepper from  './d3-stepper.js';
import * as $ from 'jquery';
import {globals} from './globals';
import {$id, t} from './jstags.js';

import '../style/frame.less';
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
        t.div('.container-fluid', [
            t.div('.row', [
                t.div('.col-lg-3', [
                    t.a({href: '/'}, "Browse")
                ])
            ])
        ]);

    $id(menuBarId)
        .append(statusBar);
}

export function setupFrameLayout() {
    $('body').append(t.div('#content')) ;

    let splitPaneRootId = panes.createSplitPaneRoot("#content");

    let {topPaneId: topPaneId, bottomPaneId: bottomPaneId} =
        panes.splitHorizontal($id(splitPaneRootId), {fixedTop: 40});

    $id(topPaneId)
        .addClass('menu-pane')
        .css({overflow: 'hidden'});

    $id(bottomPaneId).addClass('content-pane');

    setupMenubar(topPaneId);

}
