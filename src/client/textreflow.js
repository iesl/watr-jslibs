/**
 *
 *
 **/

/* global require _ $ d3 */

import * as util from  './commons.js';
import * as coords from './coord-sys.js';
import * as viewtext from './view-pdf-text.js';
import { t } from './jstags.js';
import { $id, resizeCanvas } from './jstags.js';
import { shared } from './shared-state';
import * as rtrees from  './rtrees.js';

let rtree = require('rbush');
let knn = require('rbush-knn');

import '../style/view-pdf-text.less';

function getTextgridClippedToCurrentSelection() {
    let selections = shared.currentSelections;

    let rowData = _.flatMap(selections, sel => {
        let hits = rtrees.searchPage(sel.pageNum, sel);

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

    return {
        rows: rowData
    };
}


export function setupReflowControl() {
    let gridData = getTextgridClippedToCurrentSelection();

    let pageNum = shared.pageImageRTrees.length + 1;

    let reflowWidget = new TextReflowWidget('reflow-controls', gridData, pageNum);
    reflowWidget.init().then(result => {
        return result;
    }) ;
}

class TextReflowWidget {

    constructor (containerId, gridData, gridNum) {
        this.containerId = containerId;
        this.gridData = gridData;
        this.gridNum = gridNum;

        this.frameId  = `textgrid-frame-${gridNum}`;
        this.canvasId = `textgrid-canvas-${gridNum}`;
        this.svgId    = `textgrid-svg-${gridNum}`;
    }

    init () {

        return new Promise((resolve) => {
            let initWidth = 500;

            let computeGridHeight = (grid) => {
                return (grid.rows.length * shared.TextGridLineHeight) + shared.TextGridOriginPt.y + 10;
            };

            let gridHeight = computeGridHeight(this.gridData);

            let gridNodes =
                t.div(`.textgrid #${this.frameId}`, {style: `width: ${initWidth}; height: ${gridHeight}`}, [
                    t.canvas(`.textgrid #${this.canvasId}`, {page: this.gridNum, width: initWidth, height: gridHeight})
                ]) ;

            $id(this.containerId).append(gridNodes);

            this.d3$textgridSvg = d3.select('#'+this.frameId)
                .append('svg').classed('textgrid', true)
                .datum(this.gridData)
                .attr('id', `${this.svgId}`)
                .attr('page', this.gridNum)
                .attr('width', initWidth)
                .attr('height', gridHeight)
                .call(() => resolve())
            ;

        }).then(() => {
            let canvas = document.getElementById(this.canvasId);
            return this.fillGridCanvas(this.gridData, canvas);

        }).then(data => {
            let canvas = document.getElementById(this.canvasId);

            $id(this.frameId).css({width: canvas.width, height: canvas.height});

            d3.select(`#${this.svgId}`)
                .attr('width', canvas.width)
                .attr('height', canvas.height);

            console.log('loading', data.gridDataPts);
            this.reflowRTree = rtree();
            this.reflowRTree.load(data.gridDataPts);
            this.initMouseHandlers();
            return data;
        }) ;

    }

    // initMouseHandlers(d3$textgridSvg, pageNum, pageRTree) {
    initMouseHandlers() {
        // let reticleGroup = viewtext.initHoverReticles(d3$textgridSvg);

        let reflowRTree = this.reflowRTree;
        let neighborHits = [];
        let gridSelection = [];
        let widget = this;
        // let selectionStartId = undefined;
        // let selectionEndId = undefined;

        this.d3$textgridSvg
            .on("mouseover", function() {
                // reticleGroup.attr("opacity", 0.4);
            })
            .on("mouseout", function() {
                // reticleGroup.attr("opacity", 0);
                // d3.selectAll('.textloc').remove();
            });

        this.d3$textgridSvg.on("mousedown",  function() {
            let mouseEvent = d3.event;

            // let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);

            if (widget.focalPoint) {
                if (mouseEvent.shiftKey) {
                    console.log('shift click on ', widget.focalPoint);

                } else if (mouseEvent.ctrlKey) {
                    console.log('ctrl click on ', widget.focalPoint);
                    // Split the textgrid

                }
            }})
            .on("mouseup", function() {
                // if (selectionStartId !== undefined) {
                //     console.log('gridSelection', gridSelection);
                //     let gridDataPts = _.map(gridSelection, pt => pt.locus);
                //     gridSelection = [];
                //     selectionStartId = undefined;
                //     selectionEndId = undefined;
                //     d3$textgridSvg
                //         .selectAll("rect.glyph-selection")
                //         .remove() ;
                //     lbl.createTextGridLabeler(gridDataPts);
                // }

            })
            .on("mousemove", function() {
                let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));
                let queryWidth = 2;
                let queryBoxHeight = 2;
                let queryLeft = userPt.x-1;
                let queryTop = userPt.y-1;
                let queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

                let hits = neighborHits = reflowRTree.search(queryBox);


                neighborHits = _.sortBy(hits, hit => [hit.bottom, hit.left]);

                widget.focalPoint = neighborHits.slice(0, 1);

                widget.showHoverFocus();

            })
        ;

    }

    showHoverFocus() {
        let d3$hitReticles = this.d3$textgridSvg
            .selectAll('.hit-reticle')
            .data(this.focalPoint, (d) => d.id)
        ;

        d3$hitReticles
            .enter()
            .append('rect')
            .classed('hit-reticle', true)
            .attr('id', d => d.id)
            .call(util.initRect, d => d)
            .call(util.initStroke, 'green', 1, 0.2)
            .call(util.initFill, 'yellow', 0.7)
        ;

        d3$hitReticles
            .exit()
            .remove() ;
    }


    fillGridCanvas(textgridDef, gridCanvas) {
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

            if (gridCanvas.width < currLeft) {
                resizeCanvas(gridCanvas, currLeft, gridCanvas.height);
            }

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

}
