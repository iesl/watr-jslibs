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

function submitNewCuration() {
    let $form = t.div([
        t.form([
            t.div([
                t.div([
                    htm.labeledTextInput('Workflow', 'workflow'),
                    htm.labeledTextInput('Description', 'description'),
                    htm.labeledTextboxInput('Label Schema (Json)', 'labelSchema')
                ]),
                t.span([
                    t.button(':submit', '=Submit', "Submit")
                ])
            ])
        ])
    ]);


    $form.find('form').submit(function (event) {
        event.preventDefault();

        let $thisForm = $(this);
        let payload = $thisForm.serializeObject();
        rest.create.workflow(payload.workflow, payload.description, payload.labelSchema);

    });

    return $form;
}

function updateWorkflowList() {

    $('#workflows').empty();

    rest.read.workflows() .then(workflows => {
        // console.log('workflows', workflows);

        shared.curations = workflows;
        _.each(workflows, workflowDef => {
            rest.read.report(workflowDef.workflow)
                .then(workflow => {
                    let assigned = workflow.userAssignmentCounts;
                    let names = workflow.usernames;

                    let assignedList = _.map(_.toPairs(assigned), ([uid, num]) => {
                        return t.li(`${names[parseInt(uid)]}: ${num}`);
                    });

                    let c = workflow.statusCounts;
                    let lbls = _.join(
                        _.map(workflowDef.labelSchemas.schemas, l => l.label),
                        ", "
                    );
                    let rec = t.li([
                        t.div([
                            t.h4(`Workflow: ${workflowDef.workflow}`, [
                                assignmentButton(workflowDef.workflow)
                            ]),
                            `Description: ${workflowDef.description}`,
                            t.br(), `Target label    : ${workflowDef.targetLabel.key}`,
                            t.br(), `Curated labels  : ${lbls}`,
                            t.br(), `Remaining       : ${workflow.unassignedCount}`,
                            t.br(), `Assigned        : ${c.Assigned}; Completed: ${c.Completed};  Skipped: ${c.Skipped}`,
                            t.br(), `User Assignments:`, t.ul(assignedList)
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
        t.div('#curation-submit .curation-submit', [
            submitNewCuration()
        ]),
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
