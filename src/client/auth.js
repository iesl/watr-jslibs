/**
 *
 **/

/* global $ */

import 'form-serializer';

import * as Cookies from  'js-cookie';

import {makeModal} from './jstags.js';
import {t, htm} from './jstags.js';

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
                        t.button(':submit', '=Login', "Login")
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
    return getAuthedJson('/api/v1/auth/logout')
        .then(() => {
            Cookies.remove("tsec-auth", {path: '/'});
            let data = {
                login: false
            };
            return Promise.resolve(data);
        })
    ;
}


function attemptLogin(loginData) {
    return new Promise((resolve, reject) => {
        console.log('logindata', loginData);
        console.log('asJson', loginData.asJson);
        $.post({
            url: loginData.action,
            data: loginData.asJson,
            datatype: 'json',
            contentType: 'application/json',
            method: "POST"
        }, function(res, status, xhr) {
            resolve(res);
        }).fail((xhr, status, err) => reject("Server Error: status=" + status + "; msg=" + err.message));
    });
}


export function getAuthedJson(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            method: "GET",
            dataFilter: function(data) {
                console.log('dataFilter', data);
                return data;
            }
            // success: (res, status, xhr) => {
            //     // console.log('success', res, status, xhr);
            //     // resolve(res);
            // },
            // error: function(xhr, status, err) {
            //     resolve( { status: 'Unauthorized' } );
            //     // reject("Server Error:" + status + err.message);
            // }
        }).done(function(res, status) {
            console.log('success', res, status);
            resolve(res);

            return '<i />';
        }).fail(function(res) {
            if (res.status == 401) {
               reject ( { status: 'Unauthorized' } );
            } {
                reject ( { status: res.statusText } );
            }
            console.log('fail', res);
            return '<i />';
        }) ;
    });
}


export function getLoginStatus() {
    let authStatus = new Promise((resolve, reject) => {
        let result = { login: false };

        $.ajax({
            url: '/api/v1/auth/status',
            method: "POST"
        }).done(function(res) {
            result.info = res;
            result.login = true;
            // resolve(result);
        }).fail(function(res) {
            result = { status: res.statusText } ;
        }).always(() => {
            resolve(result);
        }) ;
    });

    return authStatus ;
}

export function getCorpusArtifactTextgrid(entryName) {
    return new Promise((resolve, reject) => {
        // let url = `/api/v1/corpus/entries?start=${start}&len=${len}`;
        let show = "textgrid.json";
        let url = `/api/v1/corpus/artifacts/vtrace/json/${entryName}/${show}`;
        $.getJSON(url, (response) => resolve(response))
            .fail((xhr, status, err) => reject("Server Error:" + status + err.message));
    });
}
