/**
 *
 **/

/* global require _ d3 watr */

import * as util from  './commons.js';
import * as coords from './coord-sys.js';
import { t } from './jstags.js';
import { $id, resizeCanvas } from './jstags.js';
// import * as lbl from './labeling';
// import * as colors from './colors';
// import * as textgrid from './textgrid';
import * as gp from './graphpaper';



let rtree = require('rbush');

import '../style/view-pdf-text.less';

// export function setupReflowControl() {
//     let textGrid = textgrid.createFromCurrentSelection();

//     let reflowWidget = new TextReflowWidget('reflow-controls', textGrid);

//     reflowWidget.init().then(result => {
//         return result;
//     }) ;
// }

export class TextReflowWidget {

    constructor (containerId, textGrid, borders) {

        let gridNum = 1000;
        this.containerId = containerId;
        this.gridNum = gridNum;
        this._textGrid = textGrid;
        this.textHeight = 20;

        this.frameId  = `textgrid-frame-${gridNum}`;
        this.canvasId = `textgrid-canvas-${gridNum}`;
        this.svgId    = `textgrid-svg-${gridNum}`;


        let ProxyGraphPaper = watr.utils.ProxyGraphPaper;
        let textGridConstruction = new watr.textgrid.TextGridConstructor();
        // TODO get this from workflow definition
        let labelSchema = textGridConstruction.getTestLabelSchema();
        let drawingApi = new gp.DrawingApi(this.canvasId, this.textHeight);
        // TODO should set the canvas dimensions automatically
        let graphPaper = new ProxyGraphPaper(500, 500, drawingApi);

        this.mouseHoverPts = [];

        this.borders = borders || {
            left: 20,
            top: 10,
            right: 90,
            bottom: 10
        };
    }

    get textGrid () { return this._textGrid; }

    set borders ({left: left, top: top, right: right, bottom: bottom}) {
        this._borders = {left, top, right, bottom};
    }

    get borders () { return this._borders; }

    // set textHeight (h) {
    //     this._textHeight = h;
    //     this._textFont = '20px mono';
    // }

    get gridBounds   () {
        let height = 400; // this.textGrid.rows.length * this.textHeight;
        // console.log('gridBounds(1)', this.textHeight);
        // console.log('gridBounds(2)', this.textGrid.rows.length);
        return coords.mk.fromLtwh(this.borders.left, this.borders.top, this.gridWidth, height);
    }

    get gridOrigin   () { return this.gridBounds.topLeft; }


    get gridWidth   () { return this._gridWidth; }
    set gridWidth   (w) { this._gridWidth = w; }

    get widgetBounds   () {
        return coords.mk.fromLtwh(0, 0, this.gridCanvas.width, this.gridCanvas.height);
    }

    get fringes  () {
        let grid = this.gridBounds;
        let b = this.borders;
        let fr = {
            right: coords.mk.fromLtwh(grid.right, grid.top, b.right, grid.height),
            left: coords.mk.fromLtwh(0, grid.width, b.left, grid.height)
        };
        return fr;
    }

    get textFont     () { return this._textFont; }
    get textHeight   () { return this._textHeight; }


    init () {

        return new Promise((resolve) => {
            let initWidth = 400;
            let gridHeight = this.gridBounds.bottom;

            let gridNodes =
                t.div(`.textgrid #${this.frameId}`, {style: `width: ${initWidth}; height: ${gridHeight}`}, [
                    t.canvas(`.textgrid #${this.canvasId}`, {page: this.gridNum, width: initWidth, height: gridHeight})
                ]) ;

            $id(this.containerId).append(gridNodes);

            this.d3$textgridSvg = d3.select('#'+this.frameId)
                .append('svg').classed('textgrid', true)
                .datum(this.textGrid.gridData)
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
            return this.redrawAll();
        });

    }

