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

import '../../style/split-pane.css';
import '../../style/pretty-split-pane.css';
import '../../style/selection.css';

import '../../style/annot.less';

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
        'Skipped',
        'NeedsReview'
    ];
    let choices = _.map(codes, code => {
        return t.option({selected: status == code, code: code}, code);
    });

    let $menu = t.select("#curation-status", choices) ;

    return $menu;
}

function workflowControlPanel(assignment) {
    let btn = curate.assignmentButton(assignment.workflow.slug);

    // let labels = _.map(assignment.workflow.curatedLabels, l => l.key);
    // let labelString = _.join(', ', labels);

    let panel = t.span([
        t.strong(`Curating: `), assignment.workflow.slug,
        t.nbsp(5),
        t.strong(`Status: `), curationStatusMenu(assignment.zonelock.status),
        t.nbsp(5),
        t.strong(`Assigned To: `), assignment.zonelock.assignee.email || '<unassigned>',
        t.nbsp(4),
        btn
    ]);

    return panel;
}

function curationStatusChange(event, ui) {
    let assignment = shared.activeAssignment;

    let newStatus = ui.item.value;

    curate.rest.update.status(assignment.workflow.slug, assignment.zonelock.id, newStatus)
        .then(() => {return {};});
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

            curate.rest.read.workflows()
                .then(workflows => { return shared.curations = workflows;})
                .then(() => { return server.apiGet('/api/v1/workflow/workflows/assignments'); })
                .then(response => {
                    // Figure out if this doc is assigned to the current user

                    let assignments = dt.assignmentsFromJson(response);
                    let filtered = _.filter(assignments, a => {
                        return _.some(a.zone.regions, r => {
                            return r.stableId === entry;
                        });
                    });

                    if (filtered.length > 0) {
                        shared.activeAssignment = filtered[0];
                        let panel = workflowControlPanel(filtered[0]);
                        $('.topbar-item-middle').append(panel);
                        $('#curation-status').selectmenu( {
                            change: curationStatusChange
                        });
                    }
                })
            ;

        })
        .catch(error => {
            $('.content-pane').append(`<div><p>ERROR: ${error}: ${error}</p></div>`);
        }) ;

}
