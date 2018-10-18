/**
 *
 **/

/* global require watr fabric */

import * as $ from 'jquery';
import * as _ from 'lodash';
import * as d3 from 'd3';

import * as mhs from './MouseHandlerSets';

import * as coords from './coord-sys';
import { $id, t, htm } from "./tstags";
let rtree = require('rbush');
import {shared} from './shared-state';

import * as d3x from './d3-extras';

import * as gp from './graphpaper-variants';
import * as colors from './colors';

const JsArray = watr.utils.JsArray;
const TGI = watr.textgrid.TextGridInterop;

import * as reflowTools from './ReflowTools.js';

import Infobar from './Infobar';

export function unshowGrid() {
    if (shared.activeReflowWidget != undefined) {
        let widget = shared.activeReflowWidget;
        $id(widget.containerId).empty();
        shared.activeReflowWidget = undefined;
    }
}


export class ReflowWidget {

    /**
     * @param {ServerDataExchange}  serverExchange
     */
    constructor (containerId, textGrid, labelSchema, zoneId, zoneLabel, serverExchange) {

        let gridNum = 1000;
        this.containerId = containerId;
        this.gridNum = gridNum;
        this.textGrid = textGrid; // .trimRights().padRights();
        this.textHeight = 20;
        this.labelSchema = labelSchema;

        this.frameId  = `textgrid-frame-${gridNum}`;
        this.canvasId = `textgrid-canvas-${gridNum}`;
        this.svgId    = `textgrid-svg-${gridNum}`;
        this.zoneId = zoneId;
        this.zoneLabel = zoneLabel;
        this.infoBar = new Infobar(this.containerId, 2, 3);
        this.serverExchange = serverExchange;

    }



    setupTopStatusBar() {
        let widget = this;
        let setTool = h => {
            return function (){
                return widget.setMouseHandlers([reflowTools.updateUserPosition, h]);
            };
        };

        let controls = [
            [ 'labeler'    , 'pencil'             , true,  'Labeling tool'        , setTool( reflowTools.labelingTool )  ],
            [ 'slicer'     , 'scissors'           , false, 'Text slicing'         , setTool( reflowTools.slicerTool   )  ],
            [ 'move'       , 'arrows-v'           , false, 'Move line up or down' , setTool( reflowTools.moveLine     )  ]
       ];

        let leftControls = htm.makeRadios('shapers', controls);

        let infoToggle = this.infoBar.getToggle();

        let closeButton = t.span(
            '.spacedout',
            htm.iconButton('close')
        );

        let rightControls = t.span(
            '.pull-right .spacedout',
            infoToggle, closeButton
        );
        // unshowWidget
        $(`#${this.containerId} .status-top`)
            .append(leftControls)
            .append(rightControls);
    }

    init () {

        return new Promise((resolve) => {
            let initWidth = 400;
            let gridHeight = 300; // this.gridBounds.bottom;

            /**
             * Structure:
             *    div.gridwidget
             *        div.status-top
             *        div.left-gutter
             *        div.infobar
             *        div.frame
             *            canvas.textgrid
             *            svg.textgrid
             *        div.right-gutter
             *        div.status-bottom
             */

            let gridNodes =
                t.div(`.textgrid #${this.frameId}`, {style: `width: ${initWidth}px; height: ${gridHeight}px;`}, [
                    t.canvas(`.textgrid #${this.canvasId}`, {page: this.gridNum, width: initWidth, height: gridHeight})
                ]) ;

            let infobarElem = this.infoBar.getElem();

            let widgetNode =
                t.div(`.gridwidget`, [
                    t.div(`.status-top`),
                    t.div(`.left-gutter`),
                    infobarElem,
                    t.div(`.gridcontent`, [
                        gridNodes
                    ]),
                    t.div(`.right-gutter`),
                    t.div(`.status-bottom`)
                ]);

            $id(this.containerId).append(widgetNode);

            // Setup status bar
            this.setupTopStatusBar();

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
            this.setMouseHandlers([
                reflowTools.updateUserPosition,
                reflowTools.labelingTool
            ]);

            return this.redrawAll();
        });

    }

    printToInfobar(slot, label, value) {
        this.infoBar.printToInfobar(slot, label, value);
    }

    updateDomNodeDimensions() {
        return new Promise((resolve) => {
            let height = this.rowCount * this.cellHeight;
            let width = this.colCount * this.cellWidth;

            $id(this.frameId).width(width).height(height);

            this.drawingApi.setDimensions(width, height, this.colCount, this.rowCount);

            this.d3$textgridSvg
                .attr('width', width)
                .attr('height', height)
                .call(() => resolve())
            ;
        });
    }

    saveTextGrid() {
        shared.activeReflowWidget = this;
        let gridAsJson = JSON.parse(this.textGrid.toJson().toString());

        if (! shared.DEV_MODE) {
            this.serverExchange.setAnnotationText(this.zoneId, gridAsJson);
        }
    }

