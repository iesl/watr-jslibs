
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

import {
  TextDataPoint,
  GridData,
  initGridData,
  gridDataToGlyphData
} from '../../lib/TextGlyphDataTypes'


import {
  coords,
  MouseHandlerSets as mhs,
  MouseHandlers,
  GridTypes,
  Point,
  BBox,
  d3x,
} from "sharedLib";

import rtree from "rbush";

const pdfPageState = namespace("pdfPageState");

export class PdfPageState {
  hoveredText: TextDataPoint[] = [];
  clickedText: [ TextDataPoint ] | [] = [];
}

export class PdfPageStateModule implements Module<PdfPageState, any> {
  namespaced: boolean = true

  state: PdfPageState =  new PdfPageState();

  actions = <ActionTree<PdfPageState, any>> {}

  mutations = <MutationTree<PdfPageState>> {
    setHoveredText(state: PdfPageState, hoveredText: TextDataPoint[]) {
      state.hoveredText = hoveredText;
    },

    setClickedText(state: PdfPageState, newVal: TextDataPoint) {
      state.clickedText = [newVal];
    }
  }

  getters = <GetterTree<PdfPageState, any>> {}

  plugins: Plugin<PdfPageState>[] = []

  constructor() {
  }

}

function defaultMouseHandlers(widget: PdfPage): MouseHandlers {
  return {
    mousedown: (event: object)  => {
      const userPt = coords.mkPoint.offsetFromJqEvent(event);

      const glyphRTree = widget.glyphRTree;

      const queryWidth = 2;
      const queryBoxHeight = 2;
      const queryLeft = userPt.x - queryWidth / 2;
      const queryTop = userPt.y - queryBoxHeight / 2;
      const queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

      const hits: TextDataPoint[] = glyphRTree.search(queryBox);

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

      const glyphRTree = widget.glyphRTree;

      const queryWidth = 4;
      const queryBoxHeight = 4;
      const queryLeft = userPt.x - queryWidth / 2;
      const queryTop = userPt.y - queryBoxHeight / 2;
      const queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

      const hits: TextDataPoint[] = glyphRTree.search(queryBox);

      const queryHits = _.sortBy(
        _.filter(hits, (hit) => hit.glyphData !== undefined),
        (hit) => [hit.minY, hit.minX]
      );

      widget.hoverQuery = [ queryBox ];
      widget.setHoveredText(queryHits);
    },
  };

}


@Component
export default class PdfPage extends Vue {
  @Prop({default: 0}) pageNum!: number;
  @Prop() textgrid!: GridTypes.Textgrid;
  @Prop({default: false}) initDataReady!: boolean;

  @pdfPageState.State hoveredText!: TextDataPoint[];
  @pdfPageState.State clickedText!: TextDataPoint[];
  @pdfPageState.Mutation("setHoveredText") setHoveredText!: (v: TextDataPoint[]) => void;
  @pdfPageState.Mutation("setClickedText") setClickedText!: (v: TextDataPoint) => void;

  hoverQuery: BBox[] = [];

  public glyphRTree: rbush.RBush<TextDataPoint> = rtree<TextDataPoint>();

  get frameId(): string { return `page-image-frame-${this.pageNum}`; }
  get imageContentId(): string { return `page-image-content-${this.pageNum}`; }
  get svgId(): string { return `page-image-svg-${this.pageNum}`; }
  get imageHref(): string { return `http://localhost:3100/corpus-entry-0/page-images/page-1.opt.png`; }

  selectSvg() {
    return d3x.d3id(this.svgId);
  }

  get pageWidth(): number {
    return 600;
  }

  get pageHeight(): number {
    return 800;
  }

  get dimensionStyle(): string {
    return `width: ${this.pageWidth}px; height: ${this.pageHeight}px;`;
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

  @Watch("initDataReady")
  onInitDataReady(newVal: boolean): void {
    console.log('initDataReady');
    if (newVal) {
      this.initialCandidates();
    }
  }

  mounted() {

    this.$nextTick(() => {
      console.log('mounted');
      this.initialCandidates();
      this.setMouseHandlers([
        defaultMouseHandlers,
      ]);

    })
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
  setMouseHandlers(handlers: ((widget: PdfPage) => MouseHandlers)[]) {
    mhs.setMouseHandlers(this, this.frameId, handlers);
  }

  initialCandidates(): void {
    const tmpPageMargin = 10;
    const origin = new Point(tmpPageMargin, tmpPageMargin, coords.CoordSys.GraphUnits);
    const textgrid: GridData = initGridData(this.textgrid, this.pageNum, _ => 10, origin, 10);
    // this.drawGlyphs(textgrid.textDataPoints);
    const glyphData = gridDataToGlyphData(textgrid.textDataPoints);

    console.log('init grid data', textgrid.textDataPoints.slice(0, 10));
    console.log('init glyph data', glyphData.slice(0, 10));
    this.glyphRTree.load(glyphData);

  }

  // drawGlyphs(textDataPoints: TextDataPoint[]): void {
  //   _.each(textDataPoints, textDataPoint => {
  //     const c = textDataPoint.char;
  //     const x = textDataPoint.minX;
  //     const y = textDataPoint.maxY;
  //     // context2d.fillText(c, x, y);
  //   });
  // }
}
