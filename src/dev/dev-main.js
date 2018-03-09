/**
 * Dispatch to one of the other main modules
 **/

/* global require $ */

import '../style/app-main.less';

import {shared} from '../client/lib/shared-state';
import * as ReflowWidgetDev from  './reflow-widget.dev.js';
import * as PageImageWidgetDev from  './PageImageWidgetDev.js';
import * as SplitPaneDev from  './split-pane.dev.js';
import * as spu  from '../client/lib/splitpane-utils.js';
import * as jst  from '../client/lib/jstags.js';
const t = jst.t;

shared.DEV_MODE = true;

function runHome() {
    let pages = t.ul([
        t.li([ t.a('Reflow', {href: '/reflow'}) ]),
        t.li([ t.a('Split Pane', {href: '/splitpane'}) ]),
        t.li([ t.a('Page Image Widget', {href: '/pageimage'}) ])
    ]);

    $('#dev-pages').append(
        pages
    );
}



function dispatch() {
    console.log('running dispatch');

    let path = window.location.pathname;
    let root = path.split("/")[1];

    switch (root) {
    case "":
        runHome();
        break;

    case "reflow":
        ReflowWidgetDev.runReflow();
        break;

    case "splitpane":
        SplitPaneDev.runSplitPane();
        break;

    case "pageimage":
        PageImageWidgetDev.run();
        break;

    }

}

dispatch();
