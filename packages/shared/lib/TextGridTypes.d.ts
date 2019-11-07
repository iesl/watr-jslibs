import * as coords from "./coord-sys";
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
    pageGeometry: number[];
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
export declare enum CellLabelEnum {
    SegSub = "seg:Sub",
    SegSup = "seg:Sup"
}
export interface Row {
    offset: number;
    text: string;
    loci: Locus[];
}
/**

   Glyph Location Data takes these forms:
     Glyph:  {"g": [["d", 0, [10375, 17823, 684, 1071]]]  },
     Insert: {"i":  [" ", 0, [8066, 17823, 683, 1071]] },


*/
export declare type NumArray4 = [number, number, number, number];
export declare type BBoxArray = NumArray4;
export declare type CharLocus = [string, number, BBoxArray];
export interface Locus {
    g?: [CharLocus];
    i?: CharLocus;
}
export declare function locusIsGlyph(l: Locus): boolean;
export declare function locusCharLocus(l: Locus): CharLocus;
export declare function locusBBox(l: Locus): coords.BBox;
export declare function locusPage(l: Locus): number;
export declare function locusChar(l: Locus): string;
