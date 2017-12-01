/* global require  */

import * as panes from  './splitpane-utils.js';
import * as $ from 'jquery';
import {$id, t} from './jstags.js';
import * as auth from './auth.js';

import '../style/frame.less';
import '../style/split-pane.css';
import '../style/pretty-split-pane.css';
import '../style/selection.css';
import '../style/bootstrap.css';

import 'bootstrap';

import 'font-awesome/css/font-awesome.css';


function setupMenubar($menubar) {

    let $home = t.a('.menuitem-head', {href: '/'}, "Home");

    $menubar.append($home);
    $menubar.append(t.span('.user-info .menuitem-last'));

    return $menubar;
}

function setUserInfo(loginInfo) {
    $('.user-info').empty();
    $('.user-info').append(
        `Logged in as `,
        t.strong(loginInfo.info.email),
        `  `,
        logoutButton()
    );
}

function setUserInfoError() {
    $('.user-info').empty();
    $('.user-info').append(
        "Error Logging in; ",
        loginButton()
    );
}
function loginButton() {
    let link = t.a('.menuitem-last', {href: '/login'}, "Login");
    link.on('click', function(e){
        e.stopPropagation();
        e.preventDefault();
        auth.doLogin()
            .then(setUserInfo)
            .catch(setUserInfoError);
    });

    return link;
}
function logoutButton() {
    let link = t.a('.menuitem-last', {href: '/logout'}, "Logout");
    link.on('click', function(e){
        e.stopPropagation();
        e.preventDefault();
        auth.doLogout()
            .then(setUserLoginInfo)
            .catch(setUserInfoError);
    });
    return link;
}
function setUserLoginInfo(loginInfo) {
    if (loginInfo.login) {
        setUserInfo(loginInfo);
    } else {
        $('.user-info').empty();
        $('.user-info').append(
            loginButton()
        );
    }
}
export function setupFrameLayout() {
    $('body').append(t.div('#content')) ;

    let splitPaneRootId = panes.createSplitPaneRoot("#content");

    let {topPaneId: topPaneId, bottomPaneId: bottomPaneId} =
        panes.splitHorizontal($id(splitPaneRootId), {fixedTop: 40});

    let $menubar = $id(topPaneId)
        .addClass('menubar')
        .css({overflow: 'hidden'});

    $id(bottomPaneId).addClass('content-pane');

    setupMenubar($menubar);

    auth.getLoginStatus()
        .then(setUserLoginInfo) ;
}