    makeRTreeBox(region) {
        let {left, top, width, height} = region.bounds;
        let box = new coords.BBox(
            left*4, top*4, width*4,height*4
        );
        box.region = region;
        return box;
    }


    drawGridShapes() {
        let gridProps = this.gridProps;

        this.cellRowToDisplayRegion = {};

        this.drawingApi.applyCanvasStripes();

        let gridRegions = TGI.widgetDisplayGridProps.gridRegions(gridProps);
        let allClasses = TGI.labelSchemas.allLabels(this.labelSchema);
        let colorMap = _.zipObject(allClasses, colors.HighContrast);

        let rtreeBoxes = _.map(gridRegions, region => {
            let classes = TGI.gridRegions.labels(region);
            let cls = classes[classes.length-1];
            let box = region.gridBox;
            let bounds = region.bounds;
            let {left, top, width, height} = this.scaleLTBounds(bounds);
            if (region.isLabelKey()) {
                let label = region.labelIdent;
                let text = new fabric.Text(label, {
                    objectCaching: false,
                    left: left, top: top,
                    fontSize: this.textHeight,
                    fontStyle: 'normal',
                    fontFamily: 'Courier New',
                    fontWeight: 'bold',
                    textBackgroundColor: new fabric.Color(colorMap[cls]).setAlpha(0.5).toRgba()
                });
                this.drawingApi.fabricCanvas.add(text);


            } else if (region.isCells()) {
                let cells = JsArray.fromScala(region.cells);
                // Create a mapping between textgrid rows and displaygrid rows
                let cellRow = region.row;
                this.cellRowToDisplayRegion[cellRow] = this.scaleLTBounds(bounds);

                let cellChrs = _.map(cells, c => c.char.toString());
                if (cellChrs[0] == ' ') {
                    cellChrs[0] = '░';
                }
                if (cellChrs[cellChrs.length-1] == ' ') {
                    cellChrs[cellChrs.length-1] = '░';
                }
                let cellStr = cellChrs.join('');

                let text = new fabric.Text(cellStr, {
                    objectCaching: false,
                    left: left, top: top,
                    fontSize: this.textHeight,
                    fontStyle: 'normal',
                    fontFamily: 'Courier New'
                    // fontWeight: 'bold',
                    // textBackgroundColor: new fabric.Color(colorMap[cls]).setAlpha(0.5).toRgba()
                });
                this.drawingApi.fabricCanvas.add(text);

            } else if (region.isLabelCover()) {

                this.drawingApi.fillBox(box, (rect) => {
                    rect.setGradient('fill', {
                        x1: 0, y1: 0,
                        x2: 0, y2: height,
                        colorStops: {
                            0:  new fabric.Color('rgb(255, 255, 255').setAlpha(0).toRgba(),
                            0.6:  new fabric.Color('rgb(255, 255, 255').setAlpha(0.1).toRgba(),
                            1:  new fabric.Color(colorMap[cls]).setAlpha(0.8).toRgba()
                        }
                    });
                });

                this.drawingApi.fillBox(box, (rect) => {
                    rect.setGradient('fill', {
                        x1: 0, y1: 0,
                        x2: 0, y2: height,
                        colorStops: {
                            0:  new fabric.Color(colorMap[cls]).setAlpha(0.8).toRgba(),
                            0.2: new fabric.Color('rgb(255, 255, 255').setAlpha(0).toRgba()
                        }
                    });
                });

                let abbrev = TGI.labelSchemas.abbrevFor(this.labelSchema, cls);
                let text = new fabric.Text(abbrev, {
                    objectCaching: false,
                    left: left, top: top,
                    fontSize: this.textHeight,
                    fontStyle: 'normal',
                    fontFamily: 'Courier New',
                    fontWeight: 'bolder',
                    fill: 'black',
                    // textBackgroundColor: new fabric.Color(colorMap[cls]).toRgb(),
                    underline: true
                    // linethrough: '',
                    // overline: ''
                });

                this.drawingApi.fabricCanvas.add(text);

            } else if (region.isHeading()) {
                let text = new fabric.Text(region.heading, {
                    objectCaching: false,
                    left: left, top: top,
                    fontSize: this.textHeight,
                    fontStyle: 'italic',
                    fontFamily: 'Courier New',
                    fontWeight: 'bolder',
                    textBackgroundColor: new fabric.Color(colorMap[cls]).setAlpha(0.2).toRgba()
                    // underline: '',
                    // linethrough: '',
                    // overline: ''
                });
                this.drawingApi.fabricCanvas.add(text);
            }
            return this.makeRTreeBox(region);
        });

        this.drawingApi.fabricCanvas.renderAll();

        this.reflowRTree = rtree();

        this.reflowRTree.load(rtreeBoxes);

        this.d3$textgridSvg
            .selectAll(`rect`)
            .remove();

        _.each(this.reflowRTree.all(), data => {
            let region = data.region;
            let bounds = region.bounds;
            let scaled = this.scaleLTBounds(bounds);
            let classes = TGI.gridRegions.labels(region);

            let regionType;
            if (region.isLabelKey()) {
                regionType = 'LabelKey';
            } else if (region.isCells()) {
                regionType = 'Cell';
            } else if (region.isLabelCover()) {
                regionType = 'LabelCover';
            } else if (region.isHeading()) {
                regionType = 'Heading';
            }
            let cls = classes[classes.length-1];

            this.d3$textgridSvg
                .append('rect')
                .classed(`${regionType}`, true)
                .classed(`${cls}`, true)
                .call(d3x.initRect, () => scaled)
                .call(d3x.initFill, 'yellow', 0.0)
            ;
        });

    }

