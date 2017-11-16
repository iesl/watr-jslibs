/**
 *
 **/

import * as $ from  'jquery';

import {globals} from './globals';

export function getAnnotations() {
    return new Promise((resolve, reject) => {
        let url = `/api/v1/labeling/labels/${globals.currentDocument}`;
        $.getJSON(
            url, (response) => resolve(response)
        ).fail((xhr, status, err) => reject("Server Error:" + status + err.message));
    });
}

export function getCorpusListing(start, len) {
    return new Promise((resolve, reject) => {
        let url = `/api/v1/corpus/entries?start=${start}&len=${len}`;
        $.getJSON(url, (response) => resolve(response))
            .fail((xhr, status, err) => reject("Server Error:" + status + err.message));
    });
}

export function getLabelingPanelWidget() {

    let labelNames = [
        'Title',
        'Authors',
        'Abstract',
        'Affiliations',
        'References'
    ];

    let reqData = {
        labels: labelNames,
        description: "Some Desc"
    };

    return new Promise((resolve, reject) => {
        $.post({
            url: "/api/v1/labeling/ui/labeler",
            data: JSON.stringify(reqData),
            contentType: 'application/json',
            method: "POST"
        }, function success (labelerHtml) {
            resolve(labelerHtml);

        }).fail(function() {
            reject("Server Error");
        });
    });
}

export function postNewLabel(labelData) {
    return new Promise((resolve, reject) => {
        $.post({
            url: "/api/v1/labeling/label",
            data: JSON.stringify(labelData),
            datatype: 'json',
            contentType: 'application/json',
            method: "POST"
        }, function(res) {
            resolve(res);
        }).fail((xhr, status, err) => reject("Server Error:" + status + err.message));
    });
}

export function deleteLabels(labelData) {
    return new Promise((resolve, reject) => {
        console.log('labelData', labelData);
        $.ajax({
            url: "/api/v1/labeling/label",
            data: JSON.stringify(labelData),
            datatype: 'json',
            contentType: 'application/json',
            method: "DELETE",
            success: function(res) {
                console.log('deleteLabels: succ', res);
                resolve(res);
            },
            error: function(xhr, status, err) {
                reject("Server Error:" + status + err.message);
            }
        });
    });
}
