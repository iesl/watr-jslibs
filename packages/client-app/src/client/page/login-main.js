/**
 *
 **/

import * as $ from 'jquery';
import * as frame from '../lib/frame';
import {t} from '../lib/tstags';

function setupPage() {
    let page = t.div('.page-frame', [
        t.div('.left-sidebar'),
        t.div('#login-panel')
    ]);
    return page;
}

export function runMain() {
    frame.setupFrameLayout();
    let $contentPane = $('.main > .content');
    $contentPane.append(setupPage());

    let loginDiv = $('#login-forms').detach();
    $('#login-panel').append(loginDiv);
    $('#login-forms').attr('hidden', false);
}


