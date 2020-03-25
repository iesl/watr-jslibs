import 'chai/register-should';

import _ from "lodash";
import { GlyphRepr, Glyph } from './transcription';
import { either, Either, isRight } from 'fp-ts/lib/Either'
import { prettyPrint } from 'commons';
import { Rect, RectRepr } from './shapes';

function expectRight<E, A>(eith: Either<E, A>, onSucc: (a: A) => void): void {
  either.bimap(eith, () => false, onSucc);
}


describe('Transcription functions', () => {

  it('ser/deser RectRepr', () => {

    either.bimap(
      RectRepr.decode([1, 2]),
      (err) => expect(err.length).toBeGreaterThan(0),
      (succ) => expect(succ).toBeFalsy
    );

    // prettyPrint(RectRepr.decode([1, 2, 3, 4, { ext: 'some info' }]));

    expectRight(
      RectRepr.decode([1, 2, 3, 4]),
      (succ) => expect(succ).toStrictEqual([1, 2, 3, 4])
    )
  });

  it('ser/deser Rect', () => {
    expectRight(
      Rect.decode([120, 130, 40, 50]),
      (succ) => expect(succ).toStrictEqual({
        kind: "rect",
        x: 1.20, y: 1.30, width: 0.40, height: 0.50
      })
    );
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
      const dec = GlyphRepr.decode(example);
      expect(isRight(dec)).toBeTruthy;
      const renc = either.map(dec, GlyphRepr.encode);
      expect(isRight(renc)).toBeTruthy;

      const gdec = Glyph.decode(example);
      expect(isRight(gdec)).toBeTruthy;
      const genc = either.map(gdec, Glyph.encode);
      expect(isRight(genc)).toBeTruthy;
      // prettyPrint({ gdec, genc });
    });
  });

  it('ser/deser Transcription', () => {
    // const tr0 = TranscriptionIO.decode(sampleTranscription);
    // prettyPrint({ tr0 });

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
