

import * as _ from  'lodash';
import * as frame from './frame.js';
import {t} from './jstags.js';
import * as $ from 'jquery';

import * as server from './serverApi.js';

function curationUri(path) {
    return server.apiUri(`workflow/${path}`);
}

let rest = {
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
    }
};

function navigateTo(url) {
    window.location.pathname = url;
}

function assignmentButton(workflowSlug) {
    let $button = t.button("Get Next Assignment");

    $button.on('click', function() {
        rest.create.assignment(workflowSlug)
            .then(response => {
                navigateTo('/document');
            })
        ;

    });

    return $button;
}

export function runMain() {
    frame.setupFrameLayout();

    let $contentPane = $('#splitpane_root__bottom');
    // rest.create.workflows('sample5-curation', 'Some other description of the task', 'Authors')
    //     .then(created => {
    $contentPane.append(t.ul("#workflows"));

    rest.read.workflows()
        .then(workflows => {
            console.log('workflows', workflows);
            _.each(workflows, workflowDef => {

                // statusCounts: Object { Assigned: 0, Completed: 0, Skipped: 0 }
                // unassignedCount: 0
                // userAssignmentCounts: Object {  }
                rest.read.report(workflowDef.workflow)
                    .then(workflow => {
                        console.log('workflow', workflow);
                        let c = workflow.statusCounts;
                        let rec = t.li([
                            t.div([
                                t.h4(`Workflow: ${workflowDef.workflow}`, [
                                    assignmentButton(workflowDef.workflow)
                                ]),
                                `Description: ${workflowDef.description}`,
                                t.br(), `Assigned: ${c.Assigned}; Completed: ${c.Completed};  Skipped: ${c.Skipped}`,
                                t.br(), `Remaining; ${workflow.unassignedCount}`,
                                t.br(), `User Assignments; ${workflow.userAssignmentCounts}`
                            ])
                        ])
                        ;

                        $('#workflows').append(rec);
                    }) ;
            });

        }) ;



}
