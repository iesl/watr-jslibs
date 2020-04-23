import _ from "lodash";

import { Rect, Shape } from "./shapes";
import * as io from 'io-ts';
import { NonNegativeInteger, PositiveInteger } from "./io-utils";
import { Glyph } from "./glyph";

// Define the Repr serialization types for Glyphs / GlyphProps

export const Line = io.type({
  text: io.string,
  glyphs: io.array(io.Integer)
});

export type Line = io.TypeOf<typeof Line>;

export const Page = (pageNum: number) => io.type({
  page: PositiveInteger,
  bounds: Rect,
  // glyphCount: NonNegativeInteger,
  glyphs: io.array(Glyph(pageNum))
});

export const PageT = Page(1);

export const Stanza = io.type({
  kind: io.string,
  id: io.string,
  lines: io.array(Line)
});

const Begin = NonNegativeInteger;
type Begin = io.TypeOf<typeof Begin>;

const Length = NonNegativeInteger;
type Length = io.TypeOf<typeof Length>;

type Span = readonly [Begin, Length];
const Span = io.tuple([Begin, Length], "Span");

const PageNumber = PositiveInteger;

export const SpanLabelUnit = io.keyof({
  'text:line': null,
  'text:char': null,
});

export const ShapeLabelUnit = io.keyof({
  'shape': null,
  'shape:point': null,
  'shape:line': null,
  'shape:rect': null,
  'shape:circle': null,
  'shape:triangle': null,
  'shape:trapezoid': null,
});

const TextRange = io.type({
  unit: io.keyof({
    'text:line': null,
    'text:char': null,
  }),
  at: io.type({
    stanza: NonNegativeInteger,
    span: Span
  }),
}, "TextRange");

const GeometricRange = io.type({
  unit: ShapeLabelUnit,
  at: io.type({
    page: PositiveInteger,
    shape: Shape
  })
})

export const DocumentRange = io.type({
  unit: io.literal("document")
});

export const StanzaRange = io.type({
  unit: io.literal("stanza"),
  at: io.type({
    stanza: NonNegativeInteger
  }),
});

export const PageRange = io.type({
  unit: io.literal("page"),
  at: io.type({
    page: PageNumber
  })
});

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
  at: io.type({
    label: LabelID
  })
});
export type LabelRange = io.TypeOf<typeof LabelRange>;


export const Range = io.union([
  TextRange,
  GeometricRange,
  StanzaRange,
  PageRange, DocumentRange, LabelRange,
], "Range");

type Range = io.TypeOf<typeof Range>;

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


export const Transcript = io.type({
  documentId: io.string,
  pages: io.array(PageT),
  stanzas: io.array(Stanza),
  labels: io.array(Label),
}, "Transcript");

export type Transcript = io.TypeOf<typeof Transcript>;
