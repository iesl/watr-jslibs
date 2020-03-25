import _ from "lodash";

import { Rect, RectRepr, deserRect } from "./shapes";
import * as io from 'io-ts';
import { either, isRight } from 'fp-ts/lib/Either'

// Define the Repr serialization types for Glyphs / GlyphProps
type RectWithPropsRepr = [RectRepr, GlyphPropsRepr];
type GlyphRepr = RectRepr | RectWithPropsRepr;


export interface GlyphPropsRepr {
  g?: string;
  gs?: GlyphRepr[];
  o?: number;
  os?: number[];
}

const RectWithPropsRepr: io.Type<RectWithPropsRepr> =
  io.recursion(
    "RectWithPropsRepr",
    () => io.tuple([RectRepr, GlyphPropsRepr])
  );

export const GlyphRepr: io.Type<GlyphRepr> =
  io.recursion(
    "GlyphRepr",
    () => io.union([RectWithPropsRepr, RectRepr], "GlyphRepr")
  );


export const GlyphPropsRepr: io.Type<GlyphPropsRepr> = io.recursion(
  "GlyphProps", () => io.partial({
    g: io.string,
    gs: io.array(GlyphRepr),
    o: io.number,
    os: io.array(io.number),
  })
);


export interface Glyph {
  rect: Rect;
  props?: GlyphProps;
}

export interface GlyphProps {
  g?: string;
  gs?: Glyph[];
  o?: number;
  os?: number[];
}

export const GlyphProps = new io.Type<GlyphProps, GlyphPropsRepr, GlyphPropsRepr>(
  "GlyphProps",
  (a: any): a is GlyphProps => GlyphPropsRepr.is(a),
  (u: GlyphPropsRepr, c: io.Context) => {
    const glyphProps: GlyphProps = {};

    if (u.g) glyphProps.g = u.g;
    if (u.o) glyphProps.o = u.o;
    if (u.os) glyphProps.os = u.os;

    if (u.gs) {
      const gs = _.map(u.gs, gr => {
        const dec = Glyph.validate(gr, c);
        if (isRight(dec)) {
          return dec.right;
        }
        throw new Error("unreachable");
      });
      glyphProps.gs = gs;
    }

    return io.success(glyphProps);
  },
  (a: GlyphProps) => {
    const { g, gs, o, os } = a;
    const propsRepr = GlyphPropsRepr.encode({ g, o, os });
    if (gs) {
      const gencs = _.map(gs, Glyph.encode);
      propsRepr.gs = gencs;
    }
    return propsRepr;
  }
);

export const Glyph = new io.Type<Glyph, GlyphRepr, GlyphRepr>(
  "Glyph",
  (a: any): a is Glyph => Rect.is(a['rect']) && GlyphPropsRepr.is(a['props']),
  (u: GlyphRepr, c: io.Context) => either.chain(
    GlyphRepr.validate(u, c),
    glyphRepr => {
      if (RectRepr.is(glyphRepr)) {
        return either.map(
          Rect.decode(glyphRepr), rect => ({ rect })
        );
        // return io.success({
        //   rect: deserRect(glyphRepr)
        // });
      }
      const [rectRepr, glyphPropsRepr] = glyphRepr;
      const rectOrErr = either.chain(
        RectRepr.decode(rectRepr),
        Rect.decode
      );
      const propsOrErr = either.chain(
        GlyphPropsRepr.decode(glyphPropsRepr),
        GlyphProps.decode,
      );
      if (isRight(rectOrErr) && isRight(propsOrErr)) {
        const rect = rectOrErr.right;
        const props = propsOrErr.right;
        return io.success({ rect, props });
      }
      return io.failure(u, c, `Could not unserialize Glyph from ${glyphRepr}`);
    }
  ),
  (a: Glyph) => a.props ?
    [Rect.encode(a.rect), GlyphProps.encode(a.props)]
    : Rect.encode(a.rect)
);

// type GlyphReprT = io.TypeOf<typeof GlyphRepr>;

// export const GlyphWithPropsRepr: io.Type<GlyphWithProps> = io.recursion(
//   "GlyphWithProps", () => 0
// );

// export const GlyphIO = new io.Type<Glyph, GlyphReprT, unknown>(
//   "Glyph",
//   (a: any): a is Glyph => RectIO.is(a['rect']) && GlyphPropsRepr.is(a['props']),
//   (u: unknown, c: io.Context) => either.chain(
//     GlyphRepr.validate(u, c),
//     glyphRepr => {
//       if (RectRepr.is(glyphRepr)) {
//         return io.success({
//           rect: deserRect(glyphRepr)
//         });
//       }

//       const rectE = RectRepr.decode(glyphRepr[0]);
//       const rectOrErr = either.chain(rectE, (r: RectSer) => RectIO.decode(r));

//       return either.chain(rectOrErr, (rect: Rect) => {
//         const propsE = GlyphPropsRepr.decode(glyphRepr[1]);
//         return either.chain(propsE, (props: io.TypeOf<typeof GlyphPropsRepr>) => {
//           const glyph: Glyph = { rect, props };
//           return io.success(glyph);
//         });
//       });
//     }
//   ),
//   (a: Glyph) => a.props?
//     [RectIO.encode(a.rect), GlyphPropsRepr.encode(a.props)]
//     : RectIO.encode(a.rect)
// );

// export const LineIO = io.type({
//   text: io.string,
//   glyphs: io.array(GlyphIO)
// });
// export type Line = io.TypeOf<typeof LineIO>;

// export const PageIO = io.type({
//   pdfPageBounds: RectIO,
//   lines: io.array(LineIO)
// });


// export const TranscriptionIO = io.type({
//   description: io.string,
//   documentId: io.string,
//   pages: io.array(PageIO),
//   // labels: io.array(LabelIO),
// });

// export type Transcription = io.TypeOf<typeof TranscriptionIO>;

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
