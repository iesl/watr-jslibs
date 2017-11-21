/* global require  */

import { globals } from './globals';
import * as _ from 'lodash';
import * as coords from './coord-sys.js';
import * as $ from 'jquery';
let rtree = require('rbush');
let knn = require('rbush-knn');
import * as util from  './commons.js';


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
    globals.pageImageLabelRTrees = [];

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
        let pageRtree = rtree();

        globals.pageImageLabelRTrees[pageNum] = pageRtree;
        pageRtree.load(pageGroup);
    });
}


export function initPageAndGridRTrees(textgrids) {
    // Assumes that the divs+canvas+svgs are all in place in the DOM
    // initPageImageGlyphRTrees(textgrids);
    _.each(textgrids, (textgrid, gridNum) => {
        let idGen = util.IdGenerator();
        let pageImageRTree = rtree();
        let textGridRTree = rtree();
        globals.pageImageRTrees[gridNum] = pageImageRTree;
        globals.textgridRTrees[gridNum] = textGridRTree;
        let textgridCanvas = $(`#textgrid-canvas-${gridNum}`)[0];
        let context = textgridCanvas.getContext('2d');

        context.font = `normal normal normal ${globals.TextGridLineHeight}px/normal Times New Roman`;

        let gridRowsDataPts = _.map(textgrid.rows, (gridRow, rowNum) => {

            let y = globals.TextGridOriginPt.y + (rowNum * globals.TextGridLineHeight);
            let x = globals.TextGridOriginPt.x;
            let text = gridRow.text;
            let currLeft = x;
            let gridDataPts = _.map(text.split(''), (ch, chi) => {
                let chWidth = context.measureText(ch).width;

                let gridDataPt = coords.mk.fromLtwh(
                    currLeft, y-globals.TextGridLineHeight, chWidth, globals.TextGridLineHeight
                );

                let charLocus = gridRow.loci[chi];
                let charBBox = charLocus[0][1];
                gridDataPt.id = idGen();
                if (charBBox != undefined) {
                    let glyphDataPt = coords.mk.fromArray(charBBox);
                    glyphDataPt.id = gridDataPt.id;
                    glyphDataPt.gridDataPt = gridDataPt;
                    glyphDataPt.page = gridNum;
                    gridDataPt.glyphDataPt = glyphDataPt ;
                }

                // gridDataPt.gridDataPt = gridDataPt;
                gridDataPt.locus = charLocus;
                gridDataPt.gridRow = gridRow;
                gridDataPt.row = rowNum;
                gridDataPt.col = chi;
                gridDataPt.char = ch;
                gridDataPt.page = gridNum;
                currLeft += chWidth;

                return gridDataPt;
            });
            // context.strokeText(text, x, y);
            context.fillText(text, x, y);
            return gridDataPts;
        });

        let pageDataPts = _.flatten(gridRowsDataPts);
        globals.dataPts[gridNum] = pageDataPts;
        textGridRTree.load(pageDataPts);
        let glyphDataPts = _.filter(
            _.map(pageDataPts, p => p.glyphDataPt),
            p =>  p !== undefined
        );

        pageImageRTree.load(glyphDataPts);

    });

}

