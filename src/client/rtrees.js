/* global require  */

import { globals } from './globals';
import * as _ from 'lodash';
import * as coords from './coord-sys.js';
import * as common from './commons.js';
let rtree = require('rbush');
let knn = require('rbush-knn');
import * as util from  './commons.js';

globals.pageImageRTrees = [];
globals.pageImageLabelRTrees = [];

globals.textgridRTrees = [];


export function searchPage(pageNum, queryBox) {
    let pageRTree = globals.pageImageRTrees[pageNum];
    return pageRTree.search(queryBox);
}

export function knnQueryPage(pageNum, queryPoint, k) {
    let pageRTree = globals.pageImageRTrees[pageNum];
    return knn(pageRTree, queryPoint.x, queryPoint.y, k);

}

/** return min-bounding rect for rtree search hits */
export function queryHitsMBR(hits) {
    let minX = _.min(_.map(hits, 'minX')),
        maxX = _.max(_.map(hits, 'maxX')),
        minY = _.min(_.map(hits, 'minY')),
        maxY = _.max(_.map(hits, 'maxY')),
        width = maxX - minX,
        height = maxY - minY
    ;

    return coords.mk.fromLtwh(minX, minY, width, height);
}

export function searchPageLabels(pageNum, queryBox) {
    if (globals.pageImageLabelRTrees[pageNum]) {
        let pageRtree = globals.pageImageLabelRTrees[pageNum];
        return pageRtree.search(queryBox);
    } else {
        return [];
    }
}


export function initPageLabelRTrees(zones) {
    let dataPts = _.flatMap(zones, zone => {
        return _.map(zone.regions, region => {
            let data = region.bbox;
            let selector = `#ann${zone.zoneId}_${region.regionId}`;
            data.id = region.regionId;
            data.pageNum = region.pageNum;
            data.label = zone.label;
            data.title = zone.label;
            data.selector = selector;
            data.zoneId = zone.zoneId;
            return data;
        });
    });


    let groups = _.groupBy(dataPts, p => p.pageNum);

    _.each(groups, pageGroup => {
        let pageNum = pageGroup[0].pageNum;

        globals.pageImageLabelRTrees[pageNum] = rtree();

        let pageRtree = globals.pageImageLabelRTrees[pageNum];

        pageRtree.load(pageGroup);
    });
}
export function initRTrees(textgrids) {
    let idGen = util.IdGenerator();

    _.each(textgrids, (textgrid, gridi) => {
        let pageRTree = rtree();
        globals.pageImageRTrees[gridi] = pageRTree;

        _.each(textgrid.rows, (row, rowi) => {
            let loci = common.filterLoci(row.loci);

            let points = _.map(loci, (loc, ci) =>{
                let headLoc = loc[0];
                let data = coords.mk.fromArray(headLoc[1]);
                data.row = rowi;
                data.col = ci;
                data.char = headLoc[2];
                data.page = headLoc[0];
                data.id = idGen();

                return data;
            });

            pageRTree.load(points);

        });

    });
}