    redrawAll() {
        this.gridProps = TGI.textGrids.textGridToWidgetGrid(this.textGrid, this.labelSchema, 2, 2);
        let rowCount = Math.max(this.gridProps.getGridRowCount(), 40);
        let colCount = Math.max(this.gridProps.getGridColCount(), 100);


        this.rowCount = rowCount;
        this.colCount = colCount;
        let drawingApi = new gp.FabricJsGraphPaper(this.canvasId, this.textHeight);

        this.cellWidth = drawingApi.cellWidth;
        this.cellHeight = drawingApi.cellHeight;
        this.drawingApi = drawingApi;


        return this.updateDomNodeDimensions()
            .then(() => this.drawGridShapes())
            .then(() => this.saveTextGrid());

    }

    graphCellToClientBounds(graphCell) {
        // Construct a query box that aligns with grid
        let cellLeft = graphCell.x * this.cellWidth;
        let cellTop = graphCell.y * this.cellHeight;
        return coords.mk.fromLtwh(cellLeft, cellTop, this.cellWidth, this.cellHeight);
    }


    clientPointToGraphCell(clientPt) {
        let cellCol = Math.floor(clientPt.x / this.cellWidth);
        let cellRow = Math.floor(clientPt.y / this.cellHeight);
        return coords.mkPoint.fromXy(cellCol, cellRow);
    }

    scaleLTBounds(bb) {
        let x = bb.left*this.cellWidth;
        let y = bb.top* this.cellHeight;
        let w = bb.width * this.cellWidth;
        let h = bb.height* this.cellHeight;
        return coords.mk.fromLtwh(x, y, w, h);
    }

    getCellContent(graphCell) {
        let reflowRTree = this.reflowRTree;
        // RTree cells are 4x4 for indexing purposes, this query is centered within the cell (not touching the edges)
        let rtreeQuery = coords.mk.fromLtwh(graphCell.x*4+1, graphCell.y*4+1, 1, 1);
        let cellContent = reflowRTree.search(rtreeQuery);
        if (cellContent.length > 1) {
            console.error("more than one thing found at grid cell ", graphCell);
        }
        return cellContent[0];
    }

    getBoxContent(cellBox) {
        return this.reflowRTree.search(
            coords.mk.fromLtwh(
                cellBox.left*4+1, cellBox.top*4+1,
                ((cellBox.spanRight+1)*4)-2,
                ((cellBox.spanDown+1)*4)-2
            )
        );
    }

    getCellNum(graphCell) {
        return graphCell.y * this.colCount + graphCell.x;
    }

    setMouseHandlers(handlers) {
        mhs.setMouseHandlers(this, this.frameId, handlers);
    }

    updateCellHoverHighlight(hoverGraphCell) {
        this.d3$textgridSvg
            .selectAll('.cell-focus')
            .remove() ;

        this.d3$textgridSvg
            .append('rect')
            .classed('cell-focus', true)
            .call(d3x.initRect, () => this.graphCellToClientBounds(hoverGraphCell))
            .call(d3x.initStroke, 'blue', 1, 0.4)
            .call(d3x.initFill, 'yellow', 0.4)
        ;
    }

    clearLabelHighlights() {
        _.each(['LabelCover', 'Heading', 'Cell', 'LabelKey'], cls => {
            this.d3$textgridSvg
                .selectAll(`rect.${cls}`)
                .attr('fill-opacity', 0)
            ;
        });
    }

    showLabelHighlights(cell) {
        let classes = TGI.gridRegions.labels(cell.region);
        let cls = classes[classes.length-1];
        // console.log('hovering', classes);

        if (cell.region.isLabelCover() || cell.region.isHeading()) {
            this.clearLabelHighlights();
            this.d3$textgridSvg
                .selectAll(`rect.${cls}`)
                .attr('fill-opacity', 0.5)
            ;
        }
        else if (cell.region.isLabelKey()) {
            this.clearLabelHighlights();
            this.d3$textgridSvg
                .selectAll(`rect.${cls}`)
                .attr('fill-opacity', 0.5)
            ;
        }

    }
}