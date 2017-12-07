
/* global $ */

import * as frame from './frame.js';


export function runMain() {
    let loginDiv = $('#login-forms').detach();
    frame.setupSplitFrame();
    $('#splitpane_root__bottom').append(loginDiv);
    // $('#login-forms') .css({hidden: false});
    $('#login-forms').attr('hidden', false);

}
