import _ from 'lodash';

import { Vue, Component, Prop, Watch } from "vue-property-decorator";


import {
  MutationTree,
} from 'vuex';

import {namespace} from "vuex-class";

import {
  TextDataPoint,
  GridData,
  initGridData,
  gridDataToGlyphData
} from '~/lib/TextGlyphDataTypes'

import {
  coords,
  MouseHandlerSets as mhs,
  MouseHandlers,
  GridTypes,
  Point,
  BBox,
  d3x,
} from "sharedLib";

import RBush from "rbush";

const pdfPageState = namespace("pdfPageState");

export class PdfPageState {
  hoveredText: TextDataPoint[] = [];
  clickedText: [ TextDataPoint ] | [] = [];
}

export const PdfPageMutations = <MutationTree<PdfPageState>> {
  setHoveredText(state: PdfPageState, hoveredText: TextDataPoint[]) {
    // console.log('setting hover', state);
    state.hoveredText = hoveredText;
  },

  setClickedText(state: PdfPageState, newVal: TextDataPoint) {
    state.clickedText = [newVal];
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
      console.log('mouse @', userPt);

      const glyphRTree = widget.glyphRTree;

      const queryWidth = 4;
      const queryBoxHeight = 4;
      const queryLeft = userPt.x - queryWidth / 2;
      const queryTop = userPt.y - queryBoxHeight / 2;
      const queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

      const hits: TextDataPoint[] = glyphRTree.search(queryBox);
      console.log('hits', hits);

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
class PdfPage extends Vue {
  @Prop({default: 0}) pageNum!: number;
  @Prop() textgrid!: GridTypes.Textgrid;
  @Prop({default: false}) initDataReady!: boolean;

  @pdfPageState.State hoveredText!: TextDataPoint[];
  @pdfPageState.State clickedText!: TextDataPoint[];
  @pdfPageState.Mutation("setHoveredText") setHoveredText!: (v: TextDataPoint[]) => void;
  @pdfPageState.Mutation("setClickedText") setClickedText!: (v: TextDataPoint) => void;

  hoverQuery: BBox[] = [];

  public glyphRTree: RBush<TextDataPoint> = new RBush<TextDataPoint>();

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
    console.log('on hover', newVal);

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
    // console.log('initDataReady');
    if (newVal) {
      this.initialCandidates();
    }
  }
    // <svg :id="svgId" :style="dimensionStyle" :width="pageWidth" :height="pageHeight" class="page-image">
    // <image :width="pageWidth" :height="pageHeight" :style="dimensionStyle" :href="imageHref"></image>
    // </svg>

  mounted() {

    this.$nextTick(() => {
      console.log('mounted');

      d3x.d3id(this.imageContentId)
        .append("svg").classed("page-image", true)
        .attr("id", this.svgId)
        .attr("page", this.pageNum)
        .attr("width", this.pageWidth)
        .attr("height", this.pageHeight)
        .attr("style", this.dimensionStyle)
      ;

      this.initHoverReticles();

      this.initialCandidates();
      this.setMouseHandlers([
        defaultMouseHandlers,
      ]);

    })
  }

  initHoverReticles() {
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

  @Watch("hoverQuery")
  onHoverQueryChange(newVal: BBox[], _: BBox[]): void {
    // console.log('onHoverQueryChange', newVal)

    // // @ts-ignore
    // const queryBoxSel = this.selectSvg()
    //   .select("g.reticles")
    //   .selectAll("rect.query-reticle")
    // // @ts-ignore
    //   .data(newVal, (d: BBox) => {
    //     console.log('onHoverQueryChange: (d)', d)

    //     return [d.left, d.top];
    //   })
    // ;

    // queryBoxSel.enter()
    //   .append("rect")
    //   .classed("query-reticle", true)
    //   .attr("pointer-events", "none")
    //   .call(d3x.initStroke, "blue", 1, 0.6)
    //   .call(d3x.initFill, "blue", 0.3)
    //   .call(d3x.initRect, (d: any) => d)
    // ;

    // queryBoxSel.exit().remove();
  }

  setMouseHandlers(handlers: ((widget: PdfPage) => MouseHandlers)[]) {
    mhs.setMouseHandlers(this, this.frameId, handlers);
  }

  initialCandidates(): void {
    const textgridData = this.$props.textgrid;
    const textGridPage0 = textgridData.pages[0].textgrid;
    const tmpPageMargin = 10;
    const origin = new Point(tmpPageMargin, tmpPageMargin, coords.CoordSys.GraphUnits);
    // console.log('textgrid input= ', textgridData);
    // const textgrid: GridData = initGridData(textgridData, this.pageNum, _ => 10, origin, 10);
    const textgrid: GridData = initGridData(textGridPage0, this.pageNum, _ => 10, origin, 10);
    // console.log('textgrid output= ', textgrid);

    // this.drawGlyphs(textgrid.textDataPoints);
    const glyphData = gridDataToGlyphData(textgrid.textDataPoints);

    // console.log('init grid data', textgrid.textDataPoints.slice(0, 10));
    // console.log('init glyph data', glyphData.slice(0, 10));
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

import { createComponent, onMounted, ref } from '@vue/composition-api';
import { useEventlibCore } from '~/components/eventlib-core'
import { useImgCanvasSvgOverlays } from '~/components/elem-overlays'
import { initState } from '../component-basics';

export default createComponent({
  // components: {},

  props: {
    pageNum: Number,
    textgrid: Object,
    initDataReady: Boolean,
    frameId: String
  },

  setup() {

    const state = initState();

    const pageOverlays = ref(null);
    const containerRef = pageOverlays;

    const eventLib = useEventlibCore({ targetDivRef: pageOverlays, state });
    const elemOverlay = useImgCanvasSvgOverlays({ containerRef, state });

    elemOverlay.setImageSource(`http://localhost:3100/corpus-entry-0/page-images/page-1.opt.png`);

    // arbitrary starting dim
    elemOverlay.setDimensions(600, 800);
    // - Load testgrid data for glyph hovering
    // - Load tracelog shape data
    // - use selection rect module

    onMounted(() => {
      // testing data
      // const bbox = coords.mk.fromLtwh(20, 40, 200, 444);
      // eventLib.loadShapes([bbox]);
    });

    return {
      pageOverlays
    };
  }

});
