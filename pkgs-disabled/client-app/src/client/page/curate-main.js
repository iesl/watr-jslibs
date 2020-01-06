/**
 * Curation workflow overview
 **/

/* global */
import * as $ from 'jquery';
import 'jquery-serializejson';
import _ from 'lodash';

import * as frame from '../lib/frame';
import { t, htm } from "../lib/tstags";
import {shared} from '../lib/shared-state';
import * as server from '../lib/serverApi';
const rest = server.rest;




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

function toJSONString( form ) {
	var obj = {};
	var elements = form.querySelectorAll( "input, select, textarea" );
	for( var i = 0; i < elements.length; ++i ) {
		var element = elements[i];
		var name = element.name;
		var value = element.value;

		if( name ) {
			obj[ name ] = value;
		}
	}

	return JSON.stringify( obj );
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
    const payload = $thisForm.serializeJSON();

    rest.create.workflow(payload.workflow, payload.description, payload.labelSchema);

  });

  return $form;
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

  let $contentPane = $('#main-content');

  $contentPane.append(setupPage());

  updateWorkflowList();

}

