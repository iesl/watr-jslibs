/**
 * Dispatch to one of the other main modules
 **/

import * as annot from  './annot-main.js';
import * as browse from  './browse-main.js';
import * as login from  './login-main.js';
import * as curate from  './curate-main.js';
import {shared} from './shared-state';


function dispatch() {

    let path = window.location.pathname;
    let root = path.split("/")[1];

    switch (root) {

    case "":
        shared.page = "Browse";
        browse.runMain();
        break;

    case "document":
        shared.page = "Document";
        annot.runMain();
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
