//
import * as $ from 'jquery';
import * as _ from 'lodash';

import {Vue, Component, Prop } from "vue-property-decorator";

import * as rtree from "rbush";

import {
  coords,
  utils,
  MouseHandlerSets as mhs,
  MouseHandlerSet,
  mk,
  GridTypes,
  Point,
  BBox,
  tstags
} from "sharedLib";


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


@Component
export default class TextGraph extends Vue {
  @Prop({default: 0}) gridNum!: number;
  @Prop({default: 900}) initialGridWidth!: number;
  @Prop({default: 20}) lineHeight!: number;

  public textgridRTree: rbush.RBush<TextDataPoint> = rtree<TextDataPoint>();


  get frameId(): string { return `textgrid-frame-${this.gridNum}`; }
  get canvasId(): string { return `textgrid-canvas-${this.gridNum}`; }
  get svgId(): string { return `textgrid-svg-${this.gridNum}`; }

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
    return `width: ${this.initialGridWidth}px; height: ${this.gridHeight}px; background: red;`;
  }

  mounted() {

    this.initialCandidates();
    // this.initHoverReticles();
    // this.setMouseHandlers([
    //   defaultMouseHandlers,
    // ]);

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
        const textgrid = initGridData(p.textgrid, pageNum, textWidth, origin, textHeight);

        return textgrid;
      });

      this.drawGlyphs(textgrids[0]);

      // textgridWidgets.append(textgrid0);


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

  setMouseHandlers(handlers: ((widget: TextGraph) => MouseHandlerSet)[]) {
    mhs.setMouseHandlers(this, this.frameId, handlers);
  }
}
