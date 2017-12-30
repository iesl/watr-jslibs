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
import * as rtreeapi from './rtree-api';


export class ReflowWidget {

    constructor (containerId, textGrid, labelSchema) {

        let gridNum = 1000;
        this.containerId = containerId;
        this.gridNum = gridNum;
        this.textGrid = textGrid;
        this.textHeight = 20;
        this.labelSchema = labelSchema;

        this.frameId  = `textgrid-frame-${gridNum}`;
        this.canvasId = `textgrid-canvas-${gridNum}`;
        this.svgId    = `textgrid-svg-${gridNum}`;
    }



    init () {

        return new Promise((resolve) => {
            let initWidth = 800;
            let gridHeight = 1000; // this.gridBounds.bottom;

            let gridNodes =
                t.div(`.textgrid #${this.frameId}`, {style: `width: ${initWidth}px; height: ${gridHeight}px;`}, [
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
            return this.redrawAll();
        });

    }

    updateDimensions() {
        return new Promise((resolve) => {
            let height = (this.rowCount+2) * this.cellHeight;
            let width = (this.colCount+2) * this.cellWidth;
            let frameStyle = {
                style: `width: ${width}px; height: ${height}px;`
            };
            $id(this.frameId).css(frameStyle);
            $id(this.canvasId)
                .attr('width', width)
                .attr('height', height);
            this.d3$textgridSvg
                .attr('width', width)
                .attr('height', height)
                .call(() => resolve())
            ;
        });
    }

    redrawAll() {
        // compute widget display grid height/width/cell dimensions
        // TGC.writeTextGrid(this.textGrid, this.labelSchema, this.canvasGraphPaper, rtreeApi);

        // TODO should set the canvas dimensions automatically
        let rtreeApi = new rtreeapi.RTreeApi();
        let TGC = new watr.textgrid.TextGridConstructor();
        let gridProps = TGC.textGridToWidgetGrid(this.textGrid, this.labelSchema, 2, 2);
        let rowCount = gridProps.getGridRowCount();
        let colCount = gridProps.getGridColCount();

        this.rowCount = rowCount;
        this.colCount = colCount;
        const ProxyGraphPaper = watr.utils.ProxyGraphPaper;
        let drawingApi = new gp.DrawingApi(this.canvasId, this.textHeight);
        this.canvasGraphPaper = new ProxyGraphPaper(colCount, rowCount, drawingApi);
        let cellDimensions = this.canvasGraphPaper.cellDimensions();
        console.log('cellDimensions', cellDimensions, rowCount, colCount);
        this.cellWidth = cellDimensions.width;
        this.cellHeight = cellDimensions.height;

        this.updateDimensions().then(() => {
            TGC.writeTextGrid(gridProps, this.canvasGraphPaper, rtreeApi);
            this.reflowRTree = rtreeApi.rtree;
            this.initMouseHandlers();

        });

        // return data;
    }


    initMouseHandlers() {
        let widget = this;
        let reflowRTree = widget.reflowRTree;
        // let neighborHits = [];
        widget.mouseHoverPts = [];

        // this.d3$textgridSvg
        //     .on("mouseover", function() {})
        //     .on("mouseout", function() {})
        // ;

        this.d3$textgridSvg.on("mousemove", function() {
            let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));

            // Construct a query box that aligns with grid
            let cellCol = Math.floor(userPt.x / widget.cellWidth);
            let cellLeft = cellCol * widget.cellWidth;
            let cellRow = Math.floor(userPt.y / widget.cellHeight);
            let cellTop = cellRow * widget.cellHeight;
            let cellBox = coords.mk.fromLtwh(cellLeft, cellTop, widget.cellWidth, widget.cellHeight);
            // RTree cells are 4x4 for indexing purposes, this query is centered within the cell (not touching the edges)
            let rtreeQuery = coords.mk.fromLtwh(cellCol*4+1, cellRow*4+1, 1, 1);

            let cellNum = cellRow * widget.rowCount + cellCol;
            cellBox.id = cellNum;

            let cellContent = reflowRTree.search(rtreeQuery);

            widget.mouseHoverPts = [cellBox];
            if (cellContent.length > 0) {
                let c = cellContent[0];
                console.log('mousemove', c.region.classes);
            }

            widget.showHoverFocus();
        });

        // this.d3$textgridSvg.on("mousedown",  function() {
        //     let mouseEvent = d3.event;

        //     // let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);

        //     if (widget.mouseHoverPts.length > 0) {
        //         let focalPoint = widget.mouseHoverPts[0];

        //         if (mouseEvent.shiftKey) {
        //             widget.textGrid.joinRows(focalPoint.row);
        //             widget.redrawAll();
        //         } else if (mouseEvent.ctrlKey) {
        //             widget.textGrid.splitRow(focalPoint.row, focalPoint.col);
        //             widget.redrawAll();
        //         } else {
        //             lbl.createLabelChoiceWidget(['Author', 'First', 'Middle', 'Last'])
        //                 .then(choice => {
        //                     let labelChoice = choice.selectedLabel;
        //                     widget.textGrid.labelGridData(focalPoint, labelChoice);
        //                     console.log('labeled data', widget.textGrid.gridData);
        //                     widget.redrawAll();
        //                 })
        //             ;

        //         }
        //     }})
        //     .on("mousemove", function() {
        //         let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));
        //         let queryWidth = 2;
        //         let queryBoxHeight = 2;
        //         let queryLeft = userPt.x-1;
        //         let queryTop = userPt.y-1;
        //         let queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

        //         let hits = neighborHits = reflowRTree.search(queryBox);

        //         neighborHits = _.sortBy(hits, hit => [hit.bottom, hit.left]);

        //         widget.mouseHoverPts = neighborHits.slice(0, 1);

        //         widget.showHoverFocus();
        //     })
        //     .on("mouseup", function() {
        //     })
        // ;

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





}
