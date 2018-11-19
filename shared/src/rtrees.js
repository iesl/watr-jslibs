/* global require */
import * as _ from 'lodash';
import * as $ from 'jquery';
import { shared } from './shared-state';
import * as coords from './coord-sys';
let rtree = require('rbush');
import * as util from './utils';
/** return min-bounding rect for rtree search hits */
export function queryHitsMBR(hits) {
    let minX = _.min(_.map(hits, 'minX')), maxX = _.max(_.map(hits, 'maxX')), minY = _.min(_.map(hits, 'minY')), maxY = _.max(_.map(hits, 'maxY')), width = maxX - minX, height = maxY - minY;
    return coords.mk.fromLtwh(minX, minY, width, height);
}
export function searchPageLabels(pageNum, queryBox) {
    if (shared.pageImageLabelRTrees[pageNum]) {
        let pageRtree = shared.pageImageLabelRTrees[pageNum];
        return pageRtree.search(queryBox);
    }
    else {
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
    _.each(textgrids, (textgrid, gridNum) => {
        let idGen = util.newIdGenerator();
        let pageImageRTree = rtree();
        let textGridRTree = rtree();
        shared.pageImageRTrees[gridNum] = pageImageRTree;
        shared.textgridRTrees[gridNum] = textGridRTree;
        let textgridCanvas = $(`#textgrid-canvas-${gridNum}`)[0];
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
                let gridDataPt = coords.mk.fromLtwh(currLeft, y - shared.TextGridLineHeight, chWidth, shared.TextGridLineHeight);
                gridDataPt.id = idGen();
                gridDataPt.gridRow = gridRow;
                gridDataPt.row = rowNum;
                gridDataPt.col = chi;
                gridDataPt.char = ch;
                gridDataPt.page = gridNum;
                gridDataPt.locus = charDef;
                charDef.gridDataPt = gridDataPt;
                // let isGlyphData = typeof charDef[0] === typeof [];
                let isGlyphData = charDef.g !== undefined;
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
            try {
                context.fillText(text, x, y);
            }
            catch (error) {
                console.log('error', error);
            }
            return gridDataPts;
        });
        let pageDataPts = _.flatten(gridRowsDataPts);
        shared.dataPts[gridNum] = pageDataPts;
        textGridRTree.load(pageDataPts);
        let glyphDataPts = _.filter(_.map(pageDataPts, p => p.glyphDataPt), p => p !== undefined);
        pageImageRTree.load(glyphDataPts);
    });
}
export function gridDataToGlyphData(gridDataPts) {
    return _.filter(_.map(gridDataPts, p => p.glyphDataPt), p => p !== undefined);
}
export function initGridData(textgrids, canvasContexts, gridTextOrigin, gridTextHeight) {
    return _.map(textgrids, (textgrid, gridNum) => {
        let idGen = util.newIdGenerator();
        let context;
        if (canvasContexts !== undefined) {
            context = canvasContexts[gridNum];
        }
        else {
            context = {
                measureText: () => 10,
                fillText: () => { }
            };
        }
        if (gridTextHeight === undefined) {
            gridTextHeight = 20;
        }
        if (gridTextOrigin === undefined) {
            gridTextOrigin = coords.mkPoint.fromXy(0, 0);
        }
        let gridRowsDataPts = _.map(textgrid.rows, (gridRow, rowNum) => {
            let y = gridTextOrigin.y + (rowNum * gridTextHeight);
            let x = gridTextOrigin.x;
            let text = gridRow.text;
            let currLeft = x;
            let gridDataPts = _.map(text.split(''), (ch, chi) => {
                let chWidth = context.measureText(ch).width;
                let charDef = gridRow.loci[chi];
                let gridDataPt = coords.mk.fromLtwh(currLeft, y - gridTextHeight, chWidth, gridTextHeight);
                gridDataPt.id = idGen();
                gridDataPt.gridRow = gridRow;
                gridDataPt.row = rowNum;
                gridDataPt.col = chi;
                gridDataPt.char = ch;
                gridDataPt.page = gridNum;
                gridDataPt.locus = charDef;
                charDef.gridDataPt = gridDataPt;
                let isGlyphData = charDef.g !== undefined;
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
            try {
                context.fillText(text, x, y);
            }
            catch (error) {
                console.log('error', error);
            }
            return gridDataPts;
        });
        return _.flatten(gridRowsDataPts);
    });
}
//# sourceMappingURL=rtrees.js.map