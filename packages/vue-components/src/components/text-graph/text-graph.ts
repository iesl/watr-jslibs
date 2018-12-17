//
import * as $ from 'jquery';
import * as _ from 'lodash';
import * as d3 from 'd3';

import { Vue, Component, Prop, Watch } from "vue-property-decorator";

import * as rtree from "rbush";

import {
  coords,
  utils,
  MouseHandlerSets as mhs,
  MouseHandlers,
  mk,
  GridTypes,
  Point,
  BBox,
  tstags,
  d3x
} from "sharedLib";

// TODO copypasta
export function d3id(selector: string) {
  return d3.select(`#${selector}`);
}

/**
 * Given TextGrid data, produce a list of pairs of bounding box data, one
 * matching the position of the original glyphs extracted from the PDF, the
 * other for the pure extracted text view
 */

type Width = number;
type MeasureTextWidth = (ch: string) => Width;


interface GridCellData {
  row: number;
  col: number;
  page: number;
}

interface GlyphCellData {
  glyphBounds: BBox;
  page: number;
}


interface TextDataPoint extends rbush.BBox {
  id: number;
  char: string;
  glyphData?: GlyphCellData;
  gridCell: GridCellData;

  gridBBox: BBox;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;

}

export function getOrDie<T>(v: T | null, msg: string = "null|undef"): T {
  if (v === null || v === undefined) {
    throw new Error(`Error: ${msg}`);
  }
  return v;
}


export function gridDataToGlyphData(
  textDataPoints: TextDataPoint[]
): TextDataPoint[] {
  return _.map(textDataPoints, (t: TextDataPoint) => {
    const bbox = t.glyphData ?
      t.glyphData.glyphBounds
      : new coords.BBox(0, 0, 0, 0, coords.CoordSys.Unknown);

    const updated: TextDataPoint = {
      ...t,
      minX: bbox.minX,
      minY: bbox.minY,
      maxX: bbox.maxX,
      maxY: bbox.maxY
    };
    return updated;
  });
}

export function initGridData(
  textgrid: GridTypes.Textgrid,
  gridNum: number,
  measureTextWidth: MeasureTextWidth,
  gridTextOrigin: Point,
  gridTextHeight: number
): TextDataPoint[] {

  const idGen = utils.newIdGenerator();

  const gridRowsDataPts = _.map(textgrid.rows, (gridRow, rowNum) => {

    const y = gridTextOrigin.y + ((rowNum+1) * gridTextHeight);
    const x = gridTextOrigin.x;
    const text = gridRow.text;
    let currLeft = x;

    const gridDataPts = _.map(text.split(''), (ch, chi) => {
      const chWidth = measureTextWidth(ch);
      const charLocus = gridRow.loci[chi];

      const gridDataPt = mk.fromLtwh(
        currLeft, y-gridTextHeight, chWidth, gridTextHeight
      );

      const textCellData = {
        row: rowNum,
        col: chi,
        page: gridNum
      };

      const textDataPoint: TextDataPoint = {
        id: idGen(),
        char: ch,
        gridCell: textCellData,
        gridBBox: gridDataPt,
        minX: gridDataPt.minX,
        minY: gridDataPt.minY,
        maxX: gridDataPt.maxX,
        maxY: gridDataPt.maxY
      };

      const isGlyphData = GridTypes.locusIsGlyph(charLocus); // .g !== undefined;

      if (isGlyphData) {
        const charBBox = charLocus.g![0][2];
        textDataPoint.glyphData = {
          glyphBounds: mk.fromArray(charBBox),
          page: charLocus.g![0][1]
        };
      }

      currLeft += chWidth;

      return textDataPoint;
    });

    return gridDataPts;
  });

  return _.flatten(gridRowsDataPts);

}

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

import {
  Module,
  GetterTree,
  MutationTree,
  ActionTree,
  Plugin
} from 'vuex';

import {namespace} from "vuex-class";

const textGraphState = namespace("textGraphState");

export class TextGraphState {
  hoveredText: TextDataPoint[] = [];
  clickedText: [ TextDataPoint ] | [] = [];
}


export class TextGraphStateModule implements Module<TextGraphState, any> {
  namespaced: boolean = true

  state: TextGraphState =  new TextGraphState();

  actions = <ActionTree<TextGraphState, any>> {
  }

  mutations = <MutationTree<TextGraphState>> {
    setHoveredText(state: TextGraphState, hoveredText: TextDataPoint[]) {
      state.hoveredText = hoveredText;
    },

    setClickedText(state: TextGraphState, newVal: TextDataPoint) {
      state.clickedText = [newVal];
    }
  }

  getters = <GetterTree<TextGraphState, any>> {
  }

  plugins: Plugin<TextGraphState>[] = []

  constructor() {
  }

}


/** Page sync flashing indicator dot */
function scrollSyncIndicator(parentSelection: string, indicatorPoint: Point): void {
    // d3.select(parentSelection)
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
        .delay(10)
        .remove()
    ;
}

@Component
export default class TextGraph extends Vue {
  @Prop({default: 0}) gridNum!: number;
  @Prop({default: 900}) initialGridWidth!: number;
  @Prop({default: 20}) lineHeight!: number;


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
  onClickedTextChanged(newVal: TextDataPoint[], oldVal: TextDataPoint[]): void {
    if (newVal.length > 0) {
      const clicked = newVal[0];

      scrollSyncIndicator(
        this.svgId,
        clicked.gridBBox.centerPoint
      );

    }
  }

  @Watch("hoverQuery")
  onHoverQueryChange(newVal: BBox[], oldVal: BBox[]): void {

    const queryBoxSel = this.selectSvg()
      .select("g.reticles")
      .selectAll("rect.query-reticle")
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
        .attr("id", (d) => d.id)
        .attr("pointer-events", "none")
        .call(d3x.initRect, (d: any) => d.gridBBox)
        .call(d3x.initStroke, "green", 1, 0.5)
        .call(d3x.initFill, "yellow", 0.5)
      ;

      d3$hitReticles.exit()
        .remove() ;

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

  get gridHeight(): number {
    return 900;
  }

  get gridWidth(): number {
    return this.initialGridWidth;
  }


  get frameStyle(): string {
    return `width: ${this.initialGridWidth}px; height: ${this.gridHeight}px;`;
  }

  mounted() {
    this.initialCandidates();

    this.setMouseHandlers([
      defaultMouseHandlers,
    ]);
    this.initHovers();

  }

  initialCandidates(): void {

    $.getJSON('http://localhost:3100/textgrids/textgrid-00.json', (textgrid: GridTypes.Grid) => {
      const pages = textgrid.pages;
      this.initCanvasContext();

      const context2d = this.canvasContext2D;

      const textWidth = (s: string) => context2d.measureText(s).width;
      const textHeight = this.lineHeight;
      const origin = new Point(20, 20, coords.CoordSys.GraphUnits);
      const textgrids = _.map(pages, (p, pageNum) => {
        return initGridData(p.textgrid, pageNum, textWidth, origin, textHeight);
      });

      this.drawGlyphs(textgrids[0]);

      this.textgridRTree.load(textgrids[0]);


    }, (err) => {
      console.log('err', err);
    });

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
