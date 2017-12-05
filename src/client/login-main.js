
import * as frame from './frame.js';

// import * as _ from  'lodash';
// import {t, icon} from './jstags.js';
import * as $ from 'jquery';
// import * as server from './serverApi.js';
// import '../style/browse.less';


export function runMain() {
    let loginDiv = $('#login-forms').detach();
    frame.setupSplitFrame();
    $('#splitpane_root__bottom').append(loginDiv);
    // $('#login-forms') .css({hidden: false});
    $('#login-forms').attr('hidden', false);

}
