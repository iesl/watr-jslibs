/**
 *
 **/
/* global $ _ d3 */

import * as util from  './commons.js';
import * as frame from './frame.js';
import {shared} from './shared-state';
import * as global from './shared-state';
import * as server from './serverApi.js';
import * as panes from  './splitpane-utils.js';
import * as rtrees from  './rtrees.js';
import {$id} from './jstags.js';

import * as dt from './datatypes';

import '../style/split-pane.css';
import '../style/pretty-split-pane.css';
import '../style/selection.css';

import '../style/browse.less';

import {t, htm} from './jstags.js';

import * as pageview from  './view-pdf-pages.js';
import * as textview from  './view-pdf-text.js';

function setupFrameLayout() {

    let {leftPaneId: leftPaneId, rightPaneId: rightPaneId} =
        panes.splitVertical('.content-pane', {fixedLeft: 200});

    $id(leftPaneId).addClass('view-pdf-pages');
    $id(rightPaneId).addClass('page-textgrids');

}

function curationStatusMenu(status) {
    let $menu =
        t.select("#curation-status", [
            t.option('Assigned'),
            t.option('Complete'),
            t.option('Errors')
        ]) ;

    return $menu;
}

function workflowControlPanel(assignment) {
    // Status: Assigned; To: a@b.com [Complete] [ ]Flag: [(note)]; Labels: Title, Author; Workflow: slug
    //   [Finish and Get Next Assignment]
    let $button2 = t.button('.btn-darklink', "Get Next Assignment");

    // let labels = _.map(assignment.workflow.curatedLabels, l => l.key);
    // let labelString = _.join(', ', labels);

    let panel = t.span([
        t.strong(`Curating: `), assignment.workflow.slug,
        t.nbsp(4),
        t.strong(`Status: `), curationStatusMenu(assignment.zonelock.status),
        t.nbsp(3),
        t.strong(`To: `), assignment.zonelock.assignee,
        t.nbsp(2),
        $button2
    ]);

    return panel;
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

            // Figure out if this doc is assigned to the current user
            server.apiGet('/api/v1/workflow/workflows/assignments')
                .then(response => {
                    console.log('assignments jso', response);

                    let assignments = dt.assignmentsFromJson(response);
                    console.log('assignments', assignments);
                    console.log('entry', entry);
                    let filtered = _.filter(assignments, a => {
                        return _.some(a.zone.regions, r => {
                            return r.stableId === entry;
                        });
                    });

                    console.log('filtered', filtered);
                    if (filtered.length > 0) {
                        let panel = workflowControlPanel(filtered[0]);
                        $('.topbar-item-middle').append(panel);
                        $('#curation-status').selectmenu();
                    }
                })
            ;

        })
        .catch(error => {
            $('.content-pane').append(`<div><p>ERROR: ${error}: ${error}</p></div>`);
        }) ;

}
