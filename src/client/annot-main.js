/* global require  */

import * as d3 from  'd3';
import * as util from  './commons.js';
import * as tg from  './textgrid-view.js';
import * as stepper from  './d3-stepper.js';
import * as $ from 'jquery';
import * as frame from './frame.js';
import {globals} from './globals';

import '../style/main.css';
import '../style/split-pane.css';
import '../style/pretty-split-pane.css';
import '../style/selection.css';
import '../style/bootstrap.css';

import 'bootstrap';

import 'font-awesome/css/font-awesome.css';


function runMain() {

    frame.setupFrameLayout();

    let entry = util.corpusEntry();

    globals.currentDocument = entry;

    let show = util.getParameterByName('show');

    d3.json(`/api/v1/corpus/artifacts/vtrace/json/${entry}/${show}`, function(error, jsdata) {
        if (error) {
            $('.content-pane').append(`<div><p>ERROR: ${error}: ${error.target.responseText}</p></div>`);
        } else {
            stepper.stepThrough(tg.RenderTextGrid, jsdata[0].steps);
        }

        return;
    });

}

runMain();
