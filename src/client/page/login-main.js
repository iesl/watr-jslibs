
/* global $ */

import * as frame from '../lib/frame.js';
import {t, htm} from '../lib/jstags.js';

import '../../style/login-main.less';

function setupPage() {
    let page = t.div('.page-frame', [
        t.div('.left-sidebar'),
        t.div('#login-panel')
    ]);
    return page;
}

export function runMain() {
    frame.setupFrameLayout();
    let $contentPane = $('#splitpane_root__bottom');
    $contentPane.append(setupPage());

    let loginDiv = $('#login-forms').detach();
    $('#login-panel').append(loginDiv);
    $('#login-forms').attr('hidden', false);
}


