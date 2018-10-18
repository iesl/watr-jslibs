/**
 *
 */

import * as _ from "lodash";
import * as coords from "./coord-sys";
import * as d3x from "./d3-extras";
import {$id, t} from "./tstags";
import * as mhs from "./MouseHandlerSets";
import * as rtrees from "./rtrees";

import * as rx from "rxjs";

import rtree from "rbush";

export class TextgridWidgets {
    private textgrids: TextgridWidget[] = [];
    private containerId: string = "TextGridWidgets";

    public append(textgrid: object): void {
        const gridNum = this.textgrids.length;
        const w = new TextgridWidget("TextGridWidgetsList", textgrid, gridNum);
        this.textgrids.push(w);
        w.init();
    }

    public getRootNode() {
        const node =
            t.div(`#${this.containerId}`, [
                t.div(`#${this.containerId}Status`),
                t.div(`#${this.containerId}List`)
            ]);

        return node;
    }

}

interface ITextGrid {
    rows: object[];
}

interface IGridDataPt extends coords.ILTBounds {
    id: string;
    char: string;
    glyphDataPt: IGlyphDataPt;
}
interface IGlyphDataPt {
    gridDataPt: IGridDataPt;
}

interface IHoverGlyphHit {
    gridDataPt: IGridDataPt;
}

interface IHoverTextEvent {
    queryBox: coords.BBox;
    queryHits: IGridDataPt[];
}

interface IHoverGlyphEvent {
    queryBox: coords.BBox;
    queryHits: IHoverGlyphHit[];
}

interface IMouseHandlers {
    mouseover?: (ev: object) => void;
    mouseout?: (ev: object) => void;
    mouseup?: (ev: object) => void;
    mousedown?: (ev: object) => void;
    mousemove?: (ev: object) => void;
    click?: (ev: object) => void;
}

export class TextgridWidget {
    public containerId: string;
    public gridNum: number;
    public textgrid: any;
    public frameId: string;
    public canvasId: string;
    public svgId: string;

    public hoveringText = new rx.Subject<IHoverTextEvent>();
    public hoveringGlyphs = new rx.Subject<IHoverGlyphEvent>();

    // public textgridRTrsee: rbush.RBush<rbush.BBox> = rtree();
    public textgridRTree: rbush.RBush<IGridDataPt> = rtree<IGridDataPt>();

    private options = {
        TextGridLineHeight:  20,
        TextGridOriginPt: coords.mkPoint.fromXy(20, 20, coords.CoordSys.Unknown),

    };

    constructor(containerId: string, textgrid: object, gridNum: number) {
        this.containerId = containerId;
        this.gridNum = gridNum;
        this.textgrid = textgrid;

        this.frameId  = `textgrid-frame-${gridNum}`;
        this.canvasId = `textgrid-canvas-${gridNum}`;
        this.svgId    = `textgrid-svg-${gridNum}`;

    }

    public init() {
        const widget = this;

        const options = widget.options;

        const computeGridHeight = (grid: ITextGrid) => {
            return (grid.rows.length * options.TextGridLineHeight) + options.TextGridOriginPt.y + 10;
        };

        const fixedTextgridWidth = 900;
        const textgrid = widget.textgrid;
        const gridNum = widget.gridNum;
        const gridHeight = computeGridHeight(textgrid);

        const gridNodes =
            t.div(`.textgrid #${widget.frameId}`, {
                style: `width: 900px; height:${gridHeight}px`,
                // width: fixedTextgridWidth,
                // height: gridHeight,
            }, [
                    t.canvas(`.textgrid #${widget.canvasId}`, {
                        page: gridNum,
                        width: fixedTextgridWidth,
                        height: gridHeight,
                    })
                ]) ;
        // const gridNodes =
        //     t.div(`.textgrid #${widget.frameId}`, [
        //             t.canvas(`.textgrid #${widget.canvasId}`, {
        //                 page: gridNum,
        //                 width: fixedTextgridWidth,
        //                 height: gridHeight,
        //             })
        //         ]) ;

        // console.log("appending", gridNodes, "to", widget.containerId);

        $id(widget.containerId).append(gridNodes);

        d3x.d3$id(widget.frameId)
            .append("svg").classed("textgrid", true)
            .attr("id", widget.svgId)
            .attr("page", gridNum)
            .attr("width", fixedTextgridWidth)
            .attr("height", gridHeight)
        ;
        $id(widget.frameId).width(
            $id(widget.frameId).width()
        );
        $id(widget.frameId).height(
            $id(widget.frameId).height()
        );
        // console.log('the height is', $id(widget.frameId).height());

        widget.textgridRTree = rtree();
        widget.initHoverReticles();

        widget.setMouseHandlers([
            defaultMouseHandlers,
        ]);

        const canvas = $id(widget.canvasId)[0] as HTMLCanvasElement;
        const context2d = canvas.getContext("2d");

        if (context2d === null) {
            throw new Error("error getting canvas.getContext(\"2d\")");
        } else {
            context2d.font = `normal normal normal ${options.TextGridLineHeight}px/normal Times New Roman`;
            const gridTextOrigin = coords.mkPoint.fromXy(20, 20, coords.CoordSys.Unknown);
            const gridDatas: any = rtrees.initGridData([textgrid], [context2d], gridTextOrigin);
            const gridData: IGridDataPt[][] = gridDatas as IGridDataPt[][];

            // console.log("gridData", gridData);

            widget.textgridRTree.load(gridData[0]);
            widget.hoveringText.subscribe((ev: IHoverTextEvent) => {
                widget.showGlyphHoverReticles(ev);
            });

        }

    }

