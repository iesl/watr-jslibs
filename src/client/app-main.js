/**
 * Dispatch to one of the other main modules
 **/

import * as annot from  './annot-main.js';
import * as browse from  './browse-main.js';
import * as login from  './login-main.js';


function dispatch() {

    let path = window.location.pathname;

    switch (path) {

    case "/":
        browse.runMain();
        break;

    case "/document":
        annot.runMain();
        break;

    case "/login":
        login.runMain();
        break;

    }
}

dispatch();
