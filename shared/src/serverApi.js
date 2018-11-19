/**
 *
 **/
/* global $ */
import { shared } from './shared-state';
import * as schema from './schemas';
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
export function getTracelog(entryName) {
    return apiGet(`/api/v1/corpus/artifacts/entry/${entryName}/tracelog/tracelog.json`);
}
export function getCorpusArtifactTextgrid(entryName) {
    return apiGet(`/api/v1/corpus/artifacts/entry/${entryName}/text`);
}
export function deleteZone(zoneId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/api/v1/labeling/zones/${zoneId}`,
            datatype: 'json',
            contentType: 'application/json',
            method: "DELETE",
            success: function (res) {
                resolve(res);
            },
            error: function (xhr, status, err) {
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
        }, function success(response) {
            resolve(response);
        }).fail((xhr, status, err) => {
            reject("Server Error: status=" + status + "; msg=" + err.message);
        });
    });
}
export function createNewZone(labelData) {
    return apiPost(apiUri("labeling/zones"), labelData)
        .then(schema.isValid('Annotation'));
}
export function getDocumentAnnotations() {
    return apiGet(apiUri(`labeling/zones/${shared.currentDocument}`))
        .then(res => {
        console.log('getDocumentAnnotations', res);
        return schema.allValid('Annotation')(res);
    });
}
function curationUri(path) {
    return apiUri(`workflow/${path}`);
}
export let rest = {
    create: {
        workflow: (slug, desc, label) => {
            let data = {
                workflow: slug,
                description: desc,
                labelSchemas: label
            };
            return apiPost(curationUri('workflows'), data);
        },
        assignment: (slug) => {
            return apiPost(curationUri(`workflows/${slug}/assignments`));
        }
    },
    read: {
        workflows: () => apiGet(curationUri('workflows')),
        report: (workflowId) => apiGet(curationUri(`workflows/${workflowId}/report`)),
        zone: (zoneId) => apiGet(curationUri(`zones/${zoneId}`))
    },
    update: {
        status: (assignId, statusCode) => {
            let data = {
                update: { StatusUpdate: { status: statusCode } }
            };
            return apiPost(curationUri(`assignments/${assignId}`), data);
        }
    }
};
//# sourceMappingURL=serverApi.js.map