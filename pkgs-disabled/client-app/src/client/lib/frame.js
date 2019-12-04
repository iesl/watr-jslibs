/* global require  */

import * as $ from 'jquery';
import * as _ from 'lodash';
import {t} from "./tstags";
import * as auth from './auth';
import {shared} from './shared-state';
import * as server from './serverApi';
const rest = server.rest;


function siteNavMenu() {
  let pages = [
    ['Browse', '/'],
    ['Curate', '/curate']
  ];
  let choices = _.map(
    _.filter(pages, p => p[0] !== shared.page),
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


export function setupFrameLayout() {
  let layout =
      t.div(`.main`, [
        t.div(`.menu`, [
          t.div(`.topbar`)
        ]),
        t.div(`.content #main-content`)
      ]);

  $('body').append(layout) ;

  setupMenubar($('.topbar'));

  auth.getLoginStatus()
    .then(setUserLoginInfo) ;

  rest.read.workflows() .then(workflows => {
    shared.curations = workflows;
  });

}
