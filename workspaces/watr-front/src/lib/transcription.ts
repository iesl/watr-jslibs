import _ from "lodash";

import { Rect, RectRepr } from "./shapes";
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

export const GlyphPropsRepr: io.Type<GlyphPropsRepr> =
  io.recursion(
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

export const GlyphProps = new io.Type<GlyphProps, GlyphPropsRepr, unknown>(
  "GlyphProps",
  (a: any): a is GlyphProps => GlyphPropsRepr.is(a),
  (u: unknown, c: io.Context) => {
    return either.chain(
      GlyphPropsRepr.decode(u),
      (pr) => {
        const glyphProps: GlyphProps = {};

        if (pr.g) glyphProps.g = pr.g;
        if (pr.o) glyphProps.o = pr.o;
        if (pr.os) glyphProps.os = pr.os;

        if (pr.gs) {
          const gs = _.map(pr.gs, gr => {
            const dec = Glyph.validate(gr, c);
            if (isRight(dec)) {
              return dec.right;
            }
            throw new Error("unreachable");
          });
          glyphProps.gs = gs;
        }
        return io.success(glyphProps);
      }
    );
  },
  (a: GlyphProps) => {
    const { g, gs, o, os } = a;
    const propsRepr = GlyphPropsRepr.encode({ g, o, os });
    if (gs) {
      propsRepr.gs = _.map(gs, Glyph.encode);
    }
    const definedKVs = _.filter(_.toPairs(propsRepr), ([, v]) => v!==undefined);
    return _.fromPairs(definedKVs);
  }
);

export const Glyph = new io.Type<Glyph, GlyphRepr, unknown>(
  "Glyph",
  (a: any): a is Glyph => Rect.is(a['rect']) && GlyphPropsRepr.is(a['props']),
  (u: unknown, c: io.Context) => either.chain(
    GlyphRepr.validate(u, c),
    glyphRepr => {
      if (RectRepr.is(glyphRepr)) {
        return either.map(
          Rect.decode(glyphRepr), rect => ({ rect })
        );
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

export const Line = io.type({
  text: io.string,
  glyphs: io.array(Glyph)
});

export type Line = io.TypeOf<typeof Line>;

export const Page = io.type({
  pdfPageBounds: Rect,
  lines: io.array(Line)
});

export type Page = io.TypeOf<typeof Page>;


export const Transcription = io.type({
  description: io.string,
  documentId: io.string,
  pages: io.array(Page),
  // labels: io.array(LabelIO),
}, "Transcription");

export type Transcription = io.TypeOf<typeof Transcription>;

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
