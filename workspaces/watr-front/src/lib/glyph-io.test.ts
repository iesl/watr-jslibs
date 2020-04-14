import 'chai/register-should';


import _ from "lodash";
import { Glyph, Transcript } from './transcript';
import { isIsomorphic } from '~/lib/utils';

/**
 * one-to-one
 * expansion (ligature)
 */
describe('Glyph IO and representations', () => {

  it('Updated version', () => {
    const examples: any[] = [
      { // one-to-one
        text: "abc",
        glyphIds: [0, 1, 2],
        glyphDefs: [
          ["a", 0, [19, 94, 9, 10]],
          ["b", 1, [19, 94, 9, 10]],
          ["c", 2, [19, 94, 9, 10]],
        ]
      },

      { // expansion (e.g., extracted ligature ﬃ rewritten to "ffi" in "eﬃcient")
        text: "ffi",
        glyphIds: [10, 10, 10],
        glyphDefs: [
          // 9 prior entries..
          ["ffi", 1, [19, 94, 9, 10], {
            kind: "rewrite", gs: [
              ["ﬃ", 0, [19, 94, 9, 10]],
            ]
          }],
        ]
      },

      { // whitespace: space, tab, newline
        text: "a b    c",
        glyphIds: [0, 1, 2, 3, 3, 3, 3, 4],
        glyphDefs: [
          ["a", 0, [19, 94, 9, 10]],
          [" ", 0, [19, 94, 9, 10], { kind: "ws" }],
          ["b", 0, [19, 94, 9, 10]],
          ["    ", 0, [19, 94, 9, 10], { kind: "ws:tab4" }],
          ["c", 0, [19, 94, 9, 10]],
        ]
      },

      { // diacritical mark grouping; text: "â",
        text: "â", // extracted glyphs: "a^"
        glyphIds: [2],
        glyphDefs: [
          ["a", 0, [19, 94, 9, 10], {}],
          ["^", 0, [19, 94, 9, 10], {}],
          ["â", 0, [19, 94, 9, 10], {
            kind: "rewrite", gs: [
              ["a", 0, [19, 94, 9, 10]],
              ["^", 0, [19, 94, 9, 10]],
            ]
          }],
        ]
      },

      { // de-hyphenated text e.g., "in-" "tend" with line break
        text: "intend", // extracted glyphs: "n-", "t"
        glyphIds: [0, 101, 3, 4, 5, 6],
        glyphDefs: [
          ["i", 0, [19, 94, 9, 10]],
          ["n", 0, [19, 94, 9, 10]],
          ["-", 0, [19, 94, 9, 10]],
          ["t", 0, [19, 94, 9, 10]],
          ["e", 0, [19, 94, 9, 10]],
          // 100 ...
          ["n", 0, [19, 94, 9, 10], {
            kind: "rewrite", gs: [
              ["n", 0, [19, 94, 9, 10]],
              ["-", 0, [19, 94, 9, 10]],
            ]
          }],
        ]
      },
      { // Super/subscript markup
        text: "H_{2}SO_{4}^{+}", // extracted glyphs: "H2SO4+"
        glyphIds: [0, 100, 100, 1, 102, 2, 3, 100, 100, 4, 102, 101, 101, 5, 102],
        glyphDefs: [
          ["H", 0, [19, 94, 9, 10]],
          ["2", 0, [19, 94, 9, 10]],
          ["S", 0, [19, 94, 9, 10]],
          ["O", 0, [19, 94, 9, 10]],
          ["4", 0, [19, 94, 9, 10]],
          ["+", 0, [19, 94, 9, 10]],
          // ... 99
          ["_{", 0, [0, 0, 0, 0], { kind: "esc:open:subscript" }],
          ["^{", 0, [0, 0, 0, 0], { kind: "esc:open:supscript" }],
          ["%{", 0, [0, 0, 0, 0], { kind: "esc:open:div" }],
          ["#3x2{", 0, [0, 0, 0, 0], { kind: "esc:open:matrix" }],
          ["@1,1{", 0, [0, 0, 0, 0], { kind: "esc:open:cell" }],
          ["}", 0, [0, 0, 0, 0], { kind: "esc:close" }],
        ]
      },

      // TODO add an 'empty' geometry shape, for things like spaces/markup that appear but don't correspond
      //   to a particular geometric area

      { // Vertical spacing
        text: "  ", // two vertical spaces
        glyphIds: [0, 1],
        glyphDefs: [
          [" ", 0, [0, 0, 0, 0], { kind: "ws:crlf" }],
          [" ", 0, [0, 0, 0, 0], { kind: "ws:crlf" }],
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
        text: "&{table:12}", // reference to equation ({{table|fig|eq|etc.}})
        glyphDefs: [
        ],
        glyphMap: [
          ["&{", 0, [0, 0, 0, 0], { kind: "esc:open:ref" }],
          ["}", 0, [0, 0, 0, 0], { kind: "esc:close" }],
        ]
      },

      { // Links/refs, e.g., citations and in-body links to citations
        text: "&21;", // reference to equation ({{table|fig|eq|etc.}})
        glyphIds: [],
        glyphDefs: [
          ["&{", 0, [0, 0, 0, 0], { kind: "esc:open:ref" }],
          ["}", 0, [0, 0, 0, 0], { kind: "esc:close" }],
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
          glyphs: [
            ["a", [19, 94, 9, 10]],
            [" ", [19, 94, 9, 10], { kind: "ws" }],
            ["b", [19, 94, 9, 10]],
            ["    ", [19, 94, 9, 10], { kind: "ws:tab4" }],
            ["c", [19, 94, 9, 10]],
          ],
        }],
        stanzas: [
          { kind: "body",
            id: "az0-vX",
            lines: [
              { text: "ffi", glyphIds: [10, 10, 10] },
            ] },
          { kind: "table",
            id: "23",
            lines: [
              { text: "ffi", glyphIds: [10, 10, 10] },
            ] },
          { kind: "bibliography",
            id: "33",
            lines: [
              { text: "Saunders, A.C., etal, WatrWorks ...", glyphIds: [10, 10, 10] },
            ] },
        ],
        labels: [
        ]
      }
      expect(isIsomorphic(Transcript, transcriptTemplate)).toBe(true);
    });
  });

});
