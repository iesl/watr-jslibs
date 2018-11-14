/**
 *
 **/

/* global */

import * as util from  '../lib/utils';
import * as $ from 'jquery';
import {t} from '../lib/tstags';

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
