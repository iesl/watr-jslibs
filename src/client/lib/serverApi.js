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




export function getCorpusListing(start, len) {
    return new Promise((resolve, reject) => {
        let url = `/api/v1/corpus/entries?start=${start}&len=${len}`;
        $.getJSON(url, (response) => resolve(response))
            .fail((xhr, status, err) => reject("Server Error:" + status + err.message));
    });
}

export function getCorpusArtifactTextgrid(entryName) {
    // let show = "textgrid.json";
    // return apiGet(`/api/v1/corpus/artifacts/vtrace/json/${entryName}/${show}`);
    return apiGet(`/api/v1/corpus/artifacts/entry/${entryName}/text`);
}

export function deleteZone(zoneId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/api/v1/labeling/zones/${zoneId}`,
            datatype: 'json',
            contentType: 'application/json',
            method: "DELETE",
            success: function(res) {
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
        }).fail((xhr, status, err) => {
            reject("Server Error: status=" + status + "; msg=" + err.message);
        });
    });
}


export function createNewZone(labelData) {
    // TODO: Append to Annotation table rather than zone table
    return apiPost(apiUri("labeling/zones"), labelData);
}

export function getDocumentZones () {
    return apiGet(apiUri(`labeling/zones/${shared.currentDocument}`));
}
