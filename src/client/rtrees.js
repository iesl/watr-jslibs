/* global require  */

import * as d3 from 'd3';
import * as $ from 'jquery';
import { globals } from './globals';
import * as _ from 'underscore';
import * as coords from './coord-sys.js';
import * as common from './commons.js';
let rtree = require('rbush');
let knn = require('rbush-knn');

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

    // common.d3select.pageTextgrids().each(function (textGridData, gridIndex) {
    //     let d3$textgrid = d3.select(this);

    //     let textgridRTree = rtree();
    //     globals.textgridRTrees[gridIndex] = textgridRTree;

    //     // console.log('d3$textgrid, i:', i, d3$textgrid);
    //     // console.log('textGridData', textGridData);
    //     // console.log('node', node);
    //     // console.log('textgrid pos', pos);

    //     let textgridSvgPos = $(d3$textgrid.node()).position();
    //     let data = [];

    //     console.log('init-ing page', gridIndex, ', rows', textGridData.rows.length);
    //     d3$textgrid.selectAll('.gridrow').each(function (rowdata, rowIndex) {
    //         // let d3$gridrow = d3.select(this);
    //         // let rowdata = textGridData[rowIndex];

    //         let rowLoci = common.filterLoci(rowdata.loci);
    //         let thisRow = $(this);

    //         // thisRow.children('tspan').each(function (charIndex, asdf) {
    //         //     // console.log('charIndex', charIndex, 'asdf', asdf);
    //         //     let $thisChar = $(asdf);
    //         //     let celldata = rowLoci[charIndex];
    //         //     let charPos = $thisChar.position();

    //         //     //     let $node = $(d3$tspan.node());
    //         //     let left = charPos.left - textgridSvgPos.left;
    //         //     let top = charPos.top + textgridSvgPos.top;
    //         //     let datum = coords.mk.fromLtwh(
    //         //         left, top, $thisChar.width(), $thisChar.height()
    //         //     );
    //         //     datum.loci = celldata;
    //         //     datum.text = $thisChar.text();
    //         //     datum.charIndex = charIndex;
    //         //     data.push(datum);

    //         // });

    //         // console.log('init-ing page', gridIndex, ', row', rowIndex);


    //         // d3$gridrow.selectAll('tspan').each(function (chData, charIndex) {
    //         //     let d3$tspan = d3.select(this);
    //         //     let celldata = rowLoci[charIndex];

    //         //     let $node = $(d3$tspan.node());
    //         //     let charPos = $($node).position();
    //         //     let datum = coords.mk.fromLtwh(
    //         //         charPos.left, charPos.top, $node.width(), $node.height()
    //         //     );

    //         //     datum.loci = celldata;
    //         //     data.push(datum);
    //         // });
    //     });
    //     console.log('init data', data);
    //     textgridRTree.load(data);
    // });

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
