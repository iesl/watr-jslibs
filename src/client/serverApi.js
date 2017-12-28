/**
 *
 **/

/* global $ */

import {shared} from './shared-state';

export function apiUri(path) {
    return `/api/v1/${path}`;
}

export let api = {
    root: p => apiUri(p),
    labeling: p => apiUri(p)
};



export function getDocumentZones () {
    return new Promise((resolve, reject) => {
        let url = `/api/v1/labeling/zones/${shared.currentDocument}`;
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

export function getCorpusArtifactTextgrid(entryName) {
    let show = "textgrid.json";
    return apiGet(`/api/v1/corpus/artifacts/vtrace/json/${entryName}/${show}`);
}

export function deleteLabels(labelData) {
    return new Promise((resolve, reject) => {
        console.log('labelData', labelData);
        $.ajax({
            url: "/api/v1/labeling/zone",
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

export function apiGet(url) {
    return new Promise((resolve, reject) => {
        $.getJSON(url, (response) => resolve(response))
            .fail((xhr, status, err) => reject("Server Error:" + status + err.message));
    });
}

export function apiPost(url, data) {
    return new Promise((resolve, reject) => {
        $.post({
            url: url,
            data: JSON.stringify(data),
            datatype: 'json',
            contentType: 'application/json',
            method: "POST"
        }, function success (response) {
            resolve(response);
        }).fail(function() {
            reject("Server Error");
        });
    });
}


export function postNewRegionLabel(labelData) {
    return apiPost(apiUri("labeling/zones"), labelData);
}
