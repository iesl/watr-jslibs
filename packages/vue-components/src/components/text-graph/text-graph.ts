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
  // mkPoint,
  mk,
  GridTypes,
} from "sharedLib";

type Point = coords.Point;
type BBox = coords.BBox;

// const fixedTextgridWidth = 900;

/**
 * Given TextGrid data, produce a list of pairs of bounding box data, one
 * matching the position of the original glyphs extracted from the PDF, the
 * other for the pure extracted text view
 */

type Width = number;
// type Height = number;
type MeasureTextWidth = (ch: string) => Width;


interface GridCellData {
  // cellBounds: BBox;
  row: number;
  col: number;
  page: number;
  gridRow: GridTypes.Row;
}

interface GlyphCellData {
  glyphBounds: BBox;
  page: number;
}

// type GridCellData = TextCellData | GlyphCellData | TextCellData & GlyphCellData

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

// canvasContext: CanvasRenderingContext2D,
export function initGridData(
  textgrid: GridTypes.Textgrid,
  gridNum: number,
  measureTextWidth: MeasureTextWidth,
  gridTextOrigin: Point,
  gridTextHeight: number
): TextDataPoint[] {

  const idGen = utils.newIdGenerator();

  const gridRowsDataPts = _.map(textgrid.rows, (gridRow, rowNum) => {

    const y = gridTextOrigin.y + (rowNum * gridTextHeight);
    const x = gridTextOrigin.x;
    const text = gridRow.text;
    let currLeft = x;
    const gridDataPts = _.map(text.split(''), (ch, chi) => {
      // const chWidth = canvasContext.measureText(ch).width;
      const chWidth = measureTextWidth(ch);
      const charLocus = gridRow.loci[chi];

      const gridDataPt = mk.fromLtwh(
        currLeft, y-gridTextHeight, chWidth, gridTextHeight
      );

      const textCellData = {
        gridRow,
        row: rowNum,
        col: chi,
        char: ch,
        page: gridNum,
        // cellBounds:
        locus: charLocus,
      };// charDef.gridDataPt = gridDataPt; ow = gridRow; // gridDataPt.row = rowNum; // gridDataPt.col = chi; // gridDataPt.char = ch; // gridDataPt.page = gridNum; // gridDataPt.locus = charDef; // charDef.gridDataPt = gridDataPt;

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
        // GridTypes.lo
        const charBBox = charLocus.g![0][2];
        textDataPoint.glyphData = {
          glyphBounds: mk.fromArray(charBBox),
          page: charLocus.g![0][1]
        };
        // glyphDataPt.id = gridDataPt.id;
        // glyphDataPt.gridDataPt = gridDataPt;
        // glyphDataPt.page = gridNum;
        // glyphDataPt.locus = charDef;
        // gridDataPt.glyphDataPt = glyphDataPt;
      }

      currLeft += chWidth;

      return textDataPoint;
    });

    // try {
    //   canvasContext.fillText(text, x, y);
    // }
    // catch (error) {
    //   console.log('error', error);
    // }

    return gridDataPts;
  });

  return _.flatten(gridRowsDataPts);

}


@Component
export default class TextGraph extends Vue {
  @Prop({default: 0}) gridNum!: number;
  @Prop({default: 0}) initialGridWidth!: number;

  public textgridRTree: rbush.RBush<TextDataPoint> = rtree<TextDataPoint>();


  get frameId(): string { return `textgrid-frame-${this.gridNum}`; }
  get canvasId(): string { return `textgrid-canvas-${this.gridNum}`; }
  get svgId(): string { return `textgrid-svg-${this.gridNum}`; }

  get gridHeight(): number {
    return 200;
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

    console.log('initialCandidates?');
    $.getJSON('http://localhost:3100/textgrids/textgrid-00.json', (textgrid: GridTypes.Grid) => {
      const pages = textgrid.pages;
      const textgrids = _.map(pages, p => p.textgrid);
      const textgrid0 = textgrids[0];

      console.log('textGrid', textgrid0);

      // const textgridWidgets = new TextgridWidget.TextgridWidgets();
      // const root = textgridWidgets.getRootNode();
      // console.log('root', root);
      // $(paneLeft.clientAreaSelector()).append(
      //   root
      // );

      // textgridWidgets.append(textgrid0);


    }, (err) => {
      console.log('err', err);
    });

  }

  setMouseHandlers(handlers: ((widget: TextGraph) => MouseHandlerSet)[]) {
    mhs.setMouseHandlers(this, this.frameId, handlers);
  }
}