    public selectSvg() {
        return d3x.d3$id(this.svgId);
    }


    public setMouseHandlers(handlers: Array<(widget: TextgridWidget) => IMouseHandlers>) {
        mhs.setMouseHandlers(this, this.frameId, handlers);
    }

    public initHoverReticles() {
        const reticleGroup = this.selectSvg()
            .append("g")
            .classed("reticles", true);

        reticleGroup
            .append("rect")
            .classed("query-reticle", true)
            .call(d3x.initStroke, "blue", 1, 0.6)
            .call(d3x.initFill, "blue", 0.3)
        ;

        return reticleGroup;
    }

    public showGlyphHoverReticles(event: IHoverTextEvent) {

        this.selectSvg().select("g.reticles")
            .select("rect.query-reticle")
            .call(d3x.initRect, () => event.queryBox) ;

        const d3$hitReticles =
            this.selectSvg().select("g.reticles")
            .selectAll("rect.hit-reticle")
            .data(event.queryHits, (d: any) => d.id)
        ;

        d3$hitReticles .enter()
            .append("rect")
            .classed("hit-reticle", true)
            .attr("id", (d) => d.id)
            .call(d3x.initRect, (d: any) => d)
            .call(d3x.initStroke, "green", 1, 0.5)
            .call(d3x.initFill, "yellow", 0.5)
        ;

        d3$hitReticles.exit()
            .remove() ;
    }

    public emitHovers(e: IHoverTextEvent) {

        this.hoveringText.next(e);

        const hoveredGlyphs = _.filter(_.map(e.queryHits, (h) => h.glyphDataPt), (g) => g !== undefined);

        this.hoveringGlyphs.next({
            queryBox: e.queryBox,
            queryHits: hoveredGlyphs
        });
    }

}

function defaultMouseHandlers(widget: TextgridWidget): IMouseHandlers {
    return {
        mousemove: (event: object)  => {
            const userPt = coords.mkPoint.offsetFromJqEvent(event);

            const textgridRTree = widget.textgridRTree;

            const queryWidth = 2;
            // const queryBoxHeight = widget.options.TextGridLineHeight * 2;
            const queryBoxHeight = 2;
            const queryLeft = userPt.x - queryWidth;
            const queryTop = userPt.y - queryBoxHeight;
            const queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

            const hits: IGridDataPt[] = textgridRTree.search(queryBox);

            const queryHits = _.sortBy(
                _.filter(hits, (hit) => hit.glyphDataPt !== undefined),
                (hit) => [hit.bottom, hit.left]
            );
            widget.emitHovers({
                queryBox, queryHits
            });
        },
    };

}

//
export function displayRx(widget: TextgridWidget) {
    const hoverState = t.div("hovering text: ", [
        t.span("#HoverState").text("??")
    ]);
    const hoverGlyphState = t.div("hovering glyphs: ", [
        t.span("#HoverGlyphState").text("??")
    ]);
    const node =
        t.div([
            hoverState,
            hoverGlyphState
        ]);

    widget.hoveringText.subscribe((ev: IHoverTextEvent) => {
        const chars = _.join(_.map(ev.queryHits, (h) => h.char), "");
        const s1 = _.join(ev.queryHits, ", ");
        const msg = `"${chars}"  (${ev.queryBox}) ==> hits: ${s1}`;
        $("#HoverState").text(msg);
    });
    widget.hoveringGlyphs.subscribe((ev: IHoverGlyphEvent) => {
        const s1 = _.join(ev.queryHits, ", ");
        $("#HoverGlyphState").text(s1);
    });
    return node;

}
