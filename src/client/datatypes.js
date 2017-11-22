/**
 * Server interop datatypes
 **/


import * as coords from './coord-sys.js';
import * as _ from  'lodash';

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
    constructor (regionId, bbox, pageId, pageNum, zoneId) {
        this.regionId = regionId;
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
        coords.mk.fromLtwhFloatReps(jsonRep.bbox),
        jsonRep.page.pageId,
        jsonRep.page.pageNum,
        zoneId
    );

}
