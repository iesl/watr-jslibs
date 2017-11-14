/**
 * Server interop datatypes
 **/


import * as coords from './coord-sys.js';
import * as _ from  'lodash';

class Zone {
    constructor (zoneId, label, order, regions) {
        this.zoneId = zoneId;
        this.label = label;
        this.order = order;
        this.regions = regions;
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
    return new Zone(
        jsonRep.id,
        jsonRep.label,
        jsonRep.order,
        _.map(jsonRep.regions, (r) => pageRegionFromJson(r, jsonRep.id))
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

