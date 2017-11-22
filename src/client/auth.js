/**
 *
 **/

import * as $ from  'jquery';
import Cookies from  'js-cookie';

import {makeModal} from './jstags.js';
import {t} from './jstags.js';

export function loginForm() {
    let form =
        t.form({action: '/api/v1/auth/login', method: 'POST', enctype:'multipart/form-data'}, [
            t.div([
                t.label('Username'),
                t.input(':text', '@username', '#username')
            ]),
            t.div([
                t.label('Password'),
                t.input(':password', '@password', '#password')
            ]),
            t.div([
                t.input(':submit', '=Login')
            ])
        ]);

    return form;
}

function awaitFormData($form) {
    return new Promise((resolve, reject) => {
        let $modalForm = makeModal($form);
        $modalForm.find('.modal-dialog').css({
            'position': 'absolute',
            'left': "100px",
            'top': "100px"
        });
        $form.submit(function (event) {
            event.preventDefault();
            $('.modal').remove();
            $('.modal-backdrop').remove();
            resolve($form.serialize());
        });
        $modalForm.modal();
    });
}

function registerLogin(loginData) {
    console.log('registerLogin', loginData);
}

export function doLogin() {
    console.log('doLogin');
    let authCookie = Cookies.get('authcookie');
    console.log('authcookie', authCookie);
    return new Promise((resolve, reject) => {
        let $loginForm = loginForm();

        awaitFormData($loginForm)
            .then(formData => attemptLogin(formData))
            .then(loginData => {
                console.log('authcookie2', authCookie);
                registerLogin(loginData);
                resolve('Ok');
            })
            .catch(err => reject('login error:' + err))
        ;

    });
}

function attemptLogin(loginData) {
    console.log('attemptLogin', loginData);
    return new Promise((resolve, reject) => {
        $.post({
            url: "/api/v1/auth/login",
            data: loginData,
            datatype: 'json',
            contentType: 'application/x-www-form-urlencoded',
            method: "POST"
        }, function(res) {
            resolve(res);
        }).fail((xhr, status, err) => reject("Server Error:" + status + err.message));
    });
}
