import _ from "lodash";

import { Rect, RectRepr, Shape } from "./shapes";
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


interface PositiveBrand {
  readonly Positive: unique symbol;
}


type Begin = number;
const Begin = io.number;
type Length = number;

const PositiveNumber = io.brand(
  io.number,
  (n: number): n is io.Branded<number, PositiveBrand> => n >= 0,
  "Positive"
);

const Length = PositiveNumber;
type BLSpan = readonly [Begin, Length];
const BLSpan = io.tuple([Begin, Length], "BLSpan");


export const TextLabelUnit = io.keyof({
  'text:line': null,
  'text:char': null,
});

export const ShapeLabelUnit = io.keyof({
  'shape:point': null,
  'shape:line': null,
  'shape:rect': null,
  'shape:circle': null,
  'shape:triangle': null,
  'shape:trapezoid': null,
});

export const DocLabelUnit = io.keyof({
  'doc:document': null,
  'doc:page': null,
});

export const LabelLabelUnit = io.keyof({
  'label': null,
});


export interface TextRange {
  unit: string;
  page: number;
  at: BLSpan;
}

const TextRange = io.type({
  unit: TextLabelUnit,
  page: io.number,
  at: BLSpan,
}, "TextRange");

export interface GeometricRange {
  unit: string;
  page: number;
  at: Shape;
}

const GeometricRange = io.type({
  unit: ShapeLabelUnit,
  page: io.number,
  at: Rect,
})

export const DocumentRange = io.type({
  unit: io.literal("document")
});
export type DocumentRange = io.TypeOf<typeof DocumentRange>;

export const PageRange = io.type({
  unit: io.literal("page"),
  at: BLSpan,
});
export type PageRange = io.TypeOf<typeof PageRange>;

interface LabelIDBrand {
  readonly LabelID: unique symbol;
}

const LabelID = io.brand(
  io.string,
  (s): s is io.Branded<string, LabelIDBrand> => s.length > 0,
  "LabelID"
);

export const LabelRange = io.type({
  unit: io.literal("label"),
  at: LabelID
});
export type LabelRange = io.TypeOf<typeof LabelRange>;

type Range = TextRange | GeometricRange | PageRange | DocumentRange | LabelRange;

export const Range = io.union([
  TextRange, GeometricRange, PageRange, DocumentRange, LabelRange
], "Range");

export interface Label {
  name: string;
  id: string;
  range: Range[];
  props: { [k: string]: any };
}

export const LabelProps =
  io.partial({
    props: io.record(io.string, io.any, "LabelProps")
  });

export const LabelRec = io.type({
  name: io.string,
  id: io.string,
  range: io.array(Range),
}, "LabelRec");

export const Label = io.intersection([LabelRec, LabelProps], "Label");

export const Transcription = io.type({
  description: io.string,
  documentId: io.string,
  pages: io.array(Page),
  labels: io.array(Label),
}, "Transcription");

export type Transcription = io.TypeOf<typeof Transcription>;
