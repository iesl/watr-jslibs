/**
 *
 **/
/* global $ _ d3 */

import * as util from  '../lib/commons.js';
import * as frame from '../lib/frame.js';
import {shared} from '../lib/shared-state';
import * as global from '../lib/shared-state';
import * as server from '../lib/serverApi.js';
import * as panes from  '../lib/splitpane-utils.js';
import * as rtrees from  '../lib/rtrees.js';
import {$id} from '../lib/jstags.js';

import * as curate from './curate-main.js';
import * as dt from '../lib/datatypes';

// import '../../style/split-pane.css';
// import '../../style/pretty-split-pane.css';
// import '../../style/selection.css';
// import '../../style/annot-main.less';

import {t, htm} from '../lib/jstags.js';

import * as pageview from '../lib/view-pdf-pages.js';
import * as textview from '../lib/view-pdf-text.js';

function setupFrameLayout() {

    let {leftPaneId: leftPaneId, rightPaneId: rightPaneId} =
        panes.splitVertical('.content-pane', {fixedLeft: 200});

    // let {topPaneId: reflowPane, bottomPaneId: textgridPane} =
    //     panes.splitHorizontal($id(rightPaneId), {fixedTop: 100});

    $id(leftPaneId).addClass('view-pdf-pages');
    $id(rightPaneId).addClass('textgrid-control-panes');

    $id(rightPaneId).append(t.div('.reflow-controls #reflow-controls'));
    $id(rightPaneId).append(t.div('.page-textgrids #page-textgrids'));
    // $id(reflowPane).addClass('reflow-control');
    // $id(textgridPane).addClass('page-textgrids');

}

function curationStatusMenu(status) {
    let codes = [
        'Completed',
        'Assigned',
        'Skipped'
    ];
    let choices = _.map(codes, code => {
        return t.option({selected: status == code, code: code}, code);
    });

    let $menu = t.select("#curation-status", choices) ;

    return $menu;
}

function assignedCurationControlPanel(assignment) {
    let workflowSlug = assignment.zonelock.workflow;
    let btn = curate.assignmentButton(workflowSlug);

    let panel = t.span([
        t.strong(`Curating: `), workflowSlug,
        t.nbsp(5),
        t.strong(`Status: `), curationStatusMenu(assignment.zonelock.status),
        t.nbsp(5),
        t.strong(`Assigned To You`),
        t.nbsp(4),
        btn
    ]);

    return panel;
}

function unassignedCurationControlPanel(assignment) {
    let workflowSlug = assignment.zonelock.workflow;
    let btn = curate.assignmentButton(workflowSlug);

    let panel = t.span([
        t.strong(`Curating: `), workflowSlug,
        t.nbsp(5),
        t.strong(`Status: `), assignment.zonelock.status,
        t.nbsp(4),
        btn
    ]);

    return panel;
}

function curationStatusChange(event, ui) {
    let assignment = shared.activeAssignment;

    let newStatus = ui.item.value;

    console.log('curationStatusChange', assignment);
    curate.rest.update.status(assignment.zonelock.id, newStatus)
        .then(() => {return {};});
}

function showCurationStatus() {
    let entry = shared.currentDocument;

    curate.rest.read.workflows()
        .then(workflows => { return shared.curations = workflows;})
        .then(() => { return server.apiGet(`/api/v1/workflow/documents/${entry}`); })
        .then(response => {
            let assignments = dt.assignmentsFromJson(response);
            // console.log('workflow for doc', response);
            console.log('current user', shared.loginInfo);
            // Figure out if this doc is assigned to the current user
            console.log('workflow for doc', assignments);
            let assignmentsForCurrentUser  = _.filter(assignments, a => a.zonelock.assignee == shared.loginInfo.id);
            let documentHasCurationStatus = assignments.length > 0;
            let completedAssignments  = _.filter(assignments, a => a.zonelock.status == 'Completed');
            // let isComplete = completedAssignments.length > 0;
            let isAssignedToCurrentUser = assignmentsForCurrentUser.length > 0;

            if (documentHasCurationStatus) {
                let assignment = assignments[0];
                if (isAssignedToCurrentUser) {
                    let userAssignment = assignmentsForCurrentUser[0];
                    shared.activeAssignment = userAssignment;
                    let panel = assignedCurationControlPanel(userAssignment);
                    $('.topbar-item-middle').append(panel);
                    $('#curation-status').selectmenu( {
                        change: curationStatusChange
                    });

                } else {
                    let panel = unassignedCurationControlPanel(assignment);
                    $('.topbar-item-middle').append(panel);
                }
            } else {
                // "Uncurated"  + button='label this paper'
                let panel = t.span([
                    t.strong(`Curation Status: Not yet assigned.`),
                ]);
                $('.topbar-item-middle').append((panel));
            }

        }) ;
}
export function runMain() {

    frame.setupFrameLayout();

    let entry = util.corpusEntry();

    shared.currentDocument = entry;

    server.getCorpusArtifactTextgrid(entry)
        .then((jsdata => {
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

            showCurationStatus();

        }))
        .catch(error => {
            $('.content-pane').append(`<div><p>ERROR: ${error}: ${error}</p></div>`);
        }) ;

}
