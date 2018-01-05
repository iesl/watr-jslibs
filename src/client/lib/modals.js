/**
 * Modal dialogs, as per:
 *    https://www.w3schools.com/howto/howto_css_modals.asp
 *
 * These dialogs are wrapped in promises for control flow.
 */

/* global $ */

import {t, icon, $id} from './jstags.js';


export function makeFormPromise($form) {
    return new Promise((resolve) => {

        $form.submit(function (event) {
            event.preventDefault();
            let $thisForm = $(this);
            let resolution = $thisForm.serializeObject();
            resolve(resolution);
        });

    });
}


export function makeModalPromise(context, innerPromise, body, header, footer) {
    return new Promise((resolve, reject) => {
        let $modal =
            t.div('#the-modal', '.b-modal-backdrop', [
                t.div('.b-modal-content', [
                    t.div('.b-modal-header', [
                        t.span("#the-modal-close", ".b-modal-close", icon.fa('close') ),
                        header
                    ]),
                    t.div('.b-modal-body', [body]),
                    t.div('.b-modal-footer', [footer])
                ])
            ])
        ;

        $(context).append($modal);

        let modal = document.getElementById('the-modal');
        let closeBtn = document.getElementById("the-modal-close");

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                $modal.remove();
                reject();
            }
        };

        closeBtn.onclick = function() {
            $modal.remove();
            reject();
        };

        // Resolve iff the inner promise resolves, else reject
        innerPromise
            .then(data => {
                $modal.remove();
                resolve(data);
            })
            .catch(() => {
                $modal.remove();
                reject();
            }) ;

    });
}
