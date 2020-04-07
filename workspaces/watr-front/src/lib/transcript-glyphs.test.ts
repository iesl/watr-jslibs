import 'chai/register-should';

import _ from "lodash";
import { GlyphRepr, Glyph } from './transcript';
import { isIsomorphic } from '~/lib/utils';

describe('Transcript functions', () => {

  it('should represent various pattern of glyph extraction', () => {
    const examples: any[] = [
      { // one-to-one
        text: "abc",
        glyphs: [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]]
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
          { id: 0, kind: "whitespace", name: "space", text: " " },
          { id: 1, kind: "whitespace", name: "nbsp", text: " " },
          { id: 2, kind: "whitespace", name: "tab", text: "    " },
          { id: 3, kind: "whitespace", name: "indent", text: "  " }, // e.g., paragraph begin,
          { id: 3, kind: "whitespace", name: "cr", text: "↲" },
          { id: 3, kind: "whitespace", name: "vertical", text: " " },
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
      expect(isIsomorphic(GlyphRepr, example)).toBe(true);
      expect(isIsomorphic(Glyph, example)).toBe(true);
    });
  });

});
