
/* global $ */

import * as frame from '../lib/frame.js';

import '../../style/browse-main.less';

export function runMain() {
    let loginDiv = $('#login-forms').detach();
    frame.setupSplitFrame();
    $('#splitpane_root__bottom').append(loginDiv);
    $('#login-forms').attr('hidden', false);

}
