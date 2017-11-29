/**
 *
 **/

/* global global */

import * as $ from  'jquery';
import * as JWT from  'jwt-client';
import 'form-serializer';

import Cookies from  'js-cookie';

import {makeModal} from './jstags.js';
import {t} from './jstags.js';

JWT.defaults = {
    // Local storage key used to store the token
    key: 'JWT_TOKEN',
    // Http header prefix
    tokenPrefix: 'Bearer ',
    // Where to store the token, by default localStorage
    storage: global.localStorage,
    // In Base64 url-safe mode, padding isn't mandatory, so we will disable it by default
    // but you can force it by setting this param to true if you want
    padding: false
};

function labeledPasswordInput(label, key) {
    return t.div([
        t.input(':password', `@${key}`, `#${key}`),
        t.label({for: `$key`}, label)
    ]);
}
function labeledTextInput(label, key) {
    return t.div([
        t.input(':text', `@${key}`, `#${key}`),
        t.label({for: `$key`}, label)
    ]);
}
function loginForm() {
    let forms =
        t.div([
            "Login",
            t.form({action: '/api/v1/auth/login'}, [
                t.div([
                    labeledTextInput('Email', 'email'),
                    labeledPasswordInput('Password', 'password'),
                    t.div([
                        t.button(':submit', '=Login', "Login")
                    ])
                ]),
            ]),
            "Or Signup",
            t.form({action: '/api/v1/auth/signup'}, [
                t.div([
                    labeledTextInput('Email', 'email'),
                    labeledTextInput('Username', 'username'),
                    labeledPasswordInput('Password', 'password'),
                    t.div([
                        t.button(':submit', '=Signup', "Signup")
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

function registerLogin(loginData) {
    console.log('registerLogin', loginData);
}

function authenticateUser() {
    return new Promise((resolve, reject) => {
        let currJwt = JWT.remember();
        console.log('currJwt', currJwt);

        // Either:
        //  No token -> user login UI
        //  Invalid/expired token  -> forget & user login UI
        //  Valid token -> resolve w/ token payload info

        if (currJwt != null) {
            resolve(currJwt.claim);
        } else {
            let $loginForm = loginForm();

            awaitFormData($loginForm)
                .then(formData => attemptLogin(formData))
                .then(loginData => {
                    registerLogin(loginData);
                    resolve('Ok');
                })
                .catch(err => reject('login error:' + err))
            ;

        }


    });
}

export function doLogin() {
    console.log('doLogin');
    // let authCookie = Cookies.get('authcookie');
    // console.log('authcookie', authCookie);
    authenticateUser();
    // return new Promise((resolve, reject) => {
    //     let $loginForm = loginForm();

    //     awaitFormData($loginForm)
    //         .then(formData => attemptLogin(formData))
    //         .then(loginData => {
    //             console.log('authcookie2', authCookie);
    //             registerLogin(loginData);
    //             resolve('Ok');
    //         })
    //         .catch(err => reject('login error:' + err))
    //     ;

    // });
}

function recordJwtBackedSession(result, resolve, xhr) {
    // let hdrs = xhr.getAllResponseHeaders();
    let bearer = xhr.getResponseHeader('Bearer');
    let jwtValue = JWT.read(bearer);
    console.log('hdrs:bearer', bearer);

    if (JWT.validate(jwtValue)) {
        JWT.keep(jwtValue);
        resolve(result);
    } else {
        JWT.forget();
    }
}

function recordCookieBackedSession(result, resolve, xhr) {
    let cookie = Cookies.get("tsec-auth");
}

function attemptLogin(loginData) {
    console.log('attemptLogin', loginData);
    return new Promise((resolve, reject) => {
        $.post({
            url: loginData.action,
            data: loginData.asJson,
            datatype: 'json',
            contentType: 'application/json',
            method: "POST"
        }, function(res, status, xhr) {
            // recordJwtBackedSession(res, resolve, xhr);
            recordCookieBackedSession(res, resolve, xhr);
        }).fail((xhr, status, err) => reject("Server Error: status=" + status + "; msg=" + err.message));
    });
}
