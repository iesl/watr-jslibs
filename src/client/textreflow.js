/**
 *
 *
 **/

/* global require _ d3 */

import * as util from  './commons.js';
import * as coords from './coord-sys.js';
import { t } from './jstags.js';
import { $id, resizeCanvas } from './jstags.js';
import { shared } from './shared-state';
import * as rtrees from  './rtrees.js';
import * as lbl from './labeling';

let rtree = require('rbush');

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

        let clippedGrid =
            _.map(_.toPairs(byRows), ([rowNum, rowTuples]) => {
                let cols    = _.map(rowTuples, t => t[1]),
                    minCol  = _.min(cols),
                    maxCol  = _.max(cols),
                    gridRow = rowTuples[0][2],
                    text    = gridRow.text.slice(minCol, maxCol+1),
                    loci    = gridRow.loci.slice(minCol, maxCol+1)
                ;

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

    let reflowWidget = new TextReflowWidget('reflow-controls', gridData);

    reflowWidget.textHeight = 20;

    reflowWidget.init().then(result => {
        return result;
    }) ;
}

class TextReflowWidget {

    constructor (containerId, gridData) {
        let gridNum = 1000;
        this.containerId = containerId;
        this.gridData = gridData;
        this.gridNum = gridNum;

        this.frameId  = `textgrid-frame-${gridNum}`;
        this.canvasId = `textgrid-canvas-${gridNum}`;
        this.svgId    = `textgrid-svg-${gridNum}`;
        this.mouseHoverPts = [];

        this._fringes = {
            left: 20,
            top: 0,
            right: 20,
            bottom: 10
        };
    }


    set textHeight (h) {
        this._textHeight = h;
        //       style  variant    wght size/line-height   family
        // font="italic small-caps bold 12px               arial";
        // this._textFont = 'normal normal normal '+h+'px/normal Times New Roman';
        this._textFont = 'normal normal normal '+h+'px/normal Calibri';
        // this._textFont = `normal normal normal ${shared.TextGridLineHeight}px/normal Times New Roman`;
        // this._textFont = 'normal normal normal 20px/normal Times New Roman';
        // this._textFont = '20px Calibri';
    }

    get fringes() { return this._fringes; }
    get gridOrigin   () { return coords.mkPoint.fromXy(this.fringes.left, this.fringes.top); }
    get fringeHeight   () { return this.fringes.top + this.fringes.bottom; }
    get fringeWidth   () { return this.fringes.left + this.fringes.right; }

    get textFont   () { return this._textFont; }
    get textHeight () { return this._textHeight; }


    gridHeight()  {
        return this.gridData.rows.length * this.textHeight + this.fringeHeight;
    }

    init () {

        return new Promise((resolve) => {
            let initWidth = 100;
            let gridHeight = this.gridHeight();

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
            this.gridCanvas = document.getElementById(this.canvasId);
            this.context = this.gridCanvas.getContext('2d');
            this.context.font = this.textFont;
            return this.redrawText();
        });

    }

    redrawText() {


        let data = this.fillGridCanvas();
        $id(this.frameId).css({width: this.gridCanvas.width, height: this.gridCanvas.height});

        d3.select(`#${this.svgId}`)
            .attr('width', this.gridCanvas.width)
            .attr('height', this.gridCanvas.height);

        this.reflowRTree = rtree();
        this.reflowRTree.load(data.gridDataPts);
        this.initMouseHandlers();
        return data;

    }

    initMouseHandlers() {
        let widget = this;
        let reflowRTree = widget.reflowRTree;
        let neighborHits = [];

        this.d3$textgridSvg
            .on("mouseover", function() {})
            .on("mouseout", function() {})
        ;

        this.d3$textgridSvg.on("mousedown",  function() {
            let mouseEvent = d3.event;

            // let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);

            if (widget.mouseHoverPts.length > 0) {
                let focalPoint = widget.mouseHoverPts[0];

                if (mouseEvent.shiftKey) {
                    // Join lines
                    // console.log('split data', widget.gridData);
                } else if (mouseEvent.ctrlKey) {
                    let splitData = widget.splitGridData(focalPoint);
                    widget.gridData = splitData;
                    // console.log('split data', widget.gridData);
                    widget.redrawText();
                } else {
                    lbl.createLabelChoiceWidget(['Author', 'First', 'Middle', 'Last'])
                        .then(choice => {
                            let labelChoice = choice.selectedLabel;
                            widget.labelGridData(focalPoint, labelChoice);
                            console.log('labeled data', widget.gridData);
                            widget.redrawText();
                        })
                    ;

                }
            }})
            .on("mousemove", function() {
                let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));
                let queryWidth = 2;
                let queryBoxHeight = 2;
                let queryLeft = userPt.x-1;
                let queryTop = userPt.y-1;
                let queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

                let hits = neighborHits = reflowRTree.search(queryBox);

                neighborHits = _.sortBy(hits, hit => [hit.bottom, hit.left]);

                widget.mouseHoverPts = neighborHits.slice(0, 1);

                widget.showHoverFocus();
            })
            .on("mouseup", function() {
            })
        ;

    }

    showHoverFocus() {
        let d3$hitReticles = this.d3$textgridSvg
            .selectAll('.hit-reticle')
            .data(this.mouseHoverPts, (d) => d.id)
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

    splitGridData(splitFocusPt) {
        let focusRow = splitFocusPt.row;
        let focusCol = splitFocusPt.col;
        let splitRows = _.flatMap(this.gridData.rows, (gridRow, rowNum) => {
            if (focusRow == rowNum) {
                let text0 = gridRow.text.slice(0, focusCol);
                let loci0 = gridRow.loci.slice(0, focusCol);
                let text1 = gridRow.text.slice(focusCol, gridRow.text.length);
                let loci1 = gridRow.loci.slice(focusCol, gridRow.loci.length);
                return [
                    {text: text0, loci: loci0},
                    {text: text1, loci: loci1}
                ];
            } else {
                return [gridRow];
            }

        });

        return {
            rows: splitRows
        };
    }

    labelRow(rowLoci, labelChoice) {
        if (rowLoci.length == 1) {
            _.merge(rowLoci[0], {bio: [`U::${labelChoice}`]});
        } else if (rowLoci.length > 1) {
            _.each(rowLoci, (cell, col) => {
                let label = `B::${labelChoice}`;
                if (col==rowLoci.length-1) {
                    label = `L::${labelChoice}`;
                } else if (col > 0){
                    label = `I::${labelChoice}`;
                }
                _.merge(cell, {bio: [label]});
            });
        }
    }

    labelGridData(focalPt, labelChoice) {
        let focusRow = focalPt.row;
        _.each(this.gridData.rows, (gridRow, rowNum) => {
            if (focusRow == rowNum) {
                // let locFmtA = {g: [['d', 1, [1, 2, 10, 20]]]};
                // let locFmtB = {i: ['d', 1, [1, 2, 10, 20]]};
                this.labelRow(gridRow.loci, labelChoice);
            }
        });
    }



    fillGridCanvas() {
        let idGen = util.IdGenerator();
        let context = this.context;
        context.font = this.textFont;


        context.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);

        let maxLineLen = _.max(_.map(this.gridData.rows, row => row.text.length));

        let initMaxWidth = maxLineLen * this.textHeight  + this.fringeWidth;
        // let initHeight   = rowCount * this.textHeight + this.fringeHeight;
        resizeCanvas(this.gridCanvas, initMaxWidth, this.gridHeight());

        // context.font = this.textFont;

        let maxWidth = 0;

        let gridData = _.flatMap(this.gridData.rows, (gridRow, rowNum) => {

            // let y = shared.TextGridOriginPt.y + (rowNum * shared.TextGridLineHeight);
            let y = this.gridOrigin.y + ((rowNum+1) * this.textHeight);
            let x = this.gridOrigin.x;
            let text = gridRow.text;
            let currLeft = x;
            let gridDataPts = _.map(text.split(''), (ch, chi) => {
                let chWidth = context.measureText(ch).width;


                let charDef = gridRow.loci[chi];
                let charPage = charDef.g ? charDef.g[0][1] : charDef.i[1];

                let gridDataPt = coords.mk.fromLtwh(
                    currLeft, y-this.textHeight, chWidth, this.textHeight
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

            // context.font = this.textFont;
            context.fillStyle = 'blue';
            context.fillText(text, x, y);
            return gridDataPts;
        });

        let finalWidth = maxWidth + this.fringeWidth;
        resizeCanvas(this.gridCanvas, finalWidth, this.gridHeight());

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
