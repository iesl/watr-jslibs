//
// import * as $ from 'jquery';
import _ from 'lodash';

import { Vue, Component, Prop, Watch } from "vue-property-decorator";

import {
  Module,
  GetterTree,
  MutationTree,
  ActionTree,
  Plugin
} from 'vuex';

import {namespace} from "vuex-class";

import rtree from "rbush";

import {
  TextDataPoint,
  initGridData,
  GridData
} from '../../lib/TextGlyphDataTypes'

import {
  resizeCanvas
} from '../../lib/CanvasUtils'


import {
  coords,
  MouseHandlerSets as mhs,
  MouseHandlers,
  GridTypes,
  Point,
  BBox,
  tstags,
  d3x,
  getOrDie
} from "sharedLib";

/**
 * Given TextGrid data, produce a list of pairs of bounding box data, one
 * matching the position of the original glyphs extracted from the PDF, the
 * other for the pure extracted text view
 */


function defaultMouseHandlers(widget: TextGraph): MouseHandlers {
  return {
    mousedown: (event: object)  => {
      const userPt = coords.mkPoint.offsetFromJqEvent(event);

      const textgridRTree = widget.textgridRTree;

      const queryWidth = 2;
      const queryBoxHeight = 2;
      const queryLeft = userPt.x - queryWidth / 2;
      const queryTop = userPt.y - queryBoxHeight / 2;
      const queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

      const hits: TextDataPoint[] = textgridRTree.search(queryBox);

      const queryHits = _.sortBy(
        _.filter(hits, (hit) => hit.glyphData !== undefined),
        (hit) => [hit.minY, hit.minX]
      );


      if (queryHits.length > 0) {
        widget.setClickedText(queryHits[0]);
      }
    },
    mousemove: (event: object)  => {
      const userPt = coords.mkPoint.offsetFromJqEvent(event);

      const textgridRTree = widget.textgridRTree;

      const queryWidth = 4;
      const queryBoxHeight = 4;
      const queryLeft = userPt.x - queryWidth / 2;
      const queryTop = userPt.y - queryBoxHeight / 2;
      const queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

      const hits: TextDataPoint[] = textgridRTree.search(queryBox);

      const queryHits = _.sortBy(
        _.filter(hits, (hit) => hit.glyphData !== undefined),
        (hit) => [hit.minY, hit.minX]
      );


      widget.hoverQuery = [ queryBox ];
      widget.setHoveredText(queryHits);
    },
  };

}


const textGraphState = namespace("textGraphState");

export class TextGraphState {
  hoveredText: TextDataPoint[] = [];
  clickedText: [ TextDataPoint ] | [] = [];
}


export class TextGraphStateModule implements Module<TextGraphState, any> {
  namespaced: boolean = true

  state: TextGraphState =  new TextGraphState();

  actions = <ActionTree<TextGraphState, any>> {}

  mutations = <MutationTree<TextGraphState>> {
    setHoveredText(state: TextGraphState, hoveredText: TextDataPoint[]) {
      state.hoveredText = hoveredText;
    },

    setClickedText(state: TextGraphState, newVal: TextDataPoint) {
      state.clickedText = [newVal];
    }
  }

  getters = <GetterTree<TextGraphState, any>> {}

  plugins: Plugin<TextGraphState>[] = []

  constructor() {
  }

}


/** Page sync flashing indicator dot */
function scrollSyncIndicator(parentSelection: string, indicatorPoint: Point): void {
  d3x.d3id(parentSelection)
    .append('circle')
    .attr("cx", indicatorPoint.x)
    .attr("cy", indicatorPoint.y)
    .attr("r", 20)
    .call(d3x.initStroke, 'black', 1, 0)
    .call(d3x.initFill, 'red', 1)
    .transition()
    .duration(300)
    .attr("r", 2)
    .attr("fill-opacity", 0)
    .attr("stroke-opacity", 1)
    .attr("pointer-events", "none")
    .delay(10)
    .remove()
  ;
}

@Component
export default class TextGraph extends Vue {
  @Prop({default: 0}) gridNum!: number;
  @Prop({default: 400}) initialGridWidth!: number;
  @Prop({default: 20}) lineHeight!: number;
  @Prop({default: 20}) pageMargin!: number;
  @Prop() textgrid!: GridTypes.Textgrid;


  public textgridRTree: rbush.RBush<TextDataPoint> = rtree<TextDataPoint>();


  @textGraphState.State hoveredText!: TextDataPoint[];
  @textGraphState.State clickedText!: TextDataPoint[];
  @textGraphState.Mutation("setHoveredText") setHoveredText!: (v: TextDataPoint[]) => void;
  @textGraphState.Mutation("setClickedText") setClickedText!: (v: TextDataPoint) => void;

  hoverQuery: BBox[] = [];

  initHovers() {
    this.selectSvg()
      .append("g")
      .classed("reticles", true);
  }

