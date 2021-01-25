import _ from 'lodash'

import { Transcript } from './transcript'
import { Glyph } from './glyph'
import * as coords from '~/lib/coord-sys'
import * as utils from '~/lib/utils'

import {
  mk,
  MinMaxBox
} from '~/lib/coord-sys'

type Width = number;
export type MeasureTextWidth = (ch: string) => Width;

/**
 * Minimal interface required for RTree index
 */
export interface RTreeIndexable extends MinMaxBox {
  id: number;
}

export interface TextDataPoint extends RTreeIndexable {
  char: string;
  glyph: Glyph;
  pageNum: number;
}

// export interface TranscriptReadableFlow {
//   textDataPoints: TextDataPoint[];
//   maxLineWidth: number;
//   totalLineHeight: number;
// }

/**
 * Convert Transcript into format suitable for display and RTree indexing as
 *   extracted text.
 */
// export function reflowTranscriptAsReadable(
//   transcript: Transcript,
//   pageNum: number,
//   measureText: MeasureTextWidth,
//   textLineHeight: number
// ): GridData {

//   const idGen = utils.newIdGenerator();

//   let maxLineWidth = 0;
//   let totalLineHeight = 0;

//   const page = transcript.pages[pageNum];

//   const gridRowsDataPts = _.map(page.lines, (line, lineNum) => {

//     const glyphsAndText = _.zipWith(
//       line.glyphs, line.text,
//       (g, t) => [g, t] as [Glyph, string]
//     );

//     let currLeft = 0;
//     const y = (lineNum + 1) * textLineHeight;

//     const lines = _.map(glyphsAndText, ([glyph, char]) => {
//       const chWidth = measureText(char);
//       const charBounds = mk.fromLtwh(
//         currLeft, y - textLineHeight, chWidth, textLineHeight
//       );
//       const { minX, minY, maxX, maxY } = charBounds;

//       const textDataPoint: TextDataPoint = {
//         char,
//         glyph,
//         id: idGen(),
//         minX, minY, maxX, maxY
//       };

//       // const isGlyphData = GridTypes.locusIsGlyph(charLocus); // .g !== undefined;

//       // if (isGlyphData) {
//       //   const charBBox = charLocus.g![0][2];
//       //   textDataPoint.glyphData = {
//       //     glyphBounds: mk.fromArray(charBBox),
//       //     page: charLocus.g![0][1]
//       //   };
//       // }

//       currLeft += chWidth;

//       maxLineWidth = Math.max(maxLineWidth, currLeft);
//       totalLineHeight = y + textLineHeight;

//       return textDataPoint;

//     });

//     return lines;
//   });

//   const textDataPoints = _.flatten(gridRowsDataPts);

//   return {
//     textDataPoints,
//     maxLineWidth,
//     totalLineHeight
//   };
// }

// export function reflowTextDataPoints(
//   textDataPoints: TextDataPoint[]
// ): TranscriptReadableFlow {

//   let maxLineWidth = 0;
//   let totalLineHeight = 0;

//   const remapped = _.map(textDataPoints, ({ char, glyph, pageNum }) => {
//     let currLeft = 0;
//     const y = (lineNum + 1) * textLineHeight;

//   });

//   return {
//     textDataPoints,
//     maxLineWidth,
//     totalLineHeight
//   };
// }

// export function reflowTranscriptAsPdfOverlay(
//   transcript: Transcript,
//   pageNum: number
// ): TextDataPoint[] {

//   const idGen = utils.newIdGenerator();
//   const page = transcript.pages[pageNum];

//   const gridRowsDataPts = _.map(page.lines, (line) => {

//     const glyphsAndText = _.zipWith(
//       line.glyphs, line.text,
//       (g, t) => [g, t] as [Glyph, string]
//     );

//     return _.map(glyphsAndText, ([glyph, char]) => {
//       const { x, y, width, height } = glyph.rect;
//       const charBounds = mk.fromLtwh(x, y, width, height);
//       const { minX, minY, maxX, maxY } = charBounds;

//       const textDataPoint: TextDataPoint = {
//         char, glyph, pageNum,
//         id: idGen(),
//         minX, minY, maxX, maxY
//       };
//       return textDataPoint;
//     });
//   });

//   return _.flatten(gridRowsDataPts);
// }
