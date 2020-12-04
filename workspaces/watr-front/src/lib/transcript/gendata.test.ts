import _ from 'lodash'
import { GlyphPropsRepr, GlyphRepr } from './glyph';

export function rewriteChar(char: string): string {
  switch (char) {
    case 'ﬃ': return 'ffi';
  }
  return char;
}

// function rewriteStr(str: string): string {
//   return _.map(str, s => rewriteChar(s));
// }

export function makeGlyphRepr(char: string): GlyphRepr {
  let gchar = char;
  let gprops: GlyphPropsRepr | undefined;

  switch (char) {
    case 'ﬃ':
      gchar = 'ffi';
      gprops = { kind: 'rewrite', gs: [['ﬃ', [19, 94, 9, 10]]] };
      break;
  }
  const repr: GlyphRepr = gprops ?
    [gchar, [100, 200, 300, 400], gprops] :
    [gchar, [100, 200, 300, 400]];

  return repr;
}

export function makeGlyphReprs(str: string): GlyphRepr[] {
  const reprs = _.map(str, char => makeGlyphRepr(char))
  return reprs;
}
