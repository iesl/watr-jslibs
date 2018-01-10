/**
 *
 **/

/* global require _ d3 watr fabric $ */

import * as util from  './commons.js';
import * as coords from './coord-sys.js';
import { $id, t, icon, htm } from './jstags.js';
import * as lbl from './labeling';
let rtree = require('rbush');
import {shared} from './shared-state';

import * as gp from './graphpaper-variants';
import * as colors from './colors';
import * as server from './serverApi.js';

const GraphPaper = watr.utils.GraphPaper;
const Options = watr.utils.Options;
const Labels = watr.watrmarks.Labels;
const JsArray = watr.utils.JsArray;
const LTBounds = watr.geometry.LTBounds_Companion;
const TGCC = watr.textgrid.TextGridConstructor_Companion;
const TGC = TGCC.create();
const TGI = watr.textgrid.TextGridInterop;


import * as mouseHandlers from './ReflowWidgetMouseHandlers.js';

export function unshowGrid() {
    if (shared.activeReflowWidget != undefined) {
        let widget = shared.activeReflowWidget;
        $id(widget.containerId).empty();
        shared.activeReflowWidget = undefined;
    }
}

export class ReflowWidget {

    constructor (containerId, textGrid, labelSchema, zoneId, zoneLabel) {

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

    }



    setupTopStatusBar() {
        let controls = [
            [ 'labeler'         , 'pencil'             , true,  'Labeling tool'           ],
            [ 'slicer'          , 'scissors'           , false, 'Text slicing'            ],
            [ 'move-to-top'     , 'angle-double-up'    , false, 'Move text to top'        ],
            [ 'move-to-bottom'  , 'angle-double-down'  , false, 'Move text to bottom'     ],
            [ 'move-up-1'       , 'angle-up'           , false, 'Move text up one line'   ],
            [ 'move-down-1'     , 'angle-down'         , false, 'Move text down one line' ],
        ];

        let leftControls = htm.makeRadios('shapers', controls);

        let infoToggle = htm.makeToggle('info-toggle', 'toggle-on', 'toggle-off', false, 'Toggle debug info pane');

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
            .append(rightControls)
        ;

    }

    init () {

        return new Promise((resolve) => {
            let initWidth = 400;
            let gridHeight = 300; // this.gridBounds.bottom;

            /**
             * Structure:
             *    div.gridwidget
             *        div.status-top
             *        div.infobar
             *        div.frame
             *            canvas.textgrid
             *            svg.textgrid
             *        div.status-bottom
             */

            let gridNodes =
                t.div(`.textgrid #${this.frameId}`, {style: `width: ${initWidth}px; height: ${gridHeight}px;`}, [
                    t.canvas(`.textgrid #${this.canvasId}`, {page: this.gridNum, width: initWidth, height: gridHeight})
                ]) ;

            let infobarSlots = _.map(_.range(0, 6), i => {
                return t.div(`.infoslot #slot-${i}`, [
                    t.span(`.infoslot-label #slot-label-${i}`, ''),
                    t.span(`.infoslot-value #slot-value-${i}`, '')
                ]);
            });

            let widgetNode =
                t.div(`.gridwidget`, [
                    t.div(`.status-top`),
                    t.div(`.left-gutter`),
                    t.div(`.infobar`, infobarSlots),
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
            return this.redrawAll();
        });

    }

    printToInfobar(slot, label, value) {
        $(`#slot-label-${slot}`).text(label);
        $(`#slot-value-${slot}`).text(value);
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
        let postData = {
            SetText: {
                gridJson: gridAsJson
            }
        };

        let DEV_MODE = shared.DEV_MODE;

        if (DEV_MODE) {
            return {};
        } else {
            return server.apiPost(server.apiUri(`labeling/zones/${this.zoneId}`), postData)
                .then(() => lbl.updateAnnotationShapes()) ;

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
                    fontSize: 20,
                    fontStyle: 'normal',
                    fontFamily: 'Courier New',
                    fontWeight: 'bold',
                    textBackgroundColor: new fabric.Color(colorMap[cls]).setAlpha(0.5).toRgba()
                });
                this.drawingApi.fabricCanvas.add(text);


            } else if (region.isCells()) {
                let cells = JsArray.fromScala(region.cells);
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
                    fontSize: 20,
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
                    fontSize: 20,
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
                    fontSize: 20,
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
                .call(util.initRect, () => scaled)
                .call(util.initFill, 'yellow', 0.0)
            ;
        });

        this.setMouseHandlers([
            mouseHandlers.updateUserPosition,
            mouseHandlers.labelingToolHandlers
        ]);

    }

    redrawAll() {
        this.gridProps = TGC.textGridToWidgetGrid(this.textGrid, this.labelSchema, 2, 2);
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
        let widget = this;
        widget.mouseHandlers = _.map(handlers, h => {
            let init = {
                mousemove: function() {},
                mouseup: function() {},
                mousedown: function() {}
            };
            Object.assign(init, h(widget));
            return init;
        });

        this.d3$textgridSvg.on("mousemove", function() {
            let mouseEvent = d3.event;
            _.each(widget.mouseHandlers, h => {
                h.mousemove(mouseEvent);
            });
        });
        this.d3$textgridSvg.on("mousedown", function() {
            let mouseEvent = d3.event;
            _.each(widget.mouseHandlers, h => {
                h.mousedown(mouseEvent)
            });
        });

    }
    initMouseHandlers2() {
        let widget = this;
        widget.hoverCell = null;
        widget.printToInfobar(2, `dim`, `${this.colCount}x${this.rowCount}`);

        this.d3$textgridSvg.on("mousemove", function() {
            let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));
            let clientX = Math.floor(userPt.x);
            let clientY = Math.floor(userPt.y);

            let focalGraphCell = widget.clientPointToGraphCell(userPt);
            let cellContent = widget.getCellContent(focalGraphCell);

            widget.printToInfobar(0, `@client`, ` (${clientX}, ${clientY})`);

            focalGraphCell.id = widget.getCellNum(focalGraphCell);
            widget.printToInfobar(1, '@dispcell', ` (${focalGraphCell.x}, ${focalGraphCell.y}) #${focalGraphCell.id}`);

            if (widget.hoverCell != null) {
                if (focalGraphCell.id != widget.hoverCell.id) {
                    widget.hoverCell = focalGraphCell;
                    widget.updateCellHoverHighlight(focalGraphCell);
                }
            } else {
                widget.hoverCell = focalGraphCell;
                widget.updateCellHoverHighlight(focalGraphCell);
            }

            if (cellContent) {
                let focalBox = GraphPaper.boundsToBox(LTBounds.FromInts(
                    cellContent.region.bounds.left,
                    cellContent.region.bounds.top,
                    cellContent.region.bounds.width,
                    cellContent.region.bounds.height
                ));
                if (cellContent.region.isCells()) {
                    let row = cellContent.region.row;
                    let focalCellIndex = focalGraphCell.x - focalBox.origin.x;
                    let col = focalCellIndex;
                    widget.printToInfobar(3, '@gridcell', ` (${row}, ${col})`);
                    // let pins = c.region['cell$1'];
                    // console.log(pins.showPinsVert().toString());
                } else {
                    widget.printToInfobar(3, '@gridcell', ` --`);
                }
                widget.showLabelHighlights(cellContent);
            } else {
                widget.clearLabelHighlights();
                widget.printToInfobar(3, '@gridcell', ` --`);
            }

        });

        this.d3$textgridSvg.on("mousedown",  function() {
            let mouseEvent = d3.event;
            let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));

            let focalGraphCell = widget.clientPointToGraphCell(userPt);
            let cellContent = widget.getCellContent(focalGraphCell);


            if (cellContent) {

                let focalLabels = TGI.gridRegions.labels(cellContent.region);
                let focalBox = GraphPaper.boundsToBox(LTBounds.FromInts(
                    cellContent.region.bounds.left,
                    cellContent.region.bounds.top,
                    cellContent.region.bounds.width,
                    cellContent.region.bounds.height
                ));

                if (cellContent.region.isLabelCover()) {

                    let boxRight = focalBox.shiftOrigin(2, 0);
                    let contentRight = widget.getBoxContent(boxRight);
                    let rightLabelCovers = _.filter(contentRight, c => c.region.isLabelCover());
                    // console.log('contentRight', contentRight);
                    if (rightLabelCovers.length == 0) {

                        let queryRight = boxRight.modifySpan(widget.colCount, 0);
                        let rightContents = widget.getBoxContent(queryRight);
                        let rightCells0 = _.filter(rightContents, c => c.region.isCells());

                        let rightCells = _.map(rightCells0, r => r.region);
                        let region0 = _.head(rightCells);
                        widget.textGrid.unlabelNear(region0.row, 0, Labels.forString(focalLabels[0]));
                        widget.redrawAll();

                    }

                } else if (cellContent.region.isCells()) {
                    let row = cellContent.region.row;
                    let focalCellIndex = focalGraphCell.x - focalBox.origin.x;
                    let col = focalCellIndex;

                    widget.printToInfobar(3, 'grid cell', `(${row}, ${col})`);

                    if (mouseEvent.shiftKey) {
                        let maybeGrid = widget.textGrid.slurp(row);
                        let newGrid = Options.getOrElse(maybeGrid, widget.textGrid);
                        widget.textGrid = newGrid;

                        widget.redrawAll();
                    } else if (mouseEvent.ctrlKey) {
                        let maybeGrid = widget.textGrid.split(row, col);
                        let newGrid = Options.getOrElse(maybeGrid, widget.textGrid);
                        widget.textGrid = newGrid;

                        widget.redrawAll();
                    } else {

                        let focalClasses = TGI.gridRegions.labels(cellContent.region);
                        let focalLabel = _.last(focalClasses) || '';
                        let childLabels = TGI.labelSchemas.childLabelsFor(widget.labelSchema, focalLabel);
                        lbl.createLabelChoiceWidget(childLabels, widget.containerId)
                            .then(choice => {
                                let labelChoice = choice.selectedLabel;
                                widget.textGrid.labelRow(row, Labels.forString(labelChoice));
                                widget.redrawAll();
                            })
                            .catch(err => {
                                console.log('err', err);
                            }) ;

                    }
                }
            }
        }) ;
    }

    updateCellHoverHighlight(hoverGraphCell) {
        this.d3$textgridSvg
            .selectAll('.cell-focus')
            .remove() ;

        this.d3$textgridSvg
            .append('rect')
            .classed('cell-focus', true)
            .call(util.initRect, () => this.graphCellToClientBounds(hoverGraphCell))
            .call(util.initStroke, 'blue', 1, 0.4)
            .call(util.initFill, 'yellow', 0.4)
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
