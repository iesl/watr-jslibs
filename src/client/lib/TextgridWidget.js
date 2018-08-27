"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const coords = require("./coord-sys");
const d3x = require("./d3-extras");
const jstags_js_1 = require("./jstags.js");
const mhs = require("./MouseHandlerSets");
const rtrees = require("./rtrees");
const rx = require("rxjs");
const rbush_1 = require("rbush");
class TextgridWidgets {
    append(textgrid) {
        const gridNum = textgrids.size();
        const w = new TextgridWidget(containerId, textgrid, gridNum);
        this.textgrids.push(w);
    }
    getRootNode() {
        displayRx("bad input");
        const listId = this.pageTextWidgetContainerId;
        const node = jstags_js_1.t.div(`.page-text-list-widget`, [
            jstags_js_1.t.div(`#page-texts-status .statusbar`),
            jstags_js_1.t.div("#page-texts .page-texts", [
                jstags_js_1.t.div(`.page-text-widgets`, [
                    jstags_js_1.t.div(`#${listId} .list`),
                ])
            ])
        ]);
    }
}
exports.TextgridWidgets = TextgridWidgets;
class TextgridWidget {
    constructor(containerId, textgrid, gridNum) {
        this.hoveringText = new rx.Subject();
        this.hoveringGlyphs = new rx.Subject();
        this.containerId = containerId;
        this.gridNum = gridNum;
        this.textgrid = textgrid;
        this.frameId = `textgrid-frame-${gridNum}`;
        this.canvasId = `textgrid-canvas-${gridNum}`;
        this.svgId = `textgrid-svg-${gridNum}`;
        this.options = {
            TextGridLineHeight: 20,
            TextGridOriginPt: coords.mkPoint.fromXy(20, 20),
        };
    }
    init() {
        const widget = this;
        const options = widget.options;
        const computeGridHeight = (grid) => {
            return (grid.rows.length * options.TextGridLineHeight) + options.TextGridOriginPt.y + 10;
        };
        const fixedTextgridWidth = 900;
        const textgrid = widget.textgrid;
        const gridNum = widget.gridNum;
        const gridHeight = computeGridHeight(textgrid);
        const gridNodes = jstags_js_1.t.div(`.textgrid #${widget.frameId}`, {
            style: `width: 900; height:${gridHeight}`
        }, [
            jstags_js_1.t.canvas(`.textgrid #${widget.canvasId}`, {
                page: gridNum,
                width: fixedTextgridWidth,
                height: gridHeight,
            })
        ]);
        jstags_js_1.$id(widget.containerId).append(gridNodes);
        d3x.d3$id(widget.frameId)
            .append("svg").classed("textgrid", true)
            .attr("id", widget.svgId)
            .attr("page", gridNum)
            .attr("width", fixedTextgridWidth)
            .attr("height", gridHeight);
        widget.textgridRTree = rbush_1.default();
        widget.initHoverReticles();
        widget.setMouseHandlers([
            defaultMouseHandlers,
        ]);
        const context2d = jstags_js_1.$id(widget.canvasId)[0].getContext("2d");
        context2d.font = `normal normal normal ${options.TextGridLineHeight}px/normal Times New Roman`;
        const gridTextOrigin = coords.mkPoint.fromXy(20, 20);
        const gridData = rtrees.initGridData([textgrid], [context2d], gridTextOrigin);
        widget.textgridRTree.load(gridData[0]);
        widget.hoveringText.subscribe((ev) => {
            widget.showGlyphHoverReticles(ev.queryBox, ev.queryHits);
        });
    }
    selectSvg() {
        return d3x.d3$id(this.svgId);
    }
    setMouseHandlers(handlers) {
        mhs.setMouseHandlers(this, this.frameId, handlers);
    }
    initHoverReticles() {
        const reticleGroup = this.selectSvg()
            .append("g")
            .classed("reticles", true);
        reticleGroup
            .append("rect")
            .classed("query-reticle", true)
            .call(d3x.initStroke, "blue", 1, 0.6)
            .call(d3x.initFill, "blue", 0.3);
        return reticleGroup;
    }
    showGlyphHoverReticles(queryBox, queryHits) {
        this.selectSvg().select("g.reticles")
            .select("rect.query-reticle")
            .call(d3x.initRect, () => queryBox);
        const d3$hitReticles = this.selectSvg().select("g.reticles")
            .selectAll("rect.hit-reticle")
            .data(queryHits, (d) => d.id);
        d3$hitReticles.enter()
            .append("rect")
            .classed("hit-reticle", true)
            .attr("id", (d) => d.id)
            .call(d3x.initRect, (d) => d)
            .call(d3x.initStroke, "green", 1, 0.5)
            .call(d3x.initFill, "yellow", 0.5);
        d3$hitReticles.exit()
            .remove();
    }
    emitHovers(queryBox, queryHits) {
        this.hoveringText.next({
            queryHits,
            queryBox
        });
        const hoveredGlyphs = _.filter(_.map(queryHits, (h) => h.glyphDataPt), (g) => g !== undefined);
        this.hoveringGlyphs.next({
            hoveredGlyphs
        });
    }
}
exports.TextgridWidget = TextgridWidget;
function defaultMouseHandlers(widget) {
    return {
        mousedown: (event) => undefined,
        mouseup: (event) => undefined,
        mousemove: (event) => {
            const userPt = coords.mkPoint.offsetFromJqEvent(event);
            const textgridRTree = widget.textgridRTree;
            const queryWidth = 2;
            const queryBoxHeight = 2;
            const queryLeft = userPt.x - queryWidth;
            const queryTop = userPt.y - queryBoxHeight;
            const queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);
            const hits = textgridRTree.search(queryBox);
            const neighborHits = _.sortBy(_.filter(hits, (hit) => hit.glyphDataPt !== undefined), (hit) => [hit.bottom, hit.left]);
            widget.emitHovers(queryBox, neighborHits);
        },
    };
}
function displayRx(widget) {
    const hoverState = jstags_js_1.t.div("hovering text: ", [
        jstags_js_1.t.span("#HoverState").text("??")
    ]);
    const hoverGlyphState = jstags_js_1.t.div("hovering glyphs: ", [
        jstags_js_1.t.span("#HoverGlyphState").text("??")
    ]);
    const node = jstags_js_1.t.div([
        hoverState,
        hoverGlyphState
    ]);
    widget.hoveringText.subscribe((ev) => {
        const chars = _.join(_.map(ev.queryHits, (h) => h.char), "");
        const s1 = _.join(ev.queryHits, ", ");
        const msg = `"${chars}"  (${ev.queryBox}) ==> hits: ${s1}`;
        $("#HoverState").text(msg);
    });
    widget.hoveringGlyphs.subscribe((ev) => {
        const s1 = _.join(ev.hoveredGlyphs, ", ");
        $("#HoverGlyphState").text(s1);
    });
    return node;
}
exports.displayRx = displayRx;
//# sourceMappingURL=TextgridWidget.js.map