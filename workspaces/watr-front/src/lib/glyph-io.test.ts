import 'chai/register-should';


import _ from "lodash";
import { Transcript } from './transcript';
import { isIsomorphic } from '~/lib/utils';
import { prettyPrint } from 'commons/dist';
import { GlyphRepr, Glyph, GlyphPropsRepr, GlyphProps } from './glyph';

/**
 * one-to-one
 * expansion (ligature)
 */
describe('Glyph IO and representations', () => {
  const transcriptTemplate = {
    description: "desc",
    documentId: "doc#25",
    pages: [{
      page: 1,
      bounds: [0, 0, 61200, 79200],
      glyphs: [],
    }],
    markup: [],
    stanzas: [
      { kind: "body", id: "1", lines: [] }
    ],
    labels: []
  }

  function makeExample(props: any): any {
    const res = {};
    _.each(_.toPairs(props), ([path, v]) => {
      _.set(res, path, v);
    })
    return _.merge({}, transcriptTemplate, res);
  }


  it.only('should I/O GlyphReprs, Glyphs', () => {
    const examples: any[] = [
      ["a", [100, 200, 300, 400]],
      // [" ", [1, 2, 3, 4]], // " " char is same as { kind: "ws" }
      [" ", [1, 2, 3, 4], { kind: " " }],
      ["  ", [1, 2, 3, 4], { kind: "ws:tab" }],
      // ["ffi", [10, 2, 3, 4], {
      //   kind: "rewrite", gs: [
      //     ["ﬃ", 0, [19, 94, 9, 10]]
      //   ]
      // }],
      // ["â", [19, 94, 9, 10], {
      //   kind: "rewrite", gs: [
      //     ["a", 0, [19, 94, 9, 10]],
      //     ["^", 0, [19, 94, 9, 10]],
      //   ]
      // }]
    ];

    _.each(examples, example => {
      const [,,propsRepr] = example;
      if (propsRepr !== undefined) {
        // expect(isIsomorphic(GlyphPropsRepr, propsRepr, true)).toBe(true);
        // expect(isIsomorphic(GlyphProps, propsRepr, true)).toBe(true);
      }
      // expect(isIsomorphic(GlyphRepr, example, true)).toBe(true);
      expect(isIsomorphic(Glyph, example, true)).toBe(true);
    });
  });


  it('one-to-one glyph-to-char', () => {
    const ex = {
      "stanzas[0].lines[0].text": "abc",
      "stanzas[0].lines[0].glyphIds": [0, 1, 2],
      "pages[0].glyphs": [
        ["a", [19, 94, 9, 10]],
        ["b", [19, 94, 9, 10]],
        ["c", [19, 94, 9, 10]],
      ]
    };
    const fin = makeExample(ex);

    prettyPrint({ fin });
  });

  it('Updated version', () => {
    const examples: any[] = [
      { // one-to-one glyph-to-char
        text: "abc",
        glyphIds: [0, 1, 2],
        _c0_: { comment: "glyphs are serialized w/o page #s, which are hydrated upon deserialization" },
        glyphs: [
          ["a", [19, 94, 9, 10]],
          ["b", [19, 94, 9, 10]],
          ["c", [19, 94, 9, 10]],
        ]
      },

      { // expansion (e.g., extracted ligature ﬃ rewritten to "ffi" in "eﬃcient")
        text: "ffi",
        glyphIds: [10, 10, 10],
        _c0_: { comment: "a 'rewrite' preserves the original glyph bounds" },
        glyphs: [
          ["ffi", [19, 94, 9, 10], {
            kind: "rewrite", gs: [
              ["ﬃ", [19, 94, 9, 10]],
            ]
          }],
        ]
      },

      { // whitespace: space, tab, newline
        text: "a b    c",
        glyphIds: [0, 1, 2, 3, 3, 3, 3, 4],
        _c0_: { comment: "'ws' is normal space (inferred)" },
        _c1_: { comment: "'ws:tab*' is inferred tab (e.g., column separating space) " },
        glyphs: [
          ["a", 0, [19, 94, 9, 10]],
          [" ", 0, [19, 94, 9, 10], { kind: "ws" }],
          ["b", 0, [19, 94, 9, 10]],
          ["    ", 0, [19, 94, 9, 10], { kind: "ws:tab4" }],
          ["c", 0, [19, 94, 9, 10]],
        ]
      },

      { // diacritical mark grouping; text: "â",
        text: "â", // extracted glyphs: "a^"
        glyphIds: [0],
        _c0_: { comment: "a 'rewrite' preserves the original glyph bounds" },
        glyphs: [
          ["â", [19, 94, 9, 10], {
            kind: "rewrite", gs: [
              ["a", 0, [19, 94, 9, 10]],
              ["^", 0, [19, 94, 9, 10]],
            ]
          }],
        ]
      },

      { // de-hyphenated text e.g., "in-" "tend" with line break
        text: "intend", // extracted glyphs: "n-", "t"
        glyphIds: [0, 1, 2, 3, 4, 5, 6],
        glyphs: [
          ["i", [19, 94, 9, 10]],
          ["n", [19, 94, 9, 10], {
            kind: "rewrite", gs: [
              ["n", [19, 94, 9, 10]],
              ["-", [19, 94, 9, 10]],
            ]
          }],
          ["t", [19, 94, 9, 10]],
          ["e", [19, 94, 9, 10]],
        ]
      },
      { // Super/subscript markup
        text: "H_{2}SO_{4}^{+}", // extracted glyphs: "H2SO4+"
        glyphIds: [0, -1, -1, 1, -3, 2, 3, -1, -1, 4, -3, -2, -2, 5, -3],
        glyphs: [
          ["H", 0, [19, 94, 9, 10]],
          ["2", 0, [19, 94, 9, 10]],
          ["S", 0, [19, 94, 9, 10]],
          ["O", 0, [19, 94, 9, 10]],
          ["4", 0, [19, 94, 9, 10]],
          ["+", 0, [19, 94, 9, 10]],
        ],
        markup: [
          null,
          ["_{", { kind: "esc:open:subscript" }],
          ["^{", { kind: "esc:open:supscript" }],
          ["}", { kind: "esc:close" }],
        ],

      },

      // TODO add an 'empty' geometry shape, for things like spaces/markup that appear but don't correspond
      //   to a particular geometric area

      { // Vertical spacing
        text: "  ", // two vertical spaces
        glyphIds: [0, 1],
        glyphDefs: [
          [" ", [0, 0, 0, 0], { kind: "ws:crlf" }],
          [" ", [0, 0, 0, 0], { kind: "ws:crlf" }],
        ]
      },

      { // left indentation
        text: "  Fo", //"  Fourscore and seven",
        glyphIds: [],
        glyphDefs: [
          ["  ", 0, [1, 2, 3, 4], { kind: "ws:indent" }],
          ["F", 0, [19, 94, 9, 10]],
          ["o", 0, [19, 94, 9, 10]],
        ]
      },

      { // Inset math/chemical formulae/matrix etc.
        text: "in the equation ${symbols:zbcx}", // reference to equation ({{table|fig|eq|etc.}})
        glyphIds: [1, 2, 3,],
        glyphs: [
        ],
        insert: [
          [".", { kind: "any" }],
          ["${", { kind: "esc:open:ref" }],
          ["}", { kind: "esc:close" }],
        ],
        labels: [
          {
            name: "InsertAt", id: "inc#3",
            range: [
              { unit: "text:char", at: [12, 5] },
              { unit: "stanza", at: 32 }
            ]
          },
        ]
      },

      { // Markup version: Links/refs, e.g., citations and in-body links to citations
        text: ".. as seen in Table 2", // reference to equation ({{table|fig|eq|etc.}})
        glyphIds: [],
        glyphDefs: [
          ["&{", 0, [0, 0, 0, 0], { kind: "esc:open:ref" }],
          ["}", 0, [0, 0, 0, 0], { kind: "esc:close" }],
        ]
      },

      { // Non-markup version: Links/refs, e.g., citations and in-body links to citations
        text: ".. as seen in Table 2", // reference to equation ({{table|fig|eq|etc.}})
        glyphIds: [],
        glyphDefs: [
        ],
        labels: [
          {
            name: "ReferenceTo", id: "lt#3",
            range: [
              { unit: "text:char", at: [12, 5] },
              { unit: "stanza", at: 32 }
            ]
          },
        ]
      },
    ];

  });











  it('MAYBE OLD Version?   should represent various pattern of glyph extraction', () => {
    const examples: any[] = [
      { // one-to-one
        text: "abc",
        glyphs: [
          ["a", 0, [19, 94, 9, 10]],
          ["b", 1, [19, 94, 9, 10]],
          ["c", 2, [19, 94, 9, 10]],
          [1, 2, 3, 4],
          [1, 2, 3, 4],
          [1, 2, 3, 4]
        ]
      },

      { // space, tab
        text: "a b    cd",
        glyphs: [
          [10, 2, 3, 4], // "a"
          [[20, 2, 3, 4], { id: 0 }], // <- normal space
          [30, 2, 3, 4], // "b"
          [[40, 2, 3, 4], { id: 2, i: 0 }], // <- tab (represented as 4 spaces)
          [[40, 2, 3, 4], { id: 2, i: 1 }], // <- tab
          [[40, 2, 3, 4], { id: 2, i: 2 }], // <- tab
          [[40, 2, 3, 4], { id: 2, i: 3 }], // <- tab
          [10, 2, 3, 4], // "c"
          [10, 2, 3, 4], // "d"
        ]
      },

      { // expansion (e.g., extracted ligature ﬃ rewritten to "ffi" in "eﬃcient")
        text: "ffi",
        glyphs: [
          [[10, 2, 3, 4], { id: 201, i: 0 }], // index: 1 of 3
          [[20, 2, 3, 4], { id: 201, i: 1 }], // index: 2 of 3
          [[30, 2, 3, 4], { id: 201, i: 2 }], // index: 3 of 3
        ],
        glyphMap: [
          { id: 201, kind: "glyph", name: "ligature", text: "ffi" }
        ]
      },

      { // diacritical mark grouping; text: "â",
        text: "â", // extracted glyphs: "a^"
        glyphs: [
          [[10, 20, 30, 40], {
            "gs": [
              [[1, 2, 3, 4], { "g": "a" }],
              [[1, 2, 3, 4], { "g": "^" }]
            ]
          }]
        ]
      },

      { // de-hyphenated text e.g., "in-" "tend" with line break
        text: "nt", // extracted glyphs: "n-", "t"
        glyphs: [
          [[10, 20, 30, 40], { // "n"
            "gs": [
              [[1, 2, 3, 4], { "g": "n" }],
              [[1, 2, 3, 4], { "g": "-" }]
            ]
          }],
          [10, 2, 3, 4] // "t"
        ]
      },
      { // Super/subscript markup
        text: "O_{2}", // extracted glyphs: "O2"
        glyphs: [
          [10, 2, 3, 4], // "O"
          [[10, 20, 30, 40], { id: 27, i: 0 }],
          [[10, 20, 30, 40], { id: 27, i: 1 }],
          [10, 2, 3, 4], // "2"
          [[10, 20, 30, 40], { id: 28 }],
        ],
        glyphMap: [
          { id: 0, kind: "ws", name: "space", text: " " },
          { id: 1, kind: "ws", name: "nbsp", text: " " },
          { id: 2, kind: "ws", name: "tab", text: "    " },
          { id: 3, kind: "ws", name: "indent", text: "  " }, // e.g., paragraph begin,
          { id: 3, kind: "ws", name: "return", text: "↲" },
          { id: 27, kind: "markup", name: "subscript:begin", text: "_{" },
          { id: 28, kind: "markup", name: "subscript:end", text: "}" },
          { id: 29, kind: "markup", name: "superscript:begin", text: "^{" },
          { id: 30, kind: "markup", name: "superscript:end", text: "}" },
          { id: 31, kind: "glyph", name: "em-dash", text: "-" }, // —
          { id: 32, kind: "glyph", name: "en-dash", text: "-" }, // –
        ]
      },

      { // Vertical spacing, carriage return, line feeds
        text: " ",
        glyphs: [
          [[10, 20, 30, 40], { id: 3 }],
        ],
        glyphMap: [
          { id: 3, kind: "whitespace", name: "cr", text: " " },
        ]
      },

      { // left indentation
        text: "  Fo", //"  Fourscore and seven",
        glyphs: [
          [[10, 20, 30, 40], { id: 3, i: 0 }],
          [[10, 20, 30, 40], { id: 3, i: 1 }],
          [10, 2, 3, 4], // "F"
          [10, 2, 3, 4], // "o"
        ],
        glyphMap: [
          { id: 3, kind: "whitespace", name: "indent", text: "  " },
        ]
      },

      { // Inset math/chemical formulae/matrix etc.
        text: "{{eq:12}}", // reference to equation ({{table|fig|eq|etc.}})
        glyphs: [
          [10, 2, 3, 4], // "O"
          [[10, 20, 30, 40], { id: 27, i: 0 }],
          [[10, 20, 30, 40], { id: 27, i: 1 }],
          [[10, 20, 30, 40], { id: 28 }],
          [[10, 20, 30, 40], { id: 28 }],
        ],
        glyphMap: [
          { id: 27, kind: "markup", name: "escape:begin", text: "{{" },
          { id: 28, kind: "markup", name: "escape:end", text: "}}" },
        ]
      },
    ];

    _.each(examples, example => {
      const { text, glyphs } = example;
      _.each(glyphs, glyph => {
        expect(isIsomorphic(Glyph, glyph)).toBe(true);
      });


      const transcriptTemplate = {
        description: "desc",
        documentId: "doc-25-id",
        pages: [{
          page: 1,
          bounds: [0, 0, 61200, 79200],
          _c0_: { comment: "let's introduce a debugging field for comments, refs, etc" },
          glyphs: [
            ["a", [19, 94, 9, 10]],
            [" ", [19, 94, 9, 10], { kind: "ws" }],
            ["b", [19, 94, 9, 10]],
            ["    ", [19, 94, 9, 10], { kind: "ws:tab4" }],
            ["c", [19, 94, 9, 10]],
          ],
        }],
        markup: [
          ["_{", { kind: "esc:open:subscript" }],
          ["^{", { kind: "esc:open:supscript" }],
          ["}", { kind: "esc:close" }],
        ],
        stanzas: [
          {
            kind: "body",
            _c0_: { comment: "A stanza is a block of text lines" },
            id: "1",
            _c1_: { comment: "glyphIds within stanzas are 0-indexed from the first page/first char, extending across all pages" },
            lines: [
              { text: "ffi", glyphIds: [10, 10, 10] },
            ]
          },
          {
            kind: "table",
            id: "2",
            lines: [
              { text: "ffi", glyphIds: [10, 10, 10] },
            ]
          },
          {
            kind: "bibliography",
            id: "3",
            lines: [
              { text: "Saunders, A.C., etal, WatrWorks ...", glyphIds: [10, 10, 10] },
            ]
          },
          {
            kind: "reference",
            id: "22",
            lines: [
              { text: "Saunders, A.C., etal, WatrWorks ...", glyphIds: [10, 10, 10] },
            ]
          },
        ],
        labels: [
          {
            _c1_: { comment: "represent a bibliography as a labeled set of reference stanzas" },
            name: "Bibliography",
            id: "L#3",
            range: [
              { unit: "stanza", at: [22, 23, 24] }
            ]
          },
        ]
      };
      expect(isIsomorphic(Transcript, transcriptTemplate)).toBe(true);
    });
  });

});
