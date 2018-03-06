/**
 * Curation workflow overview
 **/

/* global $ _  */

import * as frame from '../lib/frame.js';
import {t, htm} from '../lib/jstags.js';
import * as server from '../lib/serverApi.js';
import {shared} from '../lib/shared-state';
// const JsArray = watr.utils.JsArray;


function curationUri(path) {
    return server.apiUri(`workflow/${path}`);
}

export let rest = {
    create: {
        workflow: (slug, desc, label) => {
            let data = {
                workflow: slug,
                description: desc,
                labelSchemas: label
            };
            return server.apiPost(curationUri('workflows'), data);
        },
        assignment: (slug) => {
            return server.apiPost(curationUri(`workflows/${slug}/assignments`));
        }
    },
    read: {
        workflows: () => server.apiGet(curationUri('workflows')),
        report: (workflowId) => server.apiGet(curationUri(`workflows/${workflowId}/report`)),
        zone: (zoneId) => server.apiGet(curationUri(`zones/${zoneId}`))
    },
    update: {
        status: (assignId, statusCode) => {
            let data = {
                update: { StatusUpdate: {status: statusCode} }
            };

            return server.apiPost(curationUri(`assignments/${assignId}`), data);
        }
    }
};

function navigateTo(url) {
    window.location.pathname = url;
}

export function assignmentButton(workflowSlug) {
    let $button = t.button('.btn-darklink', "Get Next Assignment");

    $button.on('click', function() {
        rest.create.assignment(workflowSlug)
            .then(response => {
                // console.log('assignment', response);
                return rest.read.zone(response.zonelock.zone);
            })
            .then(response => {
                // console.log('create assignment', response);
                let stableId = response.zone.regions[0].page.stableId;
                navigateTo('/document/'+stableId);
            })
        ;

    });

    return $button;
}


function updateWorkflowList() {

    $('#workflows').empty();

    rest.read.workflows() .then(workflows => {
        console.log('workflows', workflows);

        shared.curations = workflows;
        _.each(workflows, workflowDef => {
            rest.read.report(workflowDef.workflow)
                .then(workflowReport => {
                    console.log('workflow report', workflowReport);
                    let assigned = workflowReport.userAssignmentCounts;
                    // let names = workflowReport.usernames;

                    let assignedList = _.map(_.toPairs(assigned), ([uid, email, status, num]) => {
                        return t.li(` ${email}: ${status} = ${num}`);
                    });

                    let c = workflowReport.statusCounts;
                    let lbls = _.join(
                        _.map(workflowDef.labelSchemas.schemas, l => l.label),
                        ", "
                    );
                    let rec = t.li([
                        t.table([
                            t.th([
                                t.td([t.h2([`Workflow: ${workflowDef.workflow}`])])
                            ]),
                            t.tr([
                                t.td([t.h3([`${workflowDef.workflow}`])]),
                                t.td([assignmentButton(workflowDef.workflow)])
                            ]),
                            t.tr([
                                t.td([`Target Path`]), t.td([workflowDef.targetPath])
                            ]),
                            t.tr([
                                t.td([`Curated Labels`]), t.td([lbls])
                            ]),
                            t.tr([
                                t.td([`Assignment Overview`]), t.td([
                                    `Available: ${c.Available}; Completed: ${c.Completed};  Skipped: ${c.Locked}`
                                ])
                            ]),
                            t.tr([
                                t.td([`User Assignments`]), t.td([
                                    t.ul(assignedList)
                                ])
                            ]),

                        ])
                    ])
                    ;

                    $('#workflows').append(rec);
                }) ;
        });
    }) ;
}

function setupPage() {
    let page = t.div('.page-frame', [
        t.div('.left-sidebar'),
        t.div('.curation-list', [
            t.ul("#workflows")
        ])
    ]);
    return page;
}
export function runMain() {
    frame.setupFrameLayout();

    let $contentPane = $('#splitpane_root__bottom');

    $contentPane.append(setupPage());

    updateWorkflowList();

}
