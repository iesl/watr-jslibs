import 'chai/register-should';

import _ from "lodash";
import { RectIO, GlyphIO, RectRepr } from './transcription';
import { either, Either } from 'fp-ts/lib/Either'
import { prettyPrint } from 'commons';

function expectRight<E, A>(eith: Either<E, A>, onSucc: (a: A) => void): void {
  either.bimap(eith, () => false, onSucc);
}

describe('Transcription functions', () => {

  it('ser/deser TupleN4', () => {

    either.bimap(
      RectRepr.decode([1, 2]),
      (err) => expect(err.length).toBeGreaterThan(0),
      (succ) => expect(succ).toBeFalsy
    );

    prettyPrint(RectRepr.decode([1, 2, 3, 4, { ext: 'some info' }]));

    expectRight(
      RectRepr.decode([1, 2, 3, 4]),
      (succ) => expect(succ).toStrictEqual([1, 2, 3, 4])
    )
  });

  it('ser/deser Rect', () => {
    expectRight(
      RectIO.decode([120, 130, 40, 50]),
      (succ) => expect(succ).toStrictEqual({
        kind: "rect",
        x: 1.20, y: 1.30, width: 0.40, height: 0.50
      })
    );
  });

  it('ser/deser Glyph', () => {
    const gser0 = [[1, 2, 3, 4], { "g": "A" }];
    const gser1 = [1, 2, 3, 4];

    const gl0 = GlyphIO.decode(gser0);
    const gl1 = GlyphIO.decode(gser1);
    prettyPrint({ gl0, gl1 });
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
        [[5, 2, 3, 4]],
        [[3, 2, 3, 4], {
          "gs": [
            [[1, 2, 3, 4], { "g": "A" }],
            [[1, 2, 3, 4], { "g": "~" }]
          ]
        }],
        [[5, 2, 3, 4]],
        [1, 2, 3, 4, { "os": [1, 2], "g": "ﬃ" }],
        [1, 2, 3, 4, { "o": 1 }],
        [1, 2, 3, 4, { "o": 2 }],
      ]
    }, {
      text: "Fe_{3}",
      glyphs: [
        [1, 2, 3, 4],
        [2, 2, 3, 4],
        [5, 2, 3, 4, { "o": -2 }],
        [5, 2, 3, 4, { "o": -1 }],
        [5, 2, 3, 4, { "os": [-2, -1, 1] }],
        [5, 2, 3, 4, { "o": 1 }]
      ]
    }]
  }]
}
