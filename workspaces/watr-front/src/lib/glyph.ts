import _ from "lodash";

import { Rect, RectRepr } from "./shapes";
import * as io from 'io-ts';
import { either, isRight } from 'fp-ts/lib/Either';
// import * as Rec from 'fp-ts/lib/Record';
import * as Arr from 'fp-ts/lib/Array';
import * as Ap from 'fp-ts/lib/Apply';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
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

const GlyphRepr2 = io.tuple([
  io.literal(" "),
  RectRepr,
  io.type({ kind: io.literal("_") })
], "GlyphRepr2");
type GlyphRepr2 = io.TypeOf<typeof GlyphRepr2>;


type GlyphRepr3 = [string, RectRepr, GlyphPropsRepr];
const GlyphRepr3: io.Type<GlyphRepr3> =
  io.recursion(
    "GlyphRepr3",
    () => io.tuple([io.string, RectRepr, GlyphPropsRepr])
  );


type GlyphRepr = GlyphRepr1 | GlyphRepr2 | GlyphRepr3;
export const GlyphRepr: io.Type<GlyphRepr> =
  io.recursion(
    "GlyphRepr",
    () => io.union([GlyphRepr3, GlyphRepr2, GlyphRepr1], "GlyphRepr") // n.b. GlyphRepr*[] is order dependent
  );

export const GlyphPropsRepr: io.Type<GlyphPropsRepr> =
  io.intersection([
    io.type({ kind: io.string }),
    io.partial({ gs: io.array(GlyphRepr) })
  ]);


///
/// Define the Glyph/GlyphProps types
///

export interface Glyph {
  char: string;
  rect: Rect;
  props?: GlyphProps;
}

export interface GlyphProps {
  kind: string;
  gs?: Glyph[];
}

// Typeclass instance
const seqTEither = Ap.sequenceS(E.either);
// const travTEither = Ap.traverseT(E.either);

// const travTArray = Ap.sequenceT(Arr.array);
const travArray = Arr.array.traverse(E.either);

export const GlyphProps = new io.Type<GlyphProps, GlyphPropsRepr, unknown>(
  "GlyphProps",
  (a: any): a is GlyphProps => GlyphPropsRepr.is(a),
  (u: unknown, ctx: io.Context) => {
    const res = pipe(
      u,
      v => GlyphPropsRepr.validate(v, ctx),
      E.chain(({ kind, gs }) => E.right({
        kind: E.right(kind),
        gs: travArray(gs, g => Glyph.validate(g, ctx))
      })),
      E.chain(seqTEither),
    );

    return res;
  }
  // (u: unknown, c: io.Context) => {
  //   return either.chain(
  //     GlyphPropsRepr.decode(u),
  //     (pr) => {
  //       const partial: Pick<GlyphPropsRepr, 'kind'> = pr;
  //       const glyphProps: GlyphProps = {
  //         ...partial
  //       };

  //       if (pr.gs) {
  //         const gs = _.map(pr.gs, gr => {
  //           const dec = Glyph.validate(gr, c);
  //           if (isRight(dec)) {
  //             return dec.right;
  //           }
  //           throw new Error("unreachable");
  //         });
  //         glyphProps.gs = gs;
  //       }
  //       return io.success(glyphProps);
  //     }
  //   );
  // },
  (a: GlyphProps) => {
    const { kind, gs } = a;
    const propsRepr = GlyphPropsRepr.encode({ kind });
    if (gs) {
      propsRepr.gs = _.map(gs, Glyph.encode);
    }
    const definedKVs = _.filter(_.toPairs(propsRepr), ([, v]) => v !== undefined);
    return _.fromPairs(definedKVs);
  }
);



// const SpaceGlyph: Glyph = { char: " " };
const wsGlyphProps: GlyphProps = { kind: 'space' };

const orDefaultGlyphProps = E.alt<io.Errors, GlyphProps>(
  () => E.right(wsGlyphProps)
);

const decodeGlyphProps = (c: io.Context) =>
  (a: GlyphPropsRepr | undefined) => pipe(
    a,
    O.fromNullable,
    v => GlyphProps.validate(v, c),
    orDefaultGlyphProps
  );


const decodeGlyph = (ctx: io.Context) =>
  (a: unknown) => pipe(
    a,
    v => GlyphRepr.validate(v, ctx),
    E.chain(([c, r, g]) => E.right({
      char: E.right(c),
      rect: Rect.decode(r),
      props: decodeGlyphProps(ctx)(g)
    })),
    E.chain(seqTEither),
  );


export const Glyph = new io.Type<Glyph, GlyphRepr, unknown>(
  "Glyph",
  (a: any): a is Glyph =>
    io.string.is(a.char)
    && Rect.is(a['rect'])
    && GlyphProps.is(a['props']),

  (u: unknown, ctx: io.Context) => decodeGlyph(ctx)(u),

  (a: Glyph) => {
    return (a.props === undefined || a.props === wsGlyphProps
      ? [a.char, Rect.encode(a.rect)]
      : [a.char, Rect.encode(a.rect), GlyphProps.encode(a.props)]);
  }
);
