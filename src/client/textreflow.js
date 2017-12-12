/**
 *
 *
 **/

/* global require _ $ d3 */

import * as util from  './commons.js';
import * as coords from './coord-sys.js';
import { t } from './jstags.js';
import { $id } from './jstags.js';
import { shared } from './shared-state';
import * as rtrees from  './rtrees.js';
import '../style/view-pdf-text.less';


export function setupReflowControl() {
    let selections = shared.currentSelections;


    let rowData = _.flatMap(selections, sel => {
        let hits = rtrees.searchPage(sel.pageNum, sel);
        console.log('hits', hits);
        let tuples = _.map(hits, hit => {
            let g = hit.gridDataPt;
            return [g.row, g.col, g.gridRow];
        });
        let byRows = _.groupBy(tuples, t => t[0]);

        let clippedGrid = _.map(_.toPairs(byRows), ([rowNum, rowTuples]) => {
            let cols = _.map(rowTuples, t => t[1]);
            let minCol = _.min(cols);
            let maxCol = _.max(cols);
            let gridRow = rowTuples[0][2];
            let text = gridRow.text.slice(minCol, maxCol+1);
            let loci = gridRow.loci.slice(minCol, maxCol+1);

            return [rowNum, text, loci];
        });

        let sortedRows = _.sortBy(clippedGrid, g => g[0]);

        let rowData = _.map(sortedRows, g => {
            return {
                text: g[1],
                loci: g[2]
            };
        });

        return rowData;

    });

    let gridData  = {
        rows: rowData
    };


    let pageNum = shared.pageImageRTrees.length + 1;

    initTextgridDom('reflow-controls', gridData, pageNum)
        .then(() => { return initTextgrid(gridData, document.getElementById(`textgrid-canvas-${pageNum}`)); })
        .then((res) => {
            console.log('res', res);
            let w = res.maxWidth;
            let gridNum = pageNum;
            let frameId  = `textgrid-frame-${gridNum}`;
            let canvasId = `textgrid-canvas-${gridNum}`;
            let svgId    = `textgrid-svg-${gridNum}`;

            $id(frameId).css({width: w});
            // $id(canvasId).css({width: w});
            d3.select(`#${svgId}`).attr('width', w);

        })
    ;



}

// Create SVG + Canvas + Frame Divs
// gridNum is either the page number (for page text grids) or a unique number > largest page#
function initTextgridDom(containerId, textgrid, gridNum) {
    return new Promise((resolve) => {
        let initWidth = 500;

        let computeGridHeight = (grid) => {
            return (grid.rows.length * shared.TextGridLineHeight) + shared.TextGridOriginPt.y + 10;
        };

        let gridHeight = computeGridHeight(textgrid);
        let frameId  = `textgrid-frame-${gridNum}`;
        let canvasId = `textgrid-canvas-${gridNum}`;
        let svgId    = `textgrid-svg-${gridNum}`;

        let gridNodes =
            t.div(`.textgrid #${frameId}`, {style: `width: ${initWidth}; height: ${gridHeight}`}, [
                t.canvas(`.textgrid #${canvasId}`, {page: gridNum, width: initWidth, height: gridHeight})
            ]) ;

        $id(containerId).append(gridNodes);

        d3.select('#'+frameId)
            .append('svg').classed('textgrid', true)
            .datum(textgrid)
            .attr('id', `${svgId}`)
            .attr('page', gridNum)
            .attr('width', initWidth)
            .attr('height', gridHeight)
            .call(() => resolve())
        ;

    });

}

function initTextgrid(textgridDef, gridCanvas) {
    let idGen = util.IdGenerator();
    let context = gridCanvas.getContext('2d');
    console.log('textgridDef ', textgridDef);

    context.font = `normal normal normal ${shared.TextGridLineHeight}px/normal Times New Roman`;

    let maxWidth = 0;

    let gridData = _.flatMap(textgridDef.rows, (gridRow, rowNum) => {
        console.log('init row', gridRow);

        let y = shared.TextGridOriginPt.y + (rowNum * shared.TextGridLineHeight);
        let x = shared.TextGridOriginPt.x;
        let text = gridRow.text;
        let currLeft = x;
        let gridDataPts = _.map(text.split(''), (ch, chi) => {
            let chWidth = context.measureText(ch).width;
            let charDef = gridRow.loci[chi];
            let charPage = charDef.g ? charDef.g[0][1] : charDef.i[1];

            let gridDataPt = coords.mk.fromLtwh(
                currLeft, y-shared.TextGridLineHeight, chWidth, shared.TextGridLineHeight
            );

            gridDataPt.id = idGen();
            gridDataPt.gridRow = gridRow;
            gridDataPt.row = rowNum;
            gridDataPt.col = chi;
            gridDataPt.char = ch;
            gridDataPt.page = charPage;
            gridDataPt.locus = charDef;

            let isGlyphData = charDef.g != undefined;
            if (isGlyphData) {
                let charBBox = charDef.g[0][2];
                let glyphDataPt = coords.mk.fromArray(charBBox);
                glyphDataPt.id = gridDataPt.id;
                glyphDataPt.gridDataPt = gridDataPt;
                glyphDataPt.page = charPage;
                glyphDataPt.locus = charDef;
                gridDataPt.glyphDataPt = glyphDataPt;
            }

            currLeft += chWidth;

            return gridDataPt;
        });
        maxWidth = Math.max(maxWidth, currLeft);
        context.fillText(text, x, y);
        return gridDataPts;
    });

    let glyphDataPts = _.filter(
        _.map(gridData, p => p.glyphDataPt),
        p =>  p !== undefined
    );

    let result = {
        gridDataPts: gridData,
        glyphDataPts: glyphDataPts,
        maxWidth: maxWidth
    };

    return result;
}
