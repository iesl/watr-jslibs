//

// import { BBox, mk, mkPoint, Point, ILTBounds } from './coord-sys';
import { ILTBounds } from './coord-sys';

export interface ITextGrid {
  rows: object[];
}

export interface IGridDataPt extends ILTBounds {
  id: string;
  char: string;
  glyphDataPt: IGlyphDataPt;
}

export interface IGlyphDataPt {
  gridDataPt: IGridDataPt;
}
