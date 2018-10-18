/**
 * Dispatch to one of the other main modules
 **/

import * as annot from  './annot-main.js';
import * as browse from './browse-main.js';
import * as login from  './login-main.js';
import * as curate from './curate-main.js';
import * as trace from './trace-main.js';
import {shared} from '../lib/shared-state';
import {getParameterByName} from '../lib/commons';

import '../../style/app-main.less';


function dispatch() {

    let path = window.location.pathname;
    let root = path.split("/")[1];
    let view = getParameterByName('show');

    switch (root) {

    case "":
        shared.page = "Browse";
        browse.runMain();
        break;

    case "document":
        if (view == 'tracelog') {
            shared.page = "Trace";
            trace.runMain();
        } else {
            shared.page = "Document";
            annot.runMain();
        }
        break;

    case "login":
        shared.page = "Login";
        login.runMain();
        break;

    case "curate":
        shared.page = "Curate";
        curate.runMain();
        break;

    }
}

dispatch();
