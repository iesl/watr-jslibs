import 'chai/register-should';


import _ from "lodash";
import { Transcript } from './transcript';
import { isIsomorphic } from '~/lib/utils';
// import { prettyPrint } from 'commons/dist';
import { GlyphRepr, Glyph, GlyphPropsRepr, GlyphProps } from './glyph';

/**
 * one-to-one
 * expansion (ligature)
 */
describe('Glyph IO and representations', () => {

  it('should I/O GlyphReprs, Glyphs', () => {
    const examples: any[] = [
      // ["a", [100, 200, 300, 400]],
      // [" ", [1, 2, 3, 4], { kind: "ws" }],
      // ["  ", [1, 2, 3, 4], { kind: "ws:tab2" }],

      ["ffi", [10, 2, 3, 4], {
        kind: "rewrite", gs: [
          ["ﬃ", [19, 94, 9, 10]]
        ]
      }],

      // ["â", [19, 94, 9, 10], {
      //   kind: "rewrite", gs: [
      //     ["a", [19, 94, 9, 10]],
      //     ["^", [19, 94, 9, 10]],
      //   ]
      // }]
    ];

    const pageNumber = 3;
    const verbose = true;
    _.each(examples, example => {
      const [, , propsRepr] = example;
      if (propsRepr !== undefined) {
        expect(isIsomorphic(GlyphPropsRepr, propsRepr, verbose)).toBe(true);
        expect(isIsomorphic(GlyphProps(pageNumber), propsRepr, verbose)).toBe(true);
      }
      expect(isIsomorphic(GlyphRepr, example, verbose)).toBe(true);
      expect(isIsomorphic(Glyph(pageNumber), example, verbose)).toBe(true);
    });
  });

  it('should I/O Stanzas', () => {
    const example = {
      name: "body",
      kind: "text:lines",
      id: "1",
      lines: [
        {
          text: "see ^{[1]}.",
          glyphs: [1, 2, 3, 4, "^{", 5, 6, 7, "}", 8],
          labels: [
            { name: "Link", range: [{ unit: "text:char", at: { span: [6, 3] } }] },
          ]
        },
      ]
    };

  });

  it('Updated version', () => {
    // one-to-one glyph-to-char
    // expansion (e.g., extracted ligature ﬃ rewritten to "ffi" in "eﬃcient")
    // whitespace: space, tab, newline
    //  'ws' is normal space (inferred)
    //  'ws:tab*' is inferred tab/indention (e.g., column separating space, paragraph start)
    //  'ws:crlf; for inferred vertical space
    // diacritical mark grouping; text: "â",
    // de-hyphenated text e.g., "in-" "tend" with line break
    //   TODO: should this be handled within glyph class?
    // TODO add an 'empty' geometry shape, for things like spaces/markup that appear but don't correspond
    //   to a particular geometric area

    const examples: any[] = [

      { // Super/subscript markup
        text: "H_{2}SO_{4}^{+}", // extracted glyphs: "H2SO4+"
        glyphIds: [0, 1034, 1034, 1, 1035, 2, 3, -1, -1, 4, -3, -2, -2, 5, -3],
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
          ["^{", { kind: "esc:open:superscript" }],
          ["}", { kind: "esc:close" }],
        ],

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

      const transcriptTemplate = {
        description: "desc",
        documentId: "doc-25-id",
        glyphCount: 1034,
        pages: [{
          page: 1,
          bounds: [0, 0, 61200, 79200],
          _c0_: { comment: "let's introduce a debugging field for comments, refs, etc" },
          glyphCount: 5,
          glyphs: [
            ["a", [19, 94, 9, 10]],
            [" ", [19, 94, 9, 10], { kind: "ws" }],
            ["b", [19, 94, 9, 10]],
            ["    ", [19, 94, 9, 10], { kind: "ws:tab4" }],
            ["c", [19, 94, 9, 10]],
          ],
        }],
        stanzas: [
          {
            name: "body",
            kind: "text:lines",
            _c0_: { comment: "A stanza is a block of text lines" },
            id: "1",
            _c1_: { comment: "glyphIds within stanzas are 0-indexed from the first page/first char, extending across all pages" },
            lines: [
              { text: "ffi", glyph: [10, 10, 10] },
              { text: "A reference to $link{reference:22}{Citation 1.}", glyphs: [10, 10, 10, null, null, null] },
              {
                text: "see ^{[1]}.", // <- linked reference
                glyphs: [1, 2, 3, 4, "^{", 5, 6, 7, "}", 8],
                labels: [
                  { name: "Link", range: [{ unit: "text:char", at: { span: [6, 3] } }] },
                ]
              },
            ]
          },
          {
            name: "table",
            kind: "schema:table",
            id: "2",
            data: {
              headers: [],
              records: [{ a: 1, b: 2 }]
            }
          },
          {
            kind: "bibliography",
            id: "3",
            lines: [
              { text: "Saunders, A.C., etal, WatrWorks ...", glyphIds: [10, 10, 10] },
            ]
          },
          {
            name: "reference",
            kind: "text:lines",
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

// const transcriptTemplate = {
//   description: "desc",
//   documentId: "doc#25",
//   pages: [{
//     page: 1,
//     bounds: [0, 0, 61200, 79200],
//     glyphs: [],
//   }],
//   stanzas: [
//     { kind: "body", id: "1", lines: [] }
//   ],
//   labels: []
// };

// function makeExample(props: any): any {
//   const res = {};
//   _.each(_.toPairs(props), ([path, v]) => {
//     _.set(res, path, v);
//   })
//   return _.merge({}, transcriptTemplate, res);
// }
