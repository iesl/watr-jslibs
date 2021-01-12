import 'chai/register-should';

import _ from 'lodash';
import { Transcript } from './transcript';
import { isIsomorphic } from '~/lib/utils';
import { GlyphRepr, Glyph, GlyphPropsRepr, GlyphProps } from './glyph';

describe('Glyph IO and representations', () => {

  it('should I/O GlyphReprs, Glyphs', () => {
    // TODO assume that glyphs w/char == ' ' are kind:ws
    const examples: any[] = [
      ['a', [100, 200, 300, 400]],
      [' ', [1, 2, 3, 4], { kind: 'ws' }],
      ['  ', [1, 2, 3, 4], { kind: 'ws:tab2' }],

      ['ffi', [10, 2, 3, 4], {
        kind: 'rewrite', gs: [
          ['ﬃ', [19, 94, 9, 10]]
        ]
      }],

      ['â', [19, 94, 9, 10], {
        kind: 'rewrite', gs: [
          ['a', [19, 94, 9, 10]],
          ['^', [19, 94, 9, 10]],
        ]
      }]
    ];

    const verbose = false;
    _.each(examples, example => {
      const [, , propsRepr] = example;
      if (propsRepr !== undefined) {
        expect(isIsomorphic(GlyphPropsRepr, propsRepr, verbose)).toBe(true);
        expect(isIsomorphic(GlyphProps, propsRepr, verbose)).toBe(true);
      }
      expect(isIsomorphic(GlyphRepr, example, verbose)).toBe(true);
      expect(isIsomorphic(Glyph, example, verbose)).toBe(true);
    });
  });

});
