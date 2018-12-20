
import * as _ from 'lodash';

import { Vue, Component, Prop, Watch } from "vue-property-decorator";

// import {
//   Module,
//   GetterTree,
//   MutationTree,
//   ActionTree,
//   Plugin
// } from 'vuex';

// import {namespace} from "vuex-class";

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
  getOrDie
} from "sharedLib";

import * as rtree from "rbush";


@Component
export default class PdfPage extends Vue {
  @Prop({default: 0}) pageNum!: number;
  @Prop() textgrid!: GridTypes.Textgrid;

  public glyphRtree: rbush.RBush<TextDataPoint> = rtree<TextDataPoint>();

  get frameId(): string { return `page-image-frame-${this.pageNum}`; }
  get imageContentId(): string { return `page-image-content-${this.pageNum}`; }
  get svgId(): string { return `page-image-svg-${this.pageNum}`; }
  get imageHref(): string { return `http://localhost:3100//corpus-entry-0/page-images/page-1.opt.png`; }

  get pageWidth(): number {
    return 600;
  }

  get pageHeight(): number {
    return 800;
  }

  get dimensionStyle(): string {
    return `width: ${this.pageWidth}px; height: ${this.pageHeight}px;`;
  }

  mounted() {
    this.initialCandidates();
  }

  initialCandidates(): void {
    const tmpPageMargin = 10;
    const origin = new Point(tmpPageMargin, tmpPageMargin, coords.CoordSys.GraphUnits);
    const textgrid: GridData = initGridData(this.textgrid, this.pageNum, _ => 10, origin, 10);
    // this.drawGlyphs(textgrid.textDataPoints);
    this.glyphRtree.load(textgrid.textDataPoints);

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
