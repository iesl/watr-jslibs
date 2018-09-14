/**
 *
 **/

/* global */

import * as util from  '../lib/commons.js';
import * as $ from 'jquery';
import {t} from '../lib/jstags.js';

export function addViewLinkOptions() {
    let entry = util.corpusEntry();
    $('#nav-links').append(
        t.nbsp(5),
        t.a({href: `/document/${entry}?show=textgrid.json`},[
            t.span("TextView")
        ]),
        t.nbsp(5),
        t.a({href: `/document/${entry}?show=tracelog`},[
            t.span("TraceView")
        ])
    );

}