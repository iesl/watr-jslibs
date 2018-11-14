"use strict";
/**
 *
 **/
exports.__esModule = true;
/* global require watr fabric */
var $ = require("jquery");
var _ = require("lodash");
var d3 = require("d3");
var mhs = require("./MouseHandlerSets");
var coords = require("./coord-sys");
var tstags_1 = require("./tstags");
var rtree = require('rbush');
// import rtree from "rbush";
var shared_state_1 = require("./shared-state");
var d3x = require("./d3-extras");
var gp = require("./graphpaper-variants");
var colors = require("./colors");
var JsArray = watr.utils.JsArray;
var TGI = watr.textgrid.TextGridInterop;
var reflowTools = require("./ReflowTools");
var Infobar_1 = require("./Infobar");
function unshowGrid() {
    if (shared_state_1.shared.activeReflowWidget !== undefined) {
        var widget = shared_state_1.shared.activeReflowWidget;
        tstags_1.$id(widget.containerId).empty();
        shared_state_1.shared.activeReflowWidget = undefined;
    }
}
exports.unshowGrid = unshowGrid;
var ReflowWidget = /** @class */ (function () {
    /**
     * @param {ServerDataExchange}  serverExchange
     */
    function ReflowWidget(containerId, textGrid, labelSchema, zoneId, zoneLabel, serverExchange) {
        var gridNum = 1000;
        this.containerId = containerId;
        this.gridNum = gridNum;
        this.textGrid = textGrid; // .trimRights().padRights();
        this.textHeight = 20;
        this.labelSchema = labelSchema;
        this.frameId = "textgrid-frame-" + gridNum;
        this.canvasId = "textgrid-canvas-" + gridNum;
        this.svgId = "textgrid-svg-" + gridNum;
        this.zoneId = zoneId;
        this.zoneLabel = zoneLabel;
        this.infoBar = new Infobar_1["default"](this.containerId, 2, 3);
        this.serverExchange = serverExchange;
    }
    ReflowWidget.prototype.setupTopStatusBar = function () {
        var widget = this;
        var setTool = function (h) {
            return function () {
                return widget.setMouseHandlers([reflowTools.updateUserPosition, h]);
            };
        };
        var controls = [
            ['labeler', 'pencil', true, 'Labeling tool', setTool(reflowTools.labelingTool)],
            ['slicer', 'scissors', false, 'Text slicing', setTool(reflowTools.slicerTool)],
            ['move', 'arrows-v', false, 'Move line up or down', setTool(reflowTools.moveLine)]
        ];
        var leftControls = tstags_1.htm.makeRadios('shapers', controls);
        var infoToggle = this.infoBar.getToggle();
        var closeButton = tstags_1.t.span('.spacedout', tstags_1.htm.iconButton('close'));
        var rightControls = tstags_1.t.span('.pull-right .spacedout', infoToggle, closeButton);
        // unshowWidget
        $("#" + this.containerId + " .status-top")
            .append(leftControls)
            .append(rightControls);
    };
    ReflowWidget.prototype.init = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var initWidth = 400;
            var gridHeight = 300; // this.gridBounds.bottom;
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
            var gridNodes = tstags_1.t.div(".textgrid #" + _this.frameId, { style: "width: " + initWidth + "px; height: " + gridHeight + "px;" }, [
                tstags_1.t.canvas(".textgrid #" + _this.canvasId, { page: _this.gridNum, width: initWidth, height: gridHeight })
            ]);
            var infobarElem = _this.infoBar.getElem();
            var widgetNode = tstags_1.t.div(".gridwidget", [
                tstags_1.t.div(".status-top"),
                tstags_1.t.div(".left-gutter"),
                infobarElem,
                tstags_1.t.div(".gridcontent", [
                    gridNodes
                ]),
                tstags_1.t.div(".right-gutter"),
                tstags_1.t.div(".status-bottom")
            ]);
            tstags_1.$id(_this.containerId).append(widgetNode);
            // Setup status bar
            _this.setupTopStatusBar();
            _this.d3$textgridSvg = d3.select('#' + _this.frameId)
                .append('svg').classed('textgrid', true)
                .datum(_this.textGrid.gridData)
                .attr('id', "" + _this.svgId)
                .attr('page', _this.gridNum)
                .attr('width', initWidth)
                .attr('height', gridHeight)
                .call(function () { return resolve(); });
        }).then(function () {
            _this.setMouseHandlers([
                reflowTools.updateUserPosition,
                reflowTools.labelingTool
            ]);
            return _this.redrawAll();
        });
    };
    ReflowWidget.prototype.printToInfobar = function (slot, label, value) {
        this.infoBar.printToInfobar(slot, label, value);
    };
    ReflowWidget.prototype.updateDomNodeDimensions = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var height = _this.rowCount * _this.cellHeight;
            var width = _this.colCount * _this.cellWidth;
            tstags_1.$id(_this.frameId).width(width).height(height);
            _this.drawingApi.setDimensions(width, height, _this.colCount, _this.rowCount);
            _this.d3$textgridSvg
                .attr('width', width)
                .attr('height', height)
                .call(function () { return resolve(); });
        });
    };
    ReflowWidget.prototype.saveTextGrid = function () {
        shared_state_1.shared.activeReflowWidget = this;
        var gridAsJson = JSON.parse(this.textGrid.toJson().toString());
        if (!shared_state_1.shared.DEV_MODE) {
            this.serverExchange.setAnnotationText(this.zoneId, gridAsJson);
        }
    };
    ReflowWidget.prototype.makeRTreeBox = function (region) {
        var _a = region.bounds, left = _a.left, top = _a.top, width = _a.width, height = _a.height;
        var box = new coords.BBox(left * 4, top * 4, width * 4, height * 4);
        box.region = region;
        return box;
    };
    ReflowWidget.prototype.drawGridShapes = function () {
        var _this = this;
        var gridProps = this.gridProps;
        this.cellRowToDisplayRegion = {};
        this.drawingApi.applyCanvasStripes();
        var gridRegions = TGI.widgetDisplayGridProps.gridRegions(gridProps);
        var allClasses = TGI.labelSchemas.allLabels(this.labelSchema);
        var colorMap = _.zipObject(allClasses, colors.HighContrast);
        var rtreeBoxes = _.map(gridRegions, function (region) {
            var classes = TGI.gridRegions.labels(region);
            var cls = classes[classes.length - 1];
            var box = region.gridBox;
            var bounds = region.bounds;
            var _a = _this.scaleLTBounds(bounds), left = _a.left, top = _a.top, width = _a.width, height = _a.height;
            if (region.isLabelKey()) {
                var label = region.labelIdent;
                var text = new fabric.Text(label, {
                    objectCaching: false,
                    left: left, top: top,
                    fontSize: _this.textHeight,
                    fontStyle: 'normal',
                    fontFamily: 'Courier New',
                    fontWeight: 'bold',
                    textBackgroundColor: new fabric.Color(colorMap[cls]).setAlpha(0.5).toRgba()
                });
                _this.drawingApi.fabricCanvas.add(text);
            }
            else if (region.isCells()) {
                var cells = JsArray.fromScala(region.cells);
                // Create a mapping between textgrid rows and displaygrid rows
                var cellRow = region.row;
                _this.cellRowToDisplayRegion[cellRow] = _this.scaleLTBounds(bounds);
                var cellChrs = _.map(cells, function (c) { return c.char.toString(); });
                if (cellChrs[0] === ' ') {
                    cellChrs[0] = '░';
                }
                if (cellChrs[cellChrs.length - 1] === ' ') {
                    cellChrs[cellChrs.length - 1] = '░';
                }
                var cellStr = cellChrs.join('');
                var text = new fabric.Text(cellStr, {
                    objectCaching: false,
                    left: left, top: top,
                    fontSize: _this.textHeight,
                    fontStyle: 'normal',
                    fontFamily: 'Courier New'
                    // fontWeight: 'bold',
                    // textBackgroundColor: new fabric.Color(colorMap[cls]).setAlpha(0.5).toRgba()
                });
                _this.drawingApi.fabricCanvas.add(text);
            }
            else if (region.isLabelCover()) {
                _this.drawingApi.fillBox(box, function (rect) {
                    rect.setGradient('fill', {
                        x1: 0, y1: 0,
                        x2: 0, y2: height,
                        colorStops: {
                            0: new fabric.Color('rgb(255, 255, 255').setAlpha(0).toRgba(),
                            0.6: new fabric.Color('rgb(255, 255, 255').setAlpha(0.1).toRgba(),
                            1: new fabric.Color(colorMap[cls]).setAlpha(0.8).toRgba()
                        }
                    });
                });
                _this.drawingApi.fillBox(box, function (rect) {
                    rect.setGradient('fill', {
                        x1: 0, y1: 0,
                        x2: 0, y2: height,
                        colorStops: {
                            0: new fabric.Color(colorMap[cls]).setAlpha(0.8).toRgba(),
                            0.2: new fabric.Color('rgb(255, 255, 255').setAlpha(0).toRgba()
                        }
                    });
                });
                var abbrev = TGI.labelSchemas.abbrevFor(_this.labelSchema, cls);
                var text = new fabric.Text(abbrev, {
                    objectCaching: false,
                    left: left, top: top,
                    fontSize: _this.textHeight,
                    fontStyle: 'normal',
                    fontFamily: 'Courier New',
                    fontWeight: 'bolder',
                    fill: 'black',
                    // textBackgroundColor: new fabric.Color(colorMap[cls]).toRgb(),
                    underline: true
                    // linethrough: '',
                    // overline: ''
                });
                _this.drawingApi.fabricCanvas.add(text);
            }
            else if (region.isHeading()) {
                var text = new fabric.Text(region.heading, {
                    objectCaching: false,
                    left: left, top: top,
                    fontSize: _this.textHeight,
                    fontStyle: 'italic',
                    fontFamily: 'Courier New',
                    fontWeight: 'bolder',
                    textBackgroundColor: new fabric.Color(colorMap[cls]).setAlpha(0.2).toRgba()
                    // underline: '',
                    // linethrough: '',
                    // overline: ''
                });
                _this.drawingApi.fabricCanvas.add(text);
            }
            return _this.makeRTreeBox(region);
        });
        this.drawingApi.fabricCanvas.renderAll();
        this.reflowRTree = rtree();
        this.reflowRTree.load(rtreeBoxes);
        this.d3$textgridSvg
            .selectAll("rect")
            .remove();
        _.each(this.reflowRTree.all(), function (data) {
            var region = data.region;
            var bounds = region.bounds;
            var scaled = _this.scaleLTBounds(bounds);
            var classes = TGI.gridRegions.labels(region);
            var regionType;
            if (region.isLabelKey()) {
                regionType = 'LabelKey';
            }
            else if (region.isCells()) {
                regionType = 'Cell';
            }
            else if (region.isLabelCover()) {
                regionType = 'LabelCover';
            }
            else if (region.isHeading()) {
                regionType = 'Heading';
            }
            var cls = classes[classes.length - 1];
            _this.d3$textgridSvg
                .append('rect')
                .classed("" + regionType, true)
                .classed("" + cls, true)
                .call(d3x.initRect, function () { return scaled; })
                .call(d3x.initFill, 'yellow', 0.0);
        });
    };
    ReflowWidget.prototype.redrawAll = function () {
        var _this = this;
        this.gridProps = TGI.textGrids.textGridToWidgetGrid(this.textGrid, this.labelSchema, 2, 2);
        var rowCount = Math.max(this.gridProps.getGridRowCount(), 40);
        var colCount = Math.max(this.gridProps.getGridColCount(), 100);
        this.rowCount = rowCount;
        this.colCount = colCount;
        var drawingApi = new gp.FabricJsGraphPaper(this.canvasId, this.textHeight);
        this.cellWidth = drawingApi.cellWidth;
        this.cellHeight = drawingApi.cellHeight;
        this.drawingApi = drawingApi;
        return this.updateDomNodeDimensions()
            .then(function () { return _this.drawGridShapes(); })
            .then(function () { return _this.saveTextGrid(); });
    };
    ReflowWidget.prototype.graphCellToClientBounds = function (graphCell) {
        // Construct a query box that aligns with grid
        var cellLeft = graphCell.x * this.cellWidth;
        var cellTop = graphCell.y * this.cellHeight;
        return coords.mk.fromLtwh(cellLeft, cellTop, this.cellWidth, this.cellHeight);
    };
    ReflowWidget.prototype.clientPointToGraphCell = function (clientPt) {
        var cellCol = Math.floor(clientPt.x / this.cellWidth);
        var cellRow = Math.floor(clientPt.y / this.cellHeight);
        return coords.mkPoint.fromXy(cellCol, cellRow);
    };
    ReflowWidget.prototype.scaleLTBounds = function (bb) {
        var x = bb.left * this.cellWidth;
        var y = bb.top * this.cellHeight;
        var w = bb.width * this.cellWidth;
        var h = bb.height * this.cellHeight;
        return coords.mk.fromLtwh(x, y, w, h);
    };
    ReflowWidget.prototype.getCellContent = function (graphCell) {
        var reflowRTree = this.reflowRTree;
        // RTree cells are 4x4 for indexing purposes, this query is centered within the cell (not touching the edges)
        var rtreeQuery = coords.mk.fromLtwh(graphCell.x * 4 + 1, graphCell.y * 4 + 1, 1, 1);
        var cellContent = reflowRTree.search(rtreeQuery);
        if (cellContent.length > 1) {
            console.error("more than one thing found at grid cell ", graphCell);
        }
        return cellContent[0];
    };
    ReflowWidget.prototype.getBoxContent = function (cellBox) {
        return this.reflowRTree.search(coords.mk.fromLtwh(cellBox.left * 4 + 1, cellBox.top * 4 + 1, ((cellBox.spanRight + 1) * 4) - 2, ((cellBox.spanDown + 1) * 4) - 2));
    };
    ReflowWidget.prototype.getCellNum = function (graphCell) {
        return graphCell.y * this.colCount + graphCell.x;
    };
    ReflowWidget.prototype.setMouseHandlers = function (handlers) {
        mhs.setMouseHandlers(this, this.frameId, handlers);
    };
    ReflowWidget.prototype.updateCellHoverHighlight = function (hoverGraphCell) {
        var _this = this;
        this.d3$textgridSvg
            .selectAll('.cell-focus')
            .remove();
        this.d3$textgridSvg
            .append('rect')
            .classed('cell-focus', true)
            .call(d3x.initRect, function () { return _this.graphCellToClientBounds(hoverGraphCell); })
            .call(d3x.initStroke, 'blue', 1, 0.4)
            .call(d3x.initFill, 'yellow', 0.4);
    };
    ReflowWidget.prototype.clearLabelHighlights = function () {
        var _this = this;
        _.each(['LabelCover', 'Heading', 'Cell', 'LabelKey'], function (cls) {
            _this.d3$textgridSvg
                .selectAll("rect." + cls)
                .attr('fill-opacity', 0);
        });
    };
    ReflowWidget.prototype.showLabelHighlights = function (cell) {
        var classes = TGI.gridRegions.labels(cell.region);
        var cls = classes[classes.length - 1];
        // console.log('hovering', classes);
        if (cell.region.isLabelCover() || cell.region.isHeading()) {
            this.clearLabelHighlights();
            this.d3$textgridSvg
                .selectAll("rect." + cls)
                .attr('fill-opacity', 0.5);
        }
        else if (cell.region.isLabelKey()) {
            this.clearLabelHighlights();
            this.d3$textgridSvg
                .selectAll("rect." + cls)
                .attr('fill-opacity', 0.5);
        }
    };
    return ReflowWidget;
}());
exports.ReflowWidget = ReflowWidget;
