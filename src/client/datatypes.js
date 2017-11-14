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
    constructor (regionId, bbox, pageId, pageNum) {
        this.regionId = regionId;
        this.bbox = bbox;
        this.pageId = pageId;
        this.pageNum = pageNum;
    }
}


export function zoneFromJson(jsonRep) {
    return new Zone(
        jsonRep.id,
        jsonRep.label,
        jsonRep.order,
        _.map(jsonRep.regions, (r) => pageRegionFromJson(r))
    );

}

export function pageRegionFromJson(jsonRep) {
    return new PageRegion(
        jsonRep.regionId,
        coords.mk.fromLtwhFloatReps(jsonRep.bbox),
        jsonRep.page.pageId,
        jsonRep.page.pageNum
    );

}

