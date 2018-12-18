/**
 * Helper functions and classes to construct shapes that conform to a 'graph paper' setup,
 * e.g., rows and columns of equally sized cells, addressable by (row, col) coords.
 *
 * This makes it easy to construct a bounding box that exactly covers a paricular cell or
 * rectangular box of cells. One is provided to create SVG shapes, another to create
 * Html Canvas shapes.
 *
 **/

import { coords } from "sharedLib";
import * as _ from "lodash";


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

export class GraphCell {
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
}

export class GraphBox {
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

export type Style = "normal";
export type Weight = "normal" | "bold";

export class FontProps {
  style: Style = "normal";
  weight: Weight = "normal";
  size: number = 20;
}

