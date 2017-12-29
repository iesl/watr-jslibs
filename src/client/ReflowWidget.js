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

        this.mouseHoverPts = [];
    }



    init () {

        return new Promise((resolve) => {
            let initWidth = 800;
            let gridHeight = 500; // this.gridBounds.bottom;

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
            let ProxyGraphPaper = watr.utils.ProxyGraphPaper;
            let drawingApi = new gp.DrawingApi(this.canvasId, this.textHeight);
            // TODO should set the canvas dimensions automatically
            this.canvasGraphPaper = new ProxyGraphPaper(500, 500, drawingApi);
            return this.redrawAll();
        });

    }


    redrawAll() {
        let rtreeApi = new rtreeapi.RTreeApi();
        let TGC = new watr.textgrid.TextGridConstructor();
        TGC.writeTextGrid(this.textGrid, this.labelSchema, this.canvasGraphPaper, rtreeApi);
        // this.initMouseHandlers();
        // return data;
    }


    initMouseHandlers() {
        // let widget = this;
        // let reflowRTree = widget.reflowRTree;
        // let neighborHits = [];

        // this.d3$textgridSvg
        //     .on("mouseover", function() {})
        //     .on("mouseout", function() {})
        // ;

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