    redrawAll() {

        let TGW = watr.textgrid.TextGridLabelWidget;
        let Schemas = watr.textgrid.LabelSchemasCompanion;
        let textGrid = this.textGrid;

        console.log('grid', textGrid.toText());
        let labelTree = TGW.textGridToLabelTree(textGrid);

        let gridRegions = TGW.labelTreeToGridRegions(labelTree, Schemas.testLabelSchema, 5, 20);

        console.log('gridRegions', gridRegions);
        // Fill Canvas with text, including grid cells, headers
        // Fill SVG with rectangular overlays for label-cover indicators
        // Fill RTree with data regions for: grid-cells, label-covers, label-keys


        let data = this.fillGridCanvas(gridRegions);
        // $id(this.frameId).css({width: this.gridCanvas.width, height: this.gridCanvas.height});

        // d3.select(`#${this.svgId}`)
        //     .attr('width', this.gridCanvas.width)
        //     .attr('height', this.gridCanvas.height);

        // this.reflowRTree = rtree();
        // this.reflowRTree.load(data.gridDataPts);
        // this.initMouseHandlers();
        // return data;

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
                    widget.textGrid.joinRows(focalPoint.row);
                    widget.redrawAll();
                } else if (mouseEvent.ctrlKey) {
                    widget.textGrid.splitRow(focalPoint.row, focalPoint.col);
                    widget.redrawAll();
                } else {
                    lbl.createLabelChoiceWidget(['Author', 'First', 'Middle', 'Last'])
                        .then(choice => {
                            let labelChoice = choice.selectedLabel;
                            widget.textGrid.labelGridData(focalPoint, labelChoice);
                            console.log('labeled data', widget.textGrid.gridData);
                            widget.redrawAll();
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


    fillGridCanvasXX() {
        let idGen = util.IdGenerator();
        let context = this.context;

        context.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);

        let maxLineLen = _.max(_.map(this.textGrid.gridData.rows, row => row.text.length));

        let initWidth = maxLineLen * this.textHeight;

        let initHeight = this.gridBounds.bottom;
        resizeCanvas(this.gridCanvas, initWidth, initHeight);

        let maxWidth = 0;

        let gridData = _.flatMap(this.textGrid.gridData.rows, (gridRow, rowNum) => {

            let y = this.gridOrigin.y + ((rowNum+1) * this.textHeight);
            let x = this.gridOrigin.x;
            let text = gridRow.text;
            let currLeft = x;
            let gridDataPts = _.map(text.split(''), (ch, col) => {
                let chWidth = context.measureText(ch).width;

                let charDef = gridRow.loci[col];
                let charPage = charDef.g ? charDef.g[0][1] : charDef.i[1];

                if (charDef.bio == undefined) {
                    charDef.bio = [];
                }
                let gridDataPt = coords.mk.fromLtwh(
                    currLeft, y-this.textHeight, chWidth, this.textHeight
                );

                gridDataPt.id = idGen();
                gridDataPt.gridRow = gridRow;
                gridDataPt.row = rowNum;
                gridDataPt.col = col;
                gridDataPt.char = ch;
                gridDataPt.page = charPage;
                gridDataPt.locus = charDef;
                gridDataPt.pins = charDef.bio? charDef.bio : [];
                gridDataPt.labels = _.map(gridDataPt.pins, p => p.split('::')[1]);

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

            let l = _.map(gridDataPts, p => p.labels);
            let la;
            if (l.length > 0) {
                la = this.labelColors[l[0]];
            } else {
                la = 'black';
            }
            context.fillStyle = la;
            context.fillText(text, x, y);
            return gridDataPts;
        });

        this.gridWidth = maxWidth;

        let gridBounds = this.gridBounds;
        let finalWidth = gridBounds.right + this.borders.right;
        let finalHeight = gridBounds.bottom + this.borders.bottom;

        resizeCanvas(this.gridCanvas, finalWidth, finalHeight);

        let glyphDataPts = _.filter(
            _.map(gridData, p => p.glyphDataPt),
            p =>  p !== undefined
        );

        let result = {
            gridDataPts: gridData,
            glyphDataPts: glyphDataPts
        };

        return result;
    }



}
