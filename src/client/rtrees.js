/* global require _ $  */

import { shared } from './shared-state';
import * as coords from './coord-sys.js';
let rtree = require('rbush');
let knn = require('rbush-knn');
import * as util from  './commons.js';

export function searchPage(pageNum, queryBox) {
    let pageRTree = shared.pageImageRTrees[pageNum];
    return pageRTree.search(queryBox);
}

export function knnQueryPage(pageNum, queryPoint, k) {
    let pageRTree = shared.pageImageRTrees[pageNum];
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
    if (shared.pageImageLabelRTrees[pageNum]) {
        let pageRtree = shared.pageImageLabelRTrees[pageNum];
        return pageRtree.search(queryBox);
    } else {
        return [];
    }
}


export function initPageLabelRTrees(zones) {
    shared.pageImageLabelRTrees = [];

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

        shared.pageImageLabelRTrees[pageNum] = pageRtree;
        pageRtree.load(pageGroup);
    });
}


export function initPageAndGridRTrees(textgrids) {
    // Assumes that the divs+canvas+svgs are all in place in the DOM
    // initPageImageGlyphRTrees(textgrids);
    // console.log('textgrids', textgrids);
    _.each(textgrids, (textgrid, gridNum) => {
        let idGen = util.IdGenerator();
        let pageImageRTree = rtree();
        let textGridRTree = rtree();
        shared.pageImageRTrees[gridNum] = pageImageRTree;
        shared.textgridRTrees[gridNum] = textGridRTree;
        let textgridCanvas = $(`#textgrid-canvas-${gridNum}`)[0];
        // console.log('initing', gridNum, textgrid);
        // console.log('curr pageImageRTrees', shared.pageImageRTrees);
        // console.log('curr textGridRTrees', shared.textgridRTrees);
        let context = textgridCanvas.getContext('2d');

        context.font = `normal normal normal ${shared.TextGridLineHeight}px/normal Times New Roman`;

        let gridRowsDataPts = _.map(textgrid.rows, (gridRow, rowNum) => {

            let y = shared.TextGridOriginPt.y + (rowNum * shared.TextGridLineHeight);
            let x = shared.TextGridOriginPt.x;
            let text = gridRow.text;
            let currLeft = x;
            let gridDataPts = _.map(text.split(''), (ch, chi) => {
                let chWidth = context.measureText(ch).width;
                let charDef = gridRow.loci[chi];

                let gridDataPt = coords.mk.fromLtwh(
                    currLeft, y-shared.TextGridLineHeight, chWidth, shared.TextGridLineHeight
                );

                gridDataPt.id = idGen();
                gridDataPt.gridRow = gridRow;
                gridDataPt.row = rowNum;
                gridDataPt.col = chi;
                gridDataPt.char = ch;
                gridDataPt.page = gridNum;
                gridDataPt.locus = charDef;
                charDef.gridDataPt = gridDataPt;


                // let isGlyphData = typeof charDef[0] == typeof [];
                let isGlyphData = charDef.g != undefined;
                if (isGlyphData) {
                    let charBBox = charDef.g[0][2];
                    let glyphDataPt = coords.mk.fromArray(charBBox);
                    glyphDataPt.id = gridDataPt.id;
                    glyphDataPt.gridDataPt = gridDataPt;
                    glyphDataPt.page = gridNum;
                    glyphDataPt.locus = charDef;
                    gridDataPt.glyphDataPt = glyphDataPt;
                }

                currLeft += chWidth;

                return gridDataPt;
            });
            // context.strokeText(text, x, y);
            context.fillText(text, x, y);
            return gridDataPts;
        });

        let pageDataPts = _.flatten(gridRowsDataPts);
        shared.dataPts[gridNum] = pageDataPts;
        textGridRTree.load(pageDataPts);
        let glyphDataPts = _.filter(
            _.map(pageDataPts, p => p.glyphDataPt),
            p =>  p !== undefined
        );

        pageImageRTree.load(glyphDataPts);

    });

}

