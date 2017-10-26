/* global require  */

// import * as d3 from 'd3';
import { globals } from './globals';
import * as _ from 'underscore';
import * as coords from './coord-sys.js';
import * as common from './commons.js';
let rtree = require('rbush');
// let knn = require('rbush-knn');

globals.pageImageRTrees = [];


export function searchPage(pageNum, queryBox) {
    let pageRTree = globals.pageImageRTrees[pageNum];
    return pageRTree.search(queryBox);
}


/** return min-bounding rect for rtree search hits */
export function queryHitsMBR(hits) {
    let minX = _.min(_.pluck(hits, 'minX')),
        maxX = _.max(_.pluck(hits, 'maxX')),
        minY = _.min(_.pluck(hits, 'minY')),
        maxY = _.max(_.pluck(hits, 'maxY')),
        width = maxX - minX,
        height = maxY - minY
    ;

    // TODO return Option[...]
    return coords.mk.fromLtwh(minX, minY, width, height);
}


export function initRTrees(textgrids) {
    console.log('initRTrees??');

    common.d3select.pageImages().each((d, i) =>   {
        let pageRTree = rtree();
        globals.pageImageRTrees[i] = pageRTree;

        _.each(textgrids[i].rows, (row, ri) => {
            let loci = common.filterLoci(row.loci);

            let points = _.map(loci, (loc, ci) =>{
                let headLoc = loc[0];
                let data = coords.mk.fromArray(headLoc[1]);
                data.row = ri;
                data.col = ci;
                data.char = headLoc[2];
                data.page = headLoc[0];

                return data;
            });

            pageRTree.load(points);

        });

    });

}
