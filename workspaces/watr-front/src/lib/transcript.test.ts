import 'chai/register-should';

import _ from "lodash";
import { GlyphRepr, Glyph, Transcript, Label, Range } from './transcript';
import { Rect, RectRepr } from './shapes';
import { isIsomorphic } from '~/lib/utils';

describe('Transcript functions', () => {

  it('ser/deser RectRepr', () => {

    const examples: any[] = [
      [1, 2, 3, 4],
      [10, 20, 30, 40],
      [11, 22, 33, 44],
      [101, 202, 303, 404],
    ];
    _.each(examples, example => {
      expect(isIsomorphic(RectRepr, example)).toBe(true);
      expect(isIsomorphic(Rect, example)).toBe(true);
    });
  });

  it('ser/deser GlyphReprs, Glyphs', () => {
    const examples: any[] = [
      [1, 2, 3, 4],
      [[10, 2, 3, 4], { "g": "ﬃ" }],
      [[10, 2, 3, 4], { "o": 1 }],
      [[10, 2, 3, 4], { "os": [1, 2] }],

      [[3, 2, 3, 4], {
        "gs": [
          [[1, 2, 3, 4], { "g": "a" }],
          [[1, 2, 3, 4], { "g": "^" }]
        ]
      }]
    ];

    _.each(examples, example => {
      expect(isIsomorphic(GlyphRepr, example)).toBe(true);
      expect(isIsomorphic(Glyph, example)).toBe(true);
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
      expect(isIsomorphic(Range, example)).toBe(true);
    });
  });

  it('ser/deser Labels', () => {

    const examples: any[] = [
      {
        "name": "CharRunFontBaseline",
        "id": "113",
        "range": [{ "unit": "shape:line", "page": 0, "at": [[8454, 8483], [52586, 8483]] }]
      },
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
      expect(isIsomorphic(Label, example)).toBe(true);
    });

  });

  it('ser/deser Transcript', () => {
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
      expect(isIsomorphic(Transcript, example)).toBe(true);
    });
  });
});
