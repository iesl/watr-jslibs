import 'chai/register-should';

import _ from "lodash";
import { GlyphRepr, Glyph, Transcription, Label, Range } from './transcription';
import { isRight } from 'fp-ts/lib/Either'
import * as io from 'io-ts';
import { Rect, RectRepr } from './shapes';

import { prettyPrint } from 'commons';
import { PathReporter } from 'io-ts/lib/PathReporter'

const verbose = false;

function isIsomorphic<A, O, I>(ioType: io.Type<A, O, I>, a: I): boolean {
  const dec = ioType.decode(a);
  if (isRight(dec)) {
    const adecoded = dec.right;
    const aencoded = ioType.encode(adecoded);
    if (_.isEqual(aencoded, a)) {
      if (verbose) {
        prettyPrint({ m: `isIsomorphic(${ioType.name}) === true`, a });
      }
      return true;
    }
    if (verbose) {
      prettyPrint({ m: `isIsomorphic(${ioType.name}) === false`, a, adecoded, aencoded });
    }
    return false;
  }
  const report = PathReporter.report(dec);
  if (verbose) {
    prettyPrint({ m: `isIsomorphic(${ioType.name}) === false`, report, a });
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


  it('ser/deser Ranges', () => {
    const examples: any[] = [
      { unit: "shape:rect", page: 1, at: [123, 234, 345, 456] },
      { unit: "text:line", page: 1, at: [1, 2] },
      { unit: "text:char", page: 1, at: [1, 2] },
      { unit: "document" },
      { unit: "page", at: [0, 4] },
      { unit: "label", at: "Lbl#32" },
    ];

    _.each(examples, example => {
      expect(isIsomorphic(Range, example)).toBeTruthy;
    });
  });

  it('ser/deser Labels', () => {
    const examples: any[] = [
      {
        name: "Paragraph",
        id: "0", range: [{ unit: "text:line", page: 2, at: [1, 4] }],
        props: { key: 'value' }
      },
      {
        name: "HasRefs", id: "L#2",
        range: [{ unit: "page", at: [7, 2] }]
      },
      {
        name: "LeftColumn", id: "L#4",
        range: [{ unit: "shape:rect", page: 2, at: [10, 20, 30, 40] }]
      },
      {
        name: "RelatesTo", id: "L#4",
        range: [
          { unit: "label", at: "L#1" },
          { unit: "label", at: "L#2" },
          { unit: "label", at: "L#3" },
        ]
      },
      {
        name: "Mixed", id: "L#4",
        range: [
          { unit: "label", at: "L#1" },
          { unit: "page", at: [7, 2] },
          { unit: "shape:rect", page: 2, at: [10, 20, 30, 40] },
          { unit: "text:line", page: 2, at: [1, 4] },
          { unit: "text:char", page: 2, at: [1, 4] },
        ]
      },
    ];

    _.each(examples, example => {
      expect(isIsomorphic(Label, example)).toBeTruthy;
    });

  });

  it('ser/deser Transcription', () => {
    const examples: any[] = [
      {
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
            ]
          }, {
            text: "Fe_{3}",
            glyphs: [
              [11, 2, 3, 4],
              [22, 2, 3, 4],
              [[53, 2, 3, 4], { "os": [-2, -1, 1] }],
              [[54, 2, 3, 4], { "o": 1 }]
            ]
          }]
        }],
        labels: [
          { name: "HasRefs", id: "L#2", range: [{ unit: "page", at: [7, 2] }] },
          { name: "IsGoldLabled", id: "L#3", range: [{ unit: "document" }] },
        ]
      }
    ];

    _.each(examples, example => {
      expect(isIsomorphic(Transcription, example)).toBeTruthy;
    });
  });

});
