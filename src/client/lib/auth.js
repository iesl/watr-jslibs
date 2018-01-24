/**
 *
 **/

/* global $ */

import * as Cookies from  'js-cookie';

import {makeModal} from './jstags.js';
import {t, htm} from './jstags.js';
import * as server from './serverApi.js';

function labeledPasswordInput(label, key) {
    return t.div([
        t.input(':password', `@${key}`, `#${key}`),
        t.label({for: `$key`}, label)
    ]);
}


function loginForm() {
    let forms =
        t.div([
            "Login",
            t.form({action: '/api/v1/auth/login'}, [
                t.div([
                    htm.labeledTextInput('Email', 'email'),
                    labeledPasswordInput('Password', 'password'),
                    t.div([
                        t.button(':submit =Login', "Login")
                    ])
                ]),
            ]),
            "Or Signup",
            t.form({action: '/api/v1/auth/signup'}, [
                t.div([
                    htm.labeledTextInput('Email', 'email'),
                    htm.labeledTextInput('Username', 'username'),
                    labeledPasswordInput('Password', 'password'),
                    t.div([
                        t.button(':submit =Signup', "Signup")
                    ])
                ])
            ])
        ]);

    return forms;
}




function awaitFormData($form) {
    return new Promise((resolve, reject) => {
        let $modalForm = makeModal($form);
        $modalForm.find('.modal-dialog').css({
            'position': 'absolute',
            'left': "100px",
            'top': "100px"
        });

        $modalForm.find('form').submit(function (event) {
            let $thisForm = $(this);
            let resolution = {
                action: event.currentTarget.action,
                asJson: JSON.stringify($thisForm.serializeObject())
            };
            event.preventDefault();
            $('.modal').remove();
            $('.modal-backdrop').remove();
            resolve(resolution);
        });

        $modalForm.modal();
    });
}

export function doLogin() {
    return new Promise((resolve, reject) => {
        awaitFormData(loginForm())
            .then(attemptLogin)
            .then(res => {
                let loginData = {
                    login: true,
                    info: res
                };
                resolve(loginData);
            })
            .catch(err => reject('login error:' + err))
        ;
    });
}

export function doLogout() {
    return server.apiGet(server.apiUri('auth/logout'))
        .then(() => {
            Cookies.remove("tsec-auth", {path: '/'});
            return {
                login: false
            };
        });
}


function attemptLogin(loginData) {
    return server.apiPost(loginData.action, loginData.asJson);
}


export function getLoginStatus() {
    return server.apiGet(server.apiUri('auth/status'))
        .then(response => ({ login: true, info: response }))
        .catch(err => ({ login: false, status: err.statusText }));
}
