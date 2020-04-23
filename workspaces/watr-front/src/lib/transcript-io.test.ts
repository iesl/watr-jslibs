import 'chai/register-should';

import _ from "lodash";
import { Transcript, Label, Range } from './transcript';
import { isIsomorphic } from '~/lib/utils';

describe('Transcript IO', () => {

  it('should I/O Ranges', () => {
    const examples: any[] = [
      { unit: "shape:rect", at: { page: 1, shape: [123, 234, 345, 456] } },
      { unit: "shape", at: { page: 1, shape: [[8454, 8483], [52586, 8483]] } },
      { unit: "shape:line", at: { page: 1, shape: [[8454, 8483], [52586, 8483]] } },
      { unit: "stanza", at: { stanza: 0 } },
      { unit: "text:line", at: { stanza: 1, span: [1, 2] } },
      { unit: "text:char", at: { stanza: 2, span: [1, 2] } },
      { unit: "document" },
      { unit: "page", at: { page: 1 } },
      { unit: "label", at: { label: "Lbl#32" } },
    ];

    _.each(examples, example => {
      expect(isIsomorphic(Range, example)).toBe(true);
    });
  });

  it('should I/O Labels', () => {

    const examples: any[] = [
      {
        "name": "FontBaseline", "id": "113", "range": [
          { unit: "shape:line", at: { page: 1, shape: [[8454, 8483], [52586, 8483]] } },
        ]
      },
      {
        name: "Paragraph",
        id: "0", range: [
          { unit: "text:line", at: { stanza: 1, span: [1, 2] } },
        ],
        props: { key1: 'value', key2: { key21: 'value21' } }
      },
      {
        name: "Mixed", id: "L#4",
        range: [
          { unit: "shape", at: { page: 1, shape: [[8454, 8483], [52586, 8483]] } },
          { unit: "stanza", at: { stanza: 0 } },
          { unit: "text:line", at: { stanza: 1, span: [1, 2] } },
          { unit: "text:char", at: { stanza: 2, span: [1, 2] } },
          { unit: "document" },
          { unit: "page", at: { page: 1 } },
          { unit: "label", at: { label: "Lbl#32" } },
        ]
      },
    ];

    _.each(examples, example => {
      expect(isIsomorphic(Label, example)).toBe(true);
    });

  });

  it('should I/O Transcript', () => {
    const example = {
      documentId: "doc-25-id",
      pages: [{
        page: 1,
        bounds: [0, 0, 10, 20],
        glyphs: [
          ["a", [19, 94, 9, 10]],
          [" ", [19, 94, 9, 10], { kind: "ws" }],
        ],
      }],
      stanzas: [
        {
          kind: "body",
          id: "1",
          lines: [{ text: "a ", glyphs: [0, 1] }]
        },
      ],
      labels: []
    };

    expect(isIsomorphic(Transcript, example, true)).toBe(true);

  });

});
