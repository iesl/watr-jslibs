//

import * as coords from "./coord-sys";
import * as IO from 'io-ts';


export interface Transcription {
  description: string;
  documentId: string;
  pages: Page[];
  // labels: []
}

export interface Page {
  pdfPageBounds: coords.LTBoundsArray;
  lines: Line[];
}

export interface Line {
  text: string;
  glyphs: Glyph[];
}

export interface Glyph {
  rect: coords.BBox;
  props?: GlyphProps;
}

export interface GlyphProps {

}
