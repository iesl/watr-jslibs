/**
 * Server interop datatypes
 **/

/* global _ require */

import * as coords from './coord-sys.js';

/**
 *
 *
 * GridData   :: { rows: [Row] }
 * Row        :: [Cell]
 * Cell       :: {bio: [], g: G, gridDataPt: GridDataPt}
 *             | {bio: [], i: I, gridDataPt}
 * G          :: [charloc,..... ]
 * I          :: charloc
 * Charloc    :: ['c', 0, bbox]
 * Bbox       ::[l, t, w, h]
 * GridDataPt ::
 *
 */


// class Assignment {
//     constructor (zonelock) {
//         // this.workflow = workflow;
//         this.zonelock = zonelock;
//         // this.zone = zone;
//     }
//     // constructor (workflow, zonelock, zone) {
//     //     this.workflow = workflow;
//     //     this.zonelock = zonelock;
//     //     this.zone = zone;
//     // }
// }

export function assignmentsFromJson(jsonReps) {
    return _.map(jsonReps, js=> {
        let {document, holder, id, lockPath, status} = js;
        // let y = zonelockFromJson(assignmentJson.zonelock);
        // let z = zoneFromJson(assignmentJson.zone);
        // y.assignee = assignmentJson.assignee;
        return js;
    });
}

class Workflow {
    constructor (slug, description, targetLabel, curatedLabels) {
        this.slug          = slug;
        this.description   = description;
        this.targetLabel   = targetLabel;
        this.curatedLabels = curatedLabels;
    }

}

export function workflowFromJson(jsonRep) {
    return new Workflow(
        jsonRep.workflow,
        jsonRep.description,
        jsonRep.targetLabel,
        jsonRep.curatedLabels
    );
}

// class ZoneLock {
//     constructor (id, assignee, status, workflow, zone) {
//         this.id = id;
//         this.assignee = assignee;
//         this.status = status;
//         this.workflow = workflow;
//         this.zone = zone;
//     }
// }
// export function zonelockFromJson(jsonRep) {
//     return new ZoneLock(
//         jsonRep.id,
//         jsonRep.assignee,
//         jsonRep.status,
//         jsonRep.workflow,
//         jsonRep.zone
//     );
// }

class Zone {
    constructor (zoneId, label, order, regions, glyphDefs) {
        this.zoneId = zoneId;
        this.label = label;
        this.order = order;
        this.regions = regions;
        this.glyphDefs = glyphDefs;
    }

}

class PageRegion {
    constructor (regionId, stableId, bbox, pageId, pageNum, zoneId) {
        this.regionId = regionId;
        this.stableId = stableId;
        this.bbox = bbox;
        this.pageId = pageId;
        this.pageNum = pageNum;
        this.zoneId = zoneId;
    }
}


export function zoneFromJson(jsonRep) {
    let glyphDefs = null;
    if (jsonRep.glyphDefs !== null) {
        glyphDefs = JSON.parse(jsonRep.glyphDefs);
    }
    return new Zone(
        jsonRep.id,
        jsonRep.label,
        jsonRep.order,
        _.map(jsonRep.regions, (r) => pageRegionFromJson(r, jsonRep.id)),
        glyphDefs
    );

}

export function pageRegionFromJson(jsonRep, zoneId) {
    return new PageRegion(
        jsonRep.regionId,
        jsonRep.page.stableId,
        coords.mk.fromLtwhFloatReps(jsonRep.bbox),
        jsonRep.page.pageId,
        jsonRep.page.pageNum,
        zoneId
    );

}
