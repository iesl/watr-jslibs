/* global require  */

import { globals } from './globals';
import * as _ from 'lodash';
import * as coords from './coord-sys.js';
import * as common from './commons.js';
let rtree = require('rbush');
let knn = require('rbush-knn');
import * as util from  './commons.js';

globals.pageImageRTrees = [];
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
