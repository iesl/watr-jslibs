/**
 *
 **/

/* global require _ d3 watr */

import * as util from  './commons.js';
import * as coords from './coord-sys.js';
import { t } from './jstags.js';
import { $id, resizeCanvas } from './jstags.js';
// import * as lbl from './labeling';

// import * as textgrid from './textgrid';
import * as gp from './graphpaper';
import * as rtreeapi from './rtree-api';
import * as colors from './colors';


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

    applyCanvasStripes() {
        let canvas = document.getElementById(this.canvasId);
        let ctx = canvas.getContext('2d');


        let rowWidth = this.cellWidth * (this.colCount+8);
        _.each(_.range(this.rowCount+10), row =>{
            let rtop = row * this.cellHeight;
            let h = this.cellHeight;

            let grd=ctx.createLinearGradient(0,rtop,0,rtop+h);
            grd.addColorStop(0, colors.Color.GhostWhite);
            grd.addColorStop(0.8, colors.Color.Linen);
            grd.addColorStop(1, colors.Color.Cornsilk);

            ctx.fillStyle=grd;

            ctx.fillRect(0, rtop, rowWidth, this.cellHeight);

        });


    }
    redrawAll() {

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
        this.cellWidth = cellDimensions.width;
        this.cellHeight = cellDimensions.height;

        this.updateDimensions().then(() => {
            this.applyCanvasStripes();
            TGC.writeTextGrid(gridProps, this.canvasGraphPaper, rtreeApi);
            this.reflowRTree = rtreeApi.rtree;

            let allClasses = this.labelSchema.allLabels;
            let colorMap = _.zipObject(allClasses, colors.labelColors);

            console.log('allClasses', allClasses);
            this.d3$textgridSvg
                .selectAll(`rect`)
                .remove();

            _.each(this.reflowRTree.all(), data => {
                let region = data.region;
                let bounds = region.bounds;
                let scaled = this.scaleLTBounds(bounds);
                let classes = region.getClasses;

                let regionType;
                if (region.isLabelKey()) {
                    regionType = 'LabelKey';
                } else if (region.isCell()) {
                    regionType = 'Cell';
                } else if (region.isLabelCover()) {
                    regionType = 'LabelCover';
                } else if (region.isHeading()) {
                    regionType = 'Heading';
                }
                let cls = classes[classes.length-1];

                if (! region.isCell()) {
                    this.d3$textgridSvg
                        .append('rect')
                        .classed(`${regionType}`, true)
                        .classed(`${cls}`, true)
                        .call(util.initRect, () => scaled)
                        .call(util.initFill, colorMap[cls], 0.2)
                    ;
                }
            });

            this.initMouseHandlers();

        });

    }

    scaleLTBounds(bb) {
        let x = bb.left*this.cellWidth;
        let y = bb.top* this.cellHeight;
        let w = bb.width * this.cellWidth;
        let h = bb.height* this.cellHeight;
        return coords.mk.fromLtwh(x, y, w, h);
    }

    getCellContent(cellCoords) {
        let reflowRTree = this.reflowRTree;
        // RTree cells are 4x4 for indexing purposes, this query is centered within the cell (not touching the edges)
        let rtreeQuery = coords.mk.fromLtwh(cellCoords.x*4+1, cellCoords.y*4+1, 1, 1);
        let cellContent = reflowRTree.search(rtreeQuery);
        return cellContent;
    }

    getCellCoordsFromUserPt(userPt) {
        let cellCol = Math.floor(userPt.x / this.cellWidth);
        let cellRow = Math.floor(userPt.y / this.cellHeight);
        return coords.mkPoint.fromXy(cellCol, cellRow);
    }

    getCellBoundsFromCellCoords(cellCoords) {
        // Construct a query box that aligns with grid
        let cellLeft = cellCoords.x * this.cellWidth;
        let cellTop = cellCoords.y * this.cellHeight;
        return coords.mk.fromLtwh(cellLeft, cellTop, this.cellWidth, this.cellHeight);
    }

    getCellNum(cellCoords) {
        return cellCoords.y * this.rowCount + cellCoords.x;
    }

    initMouseHandlers() {
        let widget = this;
        let reflowRTree = widget.reflowRTree;
        // let neighborHits = [];
        // widget.mouseHoverPts = [];
        widget.hoverCell = [];

        // this.d3$textgridSvg
        //     .on("mouseover", function() {})
        //     .on("mouseout", function() {})
        // ;

        this.d3$textgridSvg.on("mousemove", function() {
            let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));

            // Construct a query box that aligns with grid
            let cellCoords = widget.getCellCoordsFromUserPt(userPt);
            let cellBox =  widget.getCellBoundsFromCellCoords(cellCoords);
            let cellContent = widget.getCellContent(cellCoords);

            cellBox.id = widget.getCellNum(cellCoords);

            if (widget.hoverCell.length > 0) {
                if (cellBox.id != widget.hoverCell[0].id) {
                    widget.hoverCell.length=0;
                    widget.hoverCell.push(cellBox);
                    widget.updateCellHoverHighlight();
                }
            } else {
                widget.hoverCell.push(cellBox);
                widget.updateCellHoverHighlight();
            }

            if (cellContent.length > 0) {
                let c = cellContent[0];
                widget.showLabelHighlights(c);
            } else {
                widget.clearLabelHighlights();
            }

        });

        this.d3$textgridSvg.on("mousedown",  function() {
            let mouseEvent = d3.event;
            let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));

            // Construct a query box that aligns with grid
            let cellCoords = widget.getCellCoordsFromUserPt(userPt);
            let cellBox =  widget.getCellBoundsFromCellCoords(cellCoords);
            let cellContent = widget.getCellContent(cellCoords);

            // let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);

            if (cellContent.length > 0 && cellContent[0].region.isCell()) {
                let focalPoint = cellContent[0];
                let row = focalPoint.region.row;
                let col = focalPoint.region.col;
                let Options = watr.utils.Options;

                if (mouseEvent.shiftKey) {
                    let maybeGrid = widget.textGrid.slurp(row);
                    let newGrid = Options.getOrElse(maybeGrid, widget.textGrid);
                    widget.textGrid = newGrid;
                    widget.redrawAll();
                } else if (mouseEvent.ctrlKey) {
                    console.log('focalPt', focalPoint.region.row, focalPoint.region.col);
                    let maybeGrid = widget.textGrid.split(row, col) ;//.orUndefined;
                    let newGrid = Options.getOrElse(maybeGrid, widget.textGrid);
                    widget.textGrid = newGrid;

                    widget.redrawAll();
                } else {
                    // lbl.createLabelChoiceWidget(['Author', 'First', 'Middle', 'Last'])
                    //     .then(choice => {
                    //         let labelChoice = choice.selectedLabel;
                    //         widget.textGrid.labelGridData(focalPoint, labelChoice);
                    //         console.log('labeled data', widget.textGrid.gridData);
                    //         widget.redrawAll();
                    //     })
                    // ;

                }
            }})
        ;

    }

    updateCellHoverHighlight() {
        let d3$hitReticles = this.d3$textgridSvg
            .selectAll('.cell-focus')
            .data(this.hoverCell, (d) => d.id)
        ;

        d3$hitReticles
            .enter()
            .append('rect')
            .classed('cell-focus', true)
            .attr('id', d => d.id)
            .call(util.initRect, d => d)
            .call(util.initStroke, 'blue', 1, 0.4)
            .call(util.initFill, 'yellow', 0.4)
        ;

        d3$hitReticles
            .exit()
            .remove() ;
    }

    clearLabelHighlights() {
        _.each(['LabelCover', 'Heading', 'Cell', 'LabelKey'], cls => {
            this.d3$textgridSvg
                .selectAll(`rect.${cls}`)
                .attr('fill-opacity', 0.1)
            ;
        });
    }
    showLabelHighlights(cell) {
        let classes = cell.region.getClasses;
        let cls = classes[classes.length-1];
        // console.log('hovering', classes);

        if (cell.region.isLabelCover() || cell.region.isHeading()) {
            this.clearLabelHighlights();
            this.d3$textgridSvg
                .selectAll(`rect.${cls}`)
                .attr('fill-opacity', 0.6)
            ;
        }
        else if (cell.region.isLabelKey()) {
            this.clearLabelHighlights();
            this.d3$textgridSvg
                .selectAll(`rect.${cls}`)
                .attr('fill-opacity', 0.6)
            ;
        }

    }
}
