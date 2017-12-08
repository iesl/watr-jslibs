/**
 * Curation workflow overview
 **/

/* global $ _ */

import * as frame from './frame.js';
import {t, htm} from './jstags.js';
import * as server from './serverApi.js';

function curationUri(path) {
    return server.apiUri(`workflow/${path}`);
}

export let rest = {
    create: {
        workflows: (slug, desc, label) => {
            let data = {
                workflow: slug,
                description: desc,
                targetLabel: label
            };
            return server.apiPost(curationUri('workflows'), data);
        },
        assignment: (slug) => {
            return server.apiPost(curationUri(`workflows/${slug}/assignments`));
        }
    },
    read: {
        workflows: () => server.apiGet(curationUri('workflows')),
        report: (workflowId) => server.apiGet(curationUri(`workflows/${workflowId}/report`))
    },
    update: {
        status: (slug, assignId, statusCode) => {
            let data = {
                update: { StatusUpdate: {status: statusCode} }
            };

            return server.apiPost(curationUri(`workflows/${slug}/assignments/${assignId}`), data);
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
                if (response.length > 0) {
                    let stableId = response[0].zone.regions[0].page.stableId;
                    navigateTo('/document/'+stableId);
                }
            })
        ;

    });

    return $button;
}

function newWorkflowForm() {
    let $form = t.div([
        t.form([
            t.div([
                htm.labeledTextInput('Workflow', 'workflow'),
                htm.labeledTextInput('Description', 'description'),
                htm.labeledTextInput('Target Label', 'targetLabel'),
                htm.labeledTextInput('Curated Labels', 'curatedLabels'),
                t.div([
                    t.button(':submit', '=Submit', "Submit")
                ])
            ])
        ])
    ]);


    $form.find('form').submit(function (event) {
        event.preventDefault();

        let $thisForm = $(this);
        let payload = $thisForm.serializeObject();

        let labels = payload.curatedLabels
            .split(/( *, *)/).filter(x => x.match(/,/)==null)
        ;

        payload.curatedLabels = labels;

        server.apiPost('/api/v1/workflow/workflows', payload)
            .then(() => {
                updateWorkflowList();
            })
        ;

    });

    return $form;
}

function updateWorkflowList() {
    $('#new-workflow-form').empty();
    $('#new-workflow-form').append(newWorkflowForm());

    $('#workflows').empty();

    rest.read.workflows()
        .then(workflows => {
            console.log('workflows', workflows);

            _.each(workflows, workflowDef => {
                rest.read.report(workflowDef.workflow)
                    .then(workflow => {
                        console.log('workflow', workflow);
                        let c = workflow.statusCounts;
                        let lbls = _.join(
                            _.map(workflowDef.curatedLabels, l => l.key),
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
                                t.br(), `User Assignments: ${workflow.userAssignmentCounts}`
                            ])
                        ])
                        ;

                        $('#workflows').append(rec);
                    }) ;
            });

        }) ;

}

export function runMain() {
    frame.setupFrameLayout();

    let $contentPane = $('#splitpane_root__bottom');
    // let $topbarPane = $('#splitpane_root__top');

    $contentPane.append(t.div("#new-workflow-form"));
    $contentPane.append(t.ul("#workflows"));


    updateWorkflowList();

}
