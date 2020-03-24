
import { Rect, deserRect, RectSer } from "./shapes";
import * as io from 'io-ts';
import { either } from 'fp-ts/lib/Either'

export const RectRepr = io.tuple<io.NumberType, io.NumberType, io.NumberType, io.NumberType>(
  [io.number, io.number, io.number, io.number], "RectRepr"
);

type RectReprT = io.TypeOf<typeof RectRepr>;

export const GlyphPropsRepr = io.partial({
  g: io.string,
  gs: io.array(io.string),
  o: io.string,
  os: io.array(io.string),
});


const GlyphWithAttr = io.tuple([RectRepr, GlyphPropsRepr], "GlyphWithAttr");
const GlyphRepr = io.union([GlyphWithAttr, RectRepr], "GlyphRepr");
type GlyphReprT = io.TypeOf<typeof GlyphRepr>;

export const RectIO = new io.Type<Rect, RectReprT, unknown>(
  "Rect",
  (a: any): a is Rect => a['kind'] === 'rect',
  (u: unknown, c: io.Context) => either.chain(
    RectRepr.validate(u, c),
    n4 => io.success(deserRect(n4))
  ),
  (a: Rect) => [a.x, a.y, a.width, a.height]
);

// TODO Make into generic TypeT+Props
export const GlyphIO = new io.Type<Glyph, GlyphReprT, unknown>(
  "Glyph",
  (a: any): a is Glyph => RectIO.is(a['rect']) && GlyphPropsRepr.is(a['props']),
  (u: unknown, c: io.Context) => either.chain(
    GlyphRepr.validate(u, c),

    glyphRepr => {
      if (RectRepr.is(glyphRepr)) {
        return io.success({
          rect: deserRect(glyphRepr)
        });
      }
      const g0 = glyphRepr[0];
      const g1 = glyphRepr[1];
      const rectE = RectRepr.decode(g0);
      const propsE = GlyphPropsRepr.decode(g1);
      const rectOrErr = either.chain(rectE, (r: RectSer) => RectIO.decode(r));

      return either.chain(rectOrErr, (rect: Rect) => {
        return either.chain(propsE, (props: io.TypeOf<typeof GlyphPropsRepr>) => {
          const glyph: Glyph = { rect, props };
          return io.success(glyph);
        });
      });
    }
  ),
  (a: Glyph) => a.props? [RectIO.encode(a.rect), GlyphPropsRepr.encode(a.props)] : RectIO.encode(a.rect)
);





export interface Page {
  pdfPageBounds: Rect;
  lines: Line[];
}

export interface Line {
  text: string;
  glyphs: Glyph[];
}

export interface Glyph {
  rect: Rect;
  props?: GlyphProps;
}

export interface GlyphProps {

}

// export type GlyphSerial = readonly [number, number, number, number, GlyphProps?];

export interface Transcription {
  description: string;
  documentId: string;
  pages: Page[];
  labels?: Label[];
}

io.type({
  description: io.string,
  documentId: io.string,
  pages: io.string,
  labels: io.string,
});
// const IoTranscription = new IO.Type<Transcription>(
//   "transcription",
// );


type Begin = number;
type Length = number;
export type TextSpan = readonly [Begin, Length];

export interface TextRange {
  unit: string;
  page: number;
  at: TextSpan;
}

type SpatialSpan = any;

export interface SpatialRange {
  unit: string;
  page: number;
  at: SpatialSpan;
}

type Range = TextRange | SpatialRange;

export interface Label {
  label: string;
  ranges: Range[];
}