  @Watch("clickedText")
  onClickedTextChanged(newVal: TextDataPoint[], _: TextDataPoint[]): void {
    if (newVal.length > 0) {
      const clicked = newVal[0];

      scrollSyncIndicator(
        this.svgId,
        clicked.gridBBox.centerPoint
      );

    }
  }

  @Watch("hoverQuery")
  onHoverQueryChange(newVal: BBox[], _: BBox[]): void {

    const queryBoxSel = this.selectSvg()
      .select("g.reticles")
      .selectAll("rect.query-reticle")
    // @ts-ignore
      .data(newVal, (d: BBox) => [d.x, d.y] )
    ;

    queryBoxSel.enter()
      .append("rect")
      .classed("query-reticle", true)
      .attr("pointer-events", "none")
      .call(d3x.initStroke, "blue", 1, 0.6)
      .call(d3x.initFill, "blue", 0.3)
      .call(d3x.initRect, (d: any) => d)
    ;

    queryBoxSel.exit().remove();
  }

  @Watch("hoveredText")
  onHoveredText(newVal: TextDataPoint[], oldVal: TextDataPoint[]): void {
    const newIds = new Set(_.map(newVal, v => v.id));
    const oldIds = new Set(_.map(oldVal, v => v.id));
    const eqIds = _.isEqual(newIds, oldIds);

    if (!eqIds) {
      const d3$hitReticles = this.selectSvg()
        .select("g.reticles")
        .selectAll("rect.hit-reticle")
        .data(newVal, (d: any) => d.id)
      ;

      d3$hitReticles .enter()
        .append("rect")
        .classed("hit-reticle", true)
        .attr("id", (d: any) => d.id)
        .attr("pointer-events", "none")
        .call(d3x.initRect, (d: any) => d.gridBBox)
        .call(d3x.initStroke, "green", 1, 0.5)
        .call(d3x.initFill, "yellow", 0.5)
      ;

      d3$hitReticles.exit()
        .remove();
    }
  }

  get frameId(): string { return `textgrid-frame-${this.gridNum}`; }
  get canvasId(): string { return `textgrid-canvas-${this.gridNum}`; }
  get svgId(): string { return `textgrid-svg-${this.gridNum}`; }

  selectSvg() {
    return d3x.d3id(this.svgId);
  }

  get canvasElement(): HTMLCanvasElement {
    return tstags.$id(this.canvasId)[0] as HTMLCanvasElement;
  }

  get canvasContext2D(): CanvasRenderingContext2D {
    return getOrDie<CanvasRenderingContext2D>(this.canvasElement.getContext("2d"), "error getting canvas.getContext(2d)");
  }

  protected zgridHeight: number = 10;
  get gridHeight(): number {
    return this.zgridHeight;
  }

  set gridHeight(w: number) {
    this.zgridHeight = w;
  }

  protected zgridWidth: number = this.initialGridWidth;
  get gridWidth(): number {
    return this.zgridWidth;
  }
  set gridWidth(w: number) {
    this.zgridWidth = w;
  }


  get dimensionStyle(): string {
    return `width: ${this.gridWidth}px; height: ${this.gridHeight}px;`;
  }

  mounted() {
    this.gridWidth = this.initialGridWidth;
    this.initialCandidates();

    this.setMouseHandlers([
      defaultMouseHandlers,
    ]);
    this.initHovers();

  }

  resizeElements(w: number, h: number): void {
    resizeCanvas(this.canvasElement, w, h);
    // const svgElem = getOrDie(document.getElementById(this.svgId)) ;
    // svgElem.setAttribute('width', w.toString());
    // svgElem.setAttribute('height', h.toString());

    this.gridWidth = w;
    this.gridHeight = h;
  }

  initialCandidates(): void {

    this.initCanvasContext();

    const context2d = this.canvasContext2D;

    const textWidth = (s: string) => context2d.measureText(s).width;
    const textHeight = this.lineHeight;
    const origin = new Point(this.pageMargin, this.pageMargin, coords.CoordSys.GraphUnits);
    const textgrid: GridData = initGridData(this.textgrid, this.gridNum, textWidth, origin, textHeight);
    const gridWidth = textgrid.maxLineWidth + this.pageMargin;
    const gridHeight = textgrid.totalLineHeight + this.pageMargin;

    this.resizeElements(gridWidth, gridHeight);

    this.drawGlyphs(textgrid.textDataPoints);

    this.textgridRTree.load(textgrid.textDataPoints);

  }

  initCanvasContext(): void {
    const context2d = this.canvasContext2D;
    context2d.font = `normal normal normal ${this.lineHeight}px/normal Times New Roman`;
  }

  drawGlyphs(textDataPoints: TextDataPoint[]): void {
    const context2d = this.canvasContext2D;

    _.each(textDataPoints, textDataPoint => {
      const c = textDataPoint.char;
      const x = textDataPoint.minX;
      const y = textDataPoint.maxY;
      context2d.fillText(c, x, y);
    });


  }

  setMouseHandlers(handlers: ((widget: TextGraph) => MouseHandlers)[]) {
    mhs.setMouseHandlers(this, this.frameId, handlers);
  }


}
