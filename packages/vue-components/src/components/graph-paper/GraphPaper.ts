/**
 * Helper functions and classes to construct shapes that conform to a 'graph paper' setup,
 * e.g., rows and columns of equally sized cells, addressable by (row, col) coords.
 *
 * This makes it easy to construct a bounding box that exactly covers a paricular cell or
 * rectangular box of cells. One is provided to create SVG shapes, another to create
 * Html Canvas shapes.
 *
 **/

import {coords, colors} from "sharedLib";
import * as _ from "lodash";

declare namespace fabric {
  export namespace StaticCanvas {

  }
  export class StaticCanvas {
    constructor(id: string, props: object);
    getContext(): CanvasRenderingContext2D;
    setDimensions(d: any): void;
    setDimensions(d: any, e: any): void;
    add(d: any): void;
  }
  export class Text {
    constructor(id: string, props: object);
  }
  export class Rect {
    constructor(bbox: coords.BBox, props: object);
    constructor(props: object);
    constructor(bbox: coords.BBox);

    setGradient(color: string, props: object): void;
  }
  // export type StaticCanvas = any;
}


/**
 * Set of functions to  convert between cell-based and cartesian geometries
 */
export class GraphPaper {
  rowCount: number;
  colCount: number;
  cellWidth: number;
  cellHeight: number;

  constructor(
    rowCount: number,
    colCount: number,
    cellWidth: number,
    cellHeight: number,
  ) {
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
  }

  cellAt(x: number, y: number) {
    return new GraphCell(x, y, this);
  }

  boxAt(x: number, y: number, spanRight: number, spanDown: number) {
    return new GraphBox(this.cellAt(x, y), spanRight, spanDown, this);
  }
}

class GraphCell {
  x: number;
  y: number;
  graphPaper: GraphPaper;

  constructor(x: number, y: number, graphPaper: GraphPaper) {
    this.x = x;
    this.y = y;
    this.graphPaper = graphPaper;
  }

  getBounds() {
    const w = this.graphPaper.cellWidth;
    const h = this.graphPaper.cellHeight;
    return new coords.BBox(this.x * w, this.y * h, w, h);
  }

  // toLTBounds(): BBox {
  //   LTBounds.Ints(left, top, spanRight + 1, spanDown + 1);
  // }
}

class GraphBox {
  originCell: GraphCell;
  spanRight: number;
  spanDown: number;
  graphPaper: GraphPaper;
  bounds: coords.BBox;

  constructor(
    originCell: GraphCell,
    spanRight: number,
    spanDown: number,
    graphPaper: GraphPaper,
  ) {
    this.originCell = originCell;
    this.spanRight = spanRight;
    this.spanDown = spanDown;
    this.graphPaper = graphPaper;

    this.bounds = new coords.BBox(
      this.originCell.x * graphPaper.cellWidth,
      this.originCell.y * graphPaper.cellHeight,
      (this.spanRight - 1) * graphPaper.cellWidth,
      (this.spanDown - 1) * graphPaper.cellHeight,
    );
  }

  toBBox() {
    return this.bounds;
  }
}

type Style = "normal";
type Weight = "normal" | "bold";

class FontProps {
  style: Style = "normal";
  weight: Weight = "normal";
  size: number = 20;
}

export class FabricJsGraphPaper {
  canvasId: string;
  fontSize: number;
  gridCanvas?: Element;
  graphPaper?: GraphPaper;
  textHeight: number = 18;
  cellWidth: number = 20;
  cellHeight: number = 20;

  fabricCanvas?: fabric.StaticCanvas;

  fontProps: FontProps = new FontProps();

  constructor(canvasId: string, fontSize: number) {
    this.canvasId = canvasId;
    this.fontSize = fontSize;
  }

  mount(canvasId: string) {
    const gridCanvas = document.getElementById(this.canvasId);
    if (gridCanvas) {
      this.gridCanvas = gridCanvas!;
    } else {
      throw new Error(`FabricJsGraphPaper could not mount at ${canvasId}`);
    }
    this.fabricCanvas = new fabric.StaticCanvas(canvasId, {
      renderOnAddRemove: false,
    });

    const fontFace = this.makeFontFace();
    const context = this.fabricCanvas.getContext();
    context.font = fontFace;
    context.measureText("A").width;

    const w = context.measureText("A").width;
    const h = this.fontSize + 4;
    // this.textHeight = h;

    this.graphPaper = new GraphPaper(0, 0, w, h);
  }

