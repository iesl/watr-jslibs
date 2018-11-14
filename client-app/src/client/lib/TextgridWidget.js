"use strict";
/**
 *
 */
exports.__esModule = true;
var _ = require("lodash");
var coords = require("./coord-sys");
var d3x = require("./d3-extras");
var tstags_1 = require("./tstags");
var mhs = require("./MouseHandlerSets");
var rtrees = require("./rtrees");
var rx = require("rxjs");
var rbush_1 = require("rbush");
var TextgridWidgets = /** @class */ (function () {
    function TextgridWidgets() {
        this.textgrids = [];
        this.containerId = "TextGridWidgets";
    }
    TextgridWidgets.prototype.append = function (textgrid) {
        var gridNum = this.textgrids.length;
        var w = new TextgridWidget("TextGridWidgetsList", textgrid, gridNum);
        this.textgrids.push(w);
        w.init();
    };
    TextgridWidgets.prototype.getRootNode = function () {
        var node = tstags_1.t.div("#" + this.containerId, [
            tstags_1.t.div("#" + this.containerId + "Status"),
            tstags_1.t.div("#" + this.containerId + "List")
        ]);
        return node;
    };
    return TextgridWidgets;
}());
exports.TextgridWidgets = TextgridWidgets;
var TextgridWidget = /** @class */ (function () {
    function TextgridWidget(containerId, textgrid, gridNum) {
        this.hoveringText = new rx.Subject();
        this.hoveringGlyphs = new rx.Subject();
        // public textgridRTrsee: rbush.RBush<rbush.BBox> = rtree();
        this.textgridRTree = rbush_1["default"]();
        this.options = {
            TextGridLineHeight: 20,
            TextGridOriginPt: coords.mkPoint.fromXy(20, 20, coords.CoordSys.Unknown)
        };
        this.containerId = containerId;
        this.gridNum = gridNum;
        this.textgrid = textgrid;
        this.frameId = "textgrid-frame-" + gridNum;
        this.canvasId = "textgrid-canvas-" + gridNum;
        this.svgId = "textgrid-svg-" + gridNum;
    }
    TextgridWidget.prototype.init = function () {
        var self = this;
        var options = self.options;
        var computeGridHeight = function (grid) {
            return (grid.rows.length * options.TextGridLineHeight) + options.TextGridOriginPt.y + 10;
        };
        var fixedTextgridWidth = 900;
        var textgrid = self.textgrid;
        var gridNum = self.gridNum;
        var gridHeight = computeGridHeight(textgrid);
        var gridNodes = tstags_1.t.div(".textgrid #" + self.frameId, {
            style: "width: 900px; height:" + gridHeight + "px"
        }, [
            tstags_1.t.canvas(".textgrid #" + self.canvasId, {
                page: gridNum,
                width: fixedTextgridWidth,
                height: gridHeight
            })
        ]);
        // const gridNodes =
        //     t.div(`.textgrid #${self.frameId}`, [
        //             t.canvas(`.textgrid #${self.canvasId}`, {
        //                 page: gridNum,
        //                 width: fixedTextgridWidth,
        //                 height: gridHeight,
        //             })
        //         ]) ;
        // console.log("appending", gridNodes, "to", self.containerId);
        tstags_1.$id(self.containerId).append(gridNodes);
        d3x.d3$id(self.frameId)
            .append("svg").classed("textgrid", true)
            .attr("id", self.svgId)
            .attr("page", gridNum)
            .attr("width", fixedTextgridWidth)
            .attr("height", gridHeight);
        tstags_1.$id(self.frameId).width(tstags_1.$id(self.frameId).width());
        tstags_1.$id(self.frameId).height(tstags_1.$id(self.frameId).height());
        // console.log('the height is', $id(self.frameId).height());
        self.textgridRTree = rbush_1["default"]();
        self.initHoverReticles();
        self.setMouseHandlers([
            defaultMouseHandlers,
        ]);
        var canvas = tstags_1.$id(self.canvasId)[0];
        var context2d = canvas.getContext("2d");
        if (context2d === null) {
            throw new Error("error getting canvas.getContext(\"2d\")");
        }
        else {
            context2d.font = "normal normal normal " + options.TextGridLineHeight + "px/normal Times New Roman";
            var gridTextOrigin = coords.mkPoint.fromXy(20, 20, coords.CoordSys.Unknown);
            var gridDatas = rtrees.initGridData([textgrid], [context2d], gridTextOrigin);
            var gridData = gridDatas;
            // console.log("gridData", gridData);
            self.textgridRTree.load(gridData[0]);
            self.hoveringText.subscribe(function (ev) {
                self.showGlyphHoverReticles(ev);
            });
        }
    };
    TextgridWidget.prototype.selectSvg = function () {
        return d3x.d3$id(this.svgId);
    };
    TextgridWidget.prototype.setMouseHandlers = function (handlers) {
        mhs.setMouseHandlers(this, this.frameId, handlers);
    };
    TextgridWidget.prototype.initHoverReticles = function () {
        var reticleGroup = this.selectSvg()
            .append("g")
            .classed("reticles", true);
        reticleGroup
            .append("rect")
            .classed("query-reticle", true)
            .call(d3x.initStroke, "blue", 1, 0.6)
            .call(d3x.initFill, "blue", 0.3);
        return reticleGroup;
    };
    TextgridWidget.prototype.showGlyphHoverReticles = function (event) {
        this.selectSvg().select("g.reticles")
            .select("rect.query-reticle")
            .call(d3x.initRect, function () { return event.queryBox; });
        var d3$hitReticles = this.selectSvg().select("g.reticles")
            .selectAll("rect.hit-reticle")
            .data(event.queryHits, function (d) { return d.id; });
        d3$hitReticles.enter()
            .append("rect")
            .classed("hit-reticle", true)
            .attr("id", function (d) { return d.id; })
            .call(d3x.initRect, function (d) { return d; })
            .call(d3x.initStroke, "green", 1, 0.5)
            .call(d3x.initFill, "yellow", 0.5);
        d3$hitReticles.exit()
            .remove();
    };
    TextgridWidget.prototype.emitHovers = function (e) {
        this.hoveringText.next(e);
        var hoveredGlyphs = _.filter(_.map(e.queryHits, function (h) { return h.glyphDataPt; }), function (g) { return g !== undefined; });
        this.hoveringGlyphs.next({
            queryBox: e.queryBox,
            queryHits: hoveredGlyphs
        });
    };
    return TextgridWidget;
}());
exports.TextgridWidget = TextgridWidget;
function defaultMouseHandlers(widget) {
    return {
        mousemove: function (event) {
            var userPt = coords.mkPoint.offsetFromJqEvent(event);
            var textgridRTree = widget.textgridRTree;
            var queryWidth = 2;
            // const queryBoxHeight = widget.options.TextGridLineHeight * 2;
            var queryBoxHeight = 2;
            var queryLeft = userPt.x - queryWidth;
            var queryTop = userPt.y - queryBoxHeight;
            var queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);
            var hits = textgridRTree.search(queryBox);
            var queryHits = _.sortBy(_.filter(hits, function (hit) { return hit.glyphDataPt !== undefined; }), function (hit) { return [hit.bottom, hit.left]; });
            widget.emitHovers({
                queryBox: queryBox, queryHits: queryHits
            });
        }
    };
}
//
function displayRx(widget) {
    var hoverState = tstags_1.t.div("hovering text: ", [
        tstags_1.t.span("#HoverState").text("??")
    ]);
    var hoverGlyphState = tstags_1.t.div("hovering glyphs: ", [
        tstags_1.t.span("#HoverGlyphState").text("??")
    ]);
    var node = tstags_1.t.div([
        hoverState,
        hoverGlyphState
    ]);
    widget.hoveringText.subscribe(function (ev) {
        var chars = _.join(_.map(ev.queryHits, function (h) { return h.char; }), "");
        var s1 = _.join(ev.queryHits, ", ");
        var msg = "\"" + chars + "\"  (" + ev.queryBox + ") ==> hits: " + s1;
        $("#HoverState").text(msg);
    });
    widget.hoveringGlyphs.subscribe(function (ev) {
        var s1 = _.join(ev.queryHits, ", ");
        $("#HoverGlyphState").text(s1);
    });
    return node;
}
exports.displayRx = displayRx;
