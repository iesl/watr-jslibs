/**
 * Dispatch to one of the other main modules
 **/

import * as annot from  './annot-main.js';
import * as browse from  './browse-main.js';
import * as login from  './login-main.js';
import * as curate from  './curate-main.js';


function dispatch() {

    let path = window.location.pathname;
    let root = path.split("/")[1];

    switch (root) {

    case "":
        browse.runMain();
        break;

    case "document":
        annot.runMain();
        break;

    case "login":
        login.runMain();
        break;

    case "curate":
        curate.runMain();
        break;

    }
}

dispatch();
