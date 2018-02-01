/**
 * Dispatch to one of the other main modules
 **/

/* global require $   watr */
// import * as annot from  './annot-main.js';
// import * as browse from './browse-main.js';
// import * as login from  './login-main.js';
// import * as curate from './curate-main.js';
import {shared} from '../lib/shared-state';
import * as Shared from '../lib/shared-state';
import * as ReflowWidget from  '../lib/ReflowWidget.js';

import '../../style/app-main.less';

shared.DEV_MODE = true;

function runHome() {

}

function runReflow()  {
    console.log('running runReflow');

    Shared.initGlobalMouseTracking();
    let textGridConstruction = new watr.textgrid.TextGridConstructor();
    // let textGrid = textGridConstruction.getTestTextGridLarge();
    let textGrid = textGridConstruction.getTestTextGrid();
    let labelSchema = textGridConstruction.getTestLabelSchema();
    let reflowWidget = new ReflowWidget.ReflowWidget('page-textgrids', textGrid, labelSchema);


    reflowWidget.init();

}

import * as spu  from '../lib/splitpane-utils.js';
import * as jst  from '../lib/jstags.js';

function runSplitPane() {
    let splitPaneRootId = spu.createSplitPaneRoot("#main");
    const t = jst.t;
    const htm = jst.htm;

    let {topPaneId, bottomPaneId} =
        spu.splitHorizontal(jst.$id(splitPaneRootId), {fixedTop: 40});

    // let Shared = require('./../src/client/lib/shared-state.js');
    $('.split-pane-component').each(function () {
        console.log('this', $(this));

    });

    let buttons = {
        hsplit: htm.iconButton('minus-square-o'),
        vsplit: htm.iconButton('columns')
    };

    // buttons.hsplit.on('click', function() {
    //     let mySplitPane = spu.splitPaneFor(this);

    // });


    let {leftPaneId, rightPaneId} =
        spu.splitVertical(jst.$id(bottomPaneId), {fixedLeft: 200});

    jst.$id(leftPaneId).append(
        t.div('Some Text')
    );

    $('div.split-pane').splitPane();

    let treeStr = spu.getDescendantTreeString("#"+splitPaneRootId);

    jst.$id(rightPaneId).append(
        t.div(t.pre().text(treeStr))
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
        runReflow();
        break;

    case "splitpane":
        runSplitPane();
        break;

    }
}

dispatch();