  setDimensions(rows: number, cols: number, w: number, h: number) {
    this.graphPaper = new GraphPaper(rows, cols, w, h);
    this.staticCanvas.setDimensions({width: w, height: h});
    this.staticCanvas.setDimensions(
      {width: `${w}px`, height: `${h}px`},
      {cssOnly: true},
    );
  }

  initContext() {
    // const context = this.gridCanvas.getContext('2d');
    // context.font = this.fontFace;
    // Object.assign(context, this.contextProps);
    // return context;
    return this.staticCanvas.getContext();
  }
  makeFontFace() {
    const p = this.fontProps;
    return `${p.style} normal ${p.weight} ${p.size}px Courier New`;
  }

  // set contextProp(p) {
  //   // Object.assign(this.contextProps, p);
  // }

  // set alpha(w) {
  //   // this.contextProps.globalAlpha = w;
  // }

  get staticCanvas() {
    return this.fabricCanvas!;
  }

  set fontWeight(w: Weight) {
    this.fontProps.weight = w;
    this.makeFontFace();
  }
  set fontStyle(w: Style) {
    this.fontProps.style = w;
    this.makeFontFace();
  }

  // get textFont() {
  //   return this._textFont;
  // }

  get context2d() {
    return this.staticCanvas.getContext();
    // return this.initContext();
  }

  cellToBounds(cell: GraphCell): coords.BBox {
    const x = cell.x * this.cellWidth;
    const y = cell.y * this.cellHeight;
    const w = this.cellWidth;
    const h = this.cellHeight;
    return coords.mk.fromLtwh(x, y, w, h);
  }

  boxToBounds(box: GraphBox): coords.BBox {
    const bb = box.toBBox();
    const x = bb.left * this.cellWidth;
    const y = bb.top * this.cellHeight;
    const w = bb.width * this.cellWidth;
    const h = bb.height * this.cellHeight;
    return coords.mk.fromLtwh(x, y, w, h);
  }

  drawString(box: GraphBox, str: string): void {
    const {left, top} = this.cellToBounds(box.originCell);
    const text = new fabric.Text(str, {
      left,
      top,
      objectCaching: false,
      fontSize: 20,
      fontStyle: "normal",
      fontFamily: "Courier New",
    });
    this.staticCanvas.add(text);
  }

  drawChar(cell: GraphCell, char: string) {
    const {left, top} = this.cellToBounds(cell);
    const text = new fabric.Text(char, {
      left,
      top,
      objectCaching: false,
      fontSize: 20,
      fontStyle: "normal",
      fontFamily: "Courier New",
    });
    this.staticCanvas.add(text);
  }

  drawBox(box: GraphBox) {
    const bounds = this.boxToBounds(box);
    const rect = new fabric.Rect(bounds);
    this.staticCanvas.add(rect);
  }

  fillBox(box: GraphBox, modCtx: any) {
    const bounds = this.boxToBounds(box);
    const rect = new fabric.Rect(bounds, {
      objectCaching: false,
    });
    modCtx(rect);

    this.staticCanvas.add(rect);
  }

  get colCount() {
    return this.graphPaper!.colCount;
  }
  get rowCount() {
    return this.graphPaper!.rowCount;
  }
  applyCanvasStripes() {
    const rowWidth = this.cellWidth * (this.colCount + 8);
    _.each(_.range(this.rowCount + 10), row => {
      const rtop = row * this.cellHeight;
      const h = this.cellHeight;
      const rect = new fabric.Rect({
        left: 0,
        top: rtop,
        width: rowWidth,
        height: h,
      });
      rect.setGradient("fill", {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: h,
        colorStops: {
          0: colors.Color.GhostWhite,
          0.9: colors.Color.Linen,
          1: colors.Color.Cornsilk,
        },
      });

      this.staticCanvas.add(rect);
    });
  }
}
