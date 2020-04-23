import _ from "lodash";

import { Rect, RectRepr } from "./shapes";
import * as io from 'io-ts';
import * as Arr from 'fp-ts/lib/Array';
import * as Ap from 'fp-ts/lib/Apply';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { NonNegativeInteger } from "./io-utils";
import { prettyPrint } from "commons/dist";

/**
 * Glyphs are represented in JSON as tuples, as defined by GlyphRepr* and GlyphPropsRepr*
 */

///
/// Define the *Repr* serialization types for Glyphs / GlyphProps
///
export interface GlyphPropsRepr {
  kind: string;
  gs?: GlyphRepr[];
}

const GlyphRepr1 = io.tuple([io.string, RectRepr], "GlyphRepr1");
type GlyphRepr1 = io.TypeOf<typeof GlyphRepr1>;

type GlyphRepr2 = [string, RectRepr, GlyphPropsRepr];
const GlyphRepr2: io.Type<GlyphRepr2> =
  io.recursion(
    "GlyphRepr2",
    () => io.tuple([io.string, RectRepr, GlyphPropsRepr])
  );


type GlyphRepr = GlyphRepr1 | GlyphRepr2;
export const GlyphRepr: io.Type<GlyphRepr> =
  io.recursion(
    "GlyphRepr",
    () => io.union([GlyphRepr2, GlyphRepr1], "GlyphRepr") // n.b. GlyphRepr*[] is order dependent
  );

export const GlyphPropsRepr: io.Type<GlyphPropsRepr> =
  io.intersection([
    io.type({ kind: io.string }),
    io.partial({ gs: io.array(GlyphRepr) })
  ], "GlyphPropsRepr");


//////
/// Define the Glyph/GlyphProps types

export interface Glyph {
  char: string;
  rect: Rect;
  page: number;
  props?: GlyphProps;
}

export interface GlyphProps {
  kind: string;
  gs?: Glyph[];
}

// Typeclass instance
//  travArray :: A[] => (A => Either<E, B>) => Either<E, B[]>
const travArray = Arr.array.traverse(E.either);

const decodeGlyphProps: (page: number) => (unk: unknown, ctx: io.Context) => E.Either<io.Errors, GlyphProps> =
  (page: number) => (unk: unknown, ctx: io.Context) => {
    return pipe(
      unk,
      v => GlyphPropsRepr.validate(v, ctx),
      E.chain(({ kind, gs }) => {
        if (gs) {
          const gsValid: E.Either<io.Errors, Glyph[]> =
            travArray(gs, g => Glyph(page).validate(g, ctx));

          const mapf = E.map(((gs: Glyph[]) => ({ kind, gs } as GlyphProps)));

          return mapf<io.Errors>(gsValid);
        }
        return E.right({ kind });
      }),
    );
  };

export const GlyphProps = (page: number) => new io.Type<GlyphProps, GlyphPropsRepr, unknown>(
  "GlyphProps",
  (a: any): a is GlyphProps => {
    const k = a['kind'];
    const gs = a['gs'];
    return io.string.is(k) && io.array(Glyph(page)).is(gs);
  },
  (unk: unknown, ctx: io.Context) => decodeGlyphProps(page)(unk, ctx),
  (a: GlyphProps) => {
    const { kind, gs } = a;
    const propsRepr = GlyphPropsRepr.encode({ kind });
    if (gs) {
      propsRepr.gs = _.map(gs, Glyph(page).encode);
    }
    return propsRepr;
  }
);

const seqTupleEither = Ap.sequenceT(E.either);

export const Glyph = (page: number) => new io.Type<Glyph, GlyphRepr, unknown>(
  "Glyph",
  (a: any): a is Glyph =>
    io.string.is(a.char)
    && NonNegativeInteger.is(a.page)
    && Rect.is(a.rect)
    && (a.props === undefined || GlyphProps(page).is(a.props)),

  (unk: unknown, ctx: io.Context) => pipe(
    unk,
    v => GlyphRepr.validate(v, ctx),
    E.chain(([char, rect, props]) => {
      prettyPrint({ m: "Glyph", ctx, unk });
      return pipe(
        NonNegativeInteger.validate(page, ctx),
        E.chain(pageNum => E.right([char, rect, pageNum, props]))
      );
    }),
    E.chain(([char, rect, pageNum, props]) => {
      const rdec = Rect.decode(rect);
      const mapf = E.map(((r: Rect) => ({ char, page: pageNum, rect: r } as Glyph)));
      const glyph0 = mapf(rdec);

      if (props) {
        const ps = decodeGlyphProps(page)(props, ctx);
        const glyphAndProps: E.Either<io.Errors, [Glyph, GlyphProps]> =
          seqTupleEither(glyph0, ps);
        const mapf1 = E.map<[Glyph, GlyphProps], Glyph>(([glyph, props]) => {
          glyph.props = props;
          return glyph;
        });
        const glyph1 = mapf1(glyphAndProps);

        return glyph1;
      }

      return glyph0;
    })
  ),

  (a: Glyph) => {
    return (a.props === undefined
      ? [a.char, Rect.encode(a.rect)]
      : [a.char, Rect.encode(a.rect), GlyphProps(page).encode(a.props)]);
  }
);
