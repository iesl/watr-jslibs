import * as coords from '~/lib//coord-sys';
import { BBoxArray } from '~/lib/coord-sys';

export interface Grid {
  description: string;
  pages: Page[];
  fonts: Font[];
}

export interface Font {
  name: string;
  englishBigramEvidence: number;
  metrics: Metric[];
}

export interface Metric {
  scale: number;
  glyphsPerPage: Array<number[]>;
  heights: Heights;
}

export interface Heights {
  lowerCaseSmall: number;
  lowerCaseLarge: number;
  upperCase: number;
}

export interface Page {
  pageGeometry: coords.LTBoundsArray;
  textgrid: Textgrid;
}

export interface Textgrid {
  stableId: string;
  rows: Row[];
  labels: Labels;
}

export interface Labels {
  cellLabels: Array<Array<Array<CellLabelEnum | number>>>;
}

export enum CellLabelEnum {
  SegSub = 'seg:Sub',
  SegSup = 'seg:Sup',
}

export interface Row {
  offset: number;
  text: string;
  loci: Locus[];
}

type PageNum = number;
export type CharLocus = [string, PageNum, BBoxArray];

export interface Locus {
  g?: [CharLocus];
  i?: CharLocus;
}
export function locusIsGlyph(l: Locus): boolean {
  return l.g ? true : false;
}
export function locusCharLocus(l: Locus): CharLocus {
  return l.g ? l.g[0] : l.i!;
}

export function locusBBox(l: Locus): coords.BBox {
  const cl = locusCharLocus(l);
  return coords.mk.fromArray(cl[2]);
}
export function locusPage(l: Locus): number {
  const cl = locusCharLocus(l);
  return cl[1];
}
export function locusChar(l: Locus): string {
  const cl = locusCharLocus(l);
  return cl[0];
}
