import 'chai/register-should';

import _ from "lodash";
import { GlyphRepr, Glyph, Transcription } from './transcription';
import { isRight } from 'fp-ts/lib/Either'
import * as io from 'io-ts';
import { Rect, RectRepr } from './shapes';

// import { prettyPrint } from 'commons';


function isIsomorphic<A, O, I>(ioType: io.Type<A, O, I>, a: I): boolean {
  const dec = ioType.decode(a);
  // prettyPrint({ m: `isIsomorphic: ${ioType.name}`, a });
  if (isRight(dec)) {
    const adecoded = dec.right;
    const aencoded = ioType.encode(adecoded);
    // prettyPrint({ adecoded, aencoded });
    return _.isEqual(aencoded, a)
  }
  return false;
}


describe('Transcription functions', () => {

  it('ser/deser RectRepr', () => {

    const examples: any[] = [
      [1, 2, 3, 4],
      [10, 20, 30, 40],
      [11, 22, 33, 44],
      [101, 202, 303, 404],
    ];
    _.each(examples, example => {
      expect(isIsomorphic(RectRepr, example)).toBeTruthy;
      expect(isIsomorphic(Rect, example)).toBeTruthy;
    });
  });

  it('ser/deser GlyphReprs, Glyphs', () => {
    const examples: any[] = [
      [1, 2, 3, 4],
      [[1, 2, 3, 4], { "g": "A" }],
      [[3, 2, 3, 4], {
        "gs": [
          [[1, 2, 3, 4], { "g": "A" }],
          [[1, 2, 3, 4], { "g": "~" }]
        ]
      }],
    ];

    _.each(examples, example => {
      expect(isIsomorphic(GlyphRepr, example)).toBeTruthy;
      expect(isIsomorphic(Glyph, example)).toBeTruthy;
    });
  });

  it('ser/deser Transcription', () => {
    const examples: any[] = [
      sampleTranscription
    ];

    _.each(examples, example => {
      expect(isIsomorphic(Transcription, example)).toBeTruthy;
    });
  });

});

const sampleTranscription = {
  description: "desc",
  documentId: "doc-25-id",
  pages: [{
    pdfPageBounds: [0, 0, 61200, 79200],
    lines: [{
      text: "I Ã ffi",
      glyphs: [
        [1, 2, 3, 4],
        [[59, 2, 3, 4], {}],
        [[3, 2, 3, 4], {
          "gs": [
            [[1, 2, 3, 4], { "g": "A" }],
            [[1, 2, 3, 4], { "g": "~" }]
          ]
        }],
        [[50, 2, 3, 4], {}],
        [[1, 2, 3, 4], { "os": [1, 2], "g": "ﬃ" }],
        [[1, 2, 3, 4], { "o": 1 }],
        [[1, 2, 3, 4], { "o": 2 }],
      ]
    }, {
      text: "Fe_{3}",
      glyphs: [
        [11, 2, 3, 4],
        [22, 2, 3, 4],
        [[51, 2, 3, 4], { "o": -2 }],
        [[52, 2, 3, 4], { "o": -1 }],
        [[53, 2, 3, 4], { "os": [-2, -1, 1] }],
        [[54, 2, 3, 4], { "o": 1 }]
      ]
    }]
  }]
}
