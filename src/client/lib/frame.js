/* global require $ _ */

// import * as panes from  './splitpane-utils.js';
import {$id, t} from './jstags.js';
import * as auth from './auth.js';
import {shared} from './shared-state';
import * as SplitWin from  '../lib/SplitWin.js';


function siteNavMenu() {
    let pages = [
        ['Browse', '/'],
        ['Curate', '/curate']
    ];
    let choices = _.map(
        _.filter(pages, p => p[0] != shared.page),
        p => {
            return t.a({href: '/'}, p), t.a({href: p[1]}, p[0]);
        });

    let withSpaces = _.drop(
        _.flatten(
            _.zip(
                _.times(choices.length, _.constant(t.nbsp(2))),
                choices
            )
        )
    );


    let $menu = t.span("#nav-links", '.topbar-item-nav', withSpaces) ;

    return $menu;
}

function setupMenubar($menubar) {

    let $page = t.span('.topbar-item-head', shared.page);
    $menubar.append($page);
    let $nav = siteNavMenu() ;
    $menubar.append($nav);

    $menubar.append(t.span('.topbar-item-middle'));
    $menubar.append(t.span('.user-info .topbar-item-last'));

    return $menubar;
}

function setUserInfo(loginInfo) {
    shared.loginInfo = loginInfo.info;
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
    let link = t.a('.topbar-item-last', {href: '/login'}, "Login");
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
    let link = t.a('.topbar-item-last', {href: '/logout'}, "Logout");
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

function setupSplitFrame() {
    $('body').append(t.div('#content', [
        t.div('#topbar .topbar'),
        t.div('#content-pane .content-pane'),
    ])) ;



    let $menubar = $id('topbar')
        .css({overflow: 'hidden'});

    setupMenubar($('#topbar'));

}

export function setupFrameLayout() {
    setupSplitFrame();

    auth.getLoginStatus()
        .then(setUserLoginInfo) ;

}
