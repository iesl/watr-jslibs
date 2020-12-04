import _ from 'lodash'
// import { GlyphPropsRepr, GlyphRepr } from './glyph';
import { prettyPrint } from 'commonlib-shared';
import { makeGlyphReprs } from './gendata.test';


describe('Transcripts', () => {

  const pageTexts = [[
    'H2O I+',
    'eﬃcient'
  ], [
    'Fourscore And',
    'Seven Years'
  ]]

  const page1 = {
    page: 1,
    bounds: [0, 0, 100, 200],
    // text: pageTexts[0],

    glyphs: _.map(pageTexts[0], textLine => makeGlyphReprs(textLine)),

    fonts: [
      [['font-id3', [0, 3]], ['font-id2', [4, 1]], ['font-id0', [5, 1]]]
    ]
  };

  const sampleTranscript = {
    documentId: 'doc-25-id',
    pages: [page1],
    stanzas: [],
    labels: []
  };

  // de-hyphenated text e.g., "in-" "tend" with line break
  //   TODO: should this be handled within glyph class?
  // TODO add an 'empty' geometry shape, for things like spaces/markup that appear but don't correspond
  //   to a particular geometric area
  // { // Super/subscript markup 'H_{2}SO_{4}^{+}', // extracted glyphs: "H2SO4+"
  // { // Inset math/chemical formulae/matrix etc.


  it.only('glyph bounding box PDF overlays', () => {
    prettyPrint({ page1 })

  });
  it('text substitutions/formatting/escape chars', () => {
  });
  it('links between text sections', () => {
  });
  it('ordering over text/glyphs/shapes', () => {
  });
  it('extracted text with labeled lines/regions', () => {
  });
  it('tracelog shapes', () => {
  });
  it('hierarchical labels over spans of text (textgrid functionality)', () => {
  });
  it('text reshaped into stanzas with suitable classes for rtree-indexing (textgrid functionality)', () => {
  });
  it('represent zones (clipped region of PDF page with contained text)', () => {
  });

  // it('multi-page stanzas', () => {
  it('MAYBE OLD Version?   should represent various pattern of glyph extraction', () => {

      const transcriptTemplate = {
        documentId: 'doc-25-id',
        glyphCount: 1034,
        pages: [{
          page: 1,
          bounds: [0, 0, 61200, 79200],
          _c0_: { comment: "let's introduce a debugging field for comments, refs, etc" },
          glyphCount: 5,
          glyphs: [
            ['a', [19, 94, 9, 10]],
            [' ', [19, 94, 9, 10], { kind: 'ws' }],
            ['b', [19, 94, 9, 10]],
            ['    ', [19, 94, 9, 10], { kind: 'ws:tab4' }],
            ['c', [19, 94, 9, 10]],
          ],
        }],
        stanzas: [
          {
            name: 'body',
            kind: 'text:lines',
            _c0_: { comment: 'A stanza is a block of text lines' },
            id: '1',
            _c1_: { comment: 'glyphIds within stanzas are 0-indexed from the first page/first char, extending across all pages' },
            lines: [
              { text: 'ffi', glyph: [10, 10, 10] },
              { text: 'A reference to $link{reference:22}{Citation 1.}', glyphs: [10, 10, 10, null, null, null] },
              {
                text: 'see ^{[1]}.', // <- linked reference
                glyphs: [1, 2, 3, 4, '^{', 5, 6, 7, '}', 8],
                labels: [
                  { name: 'Link', range: [{ unit: 'text:char', at: { span: [6, 3] } }] },
                ]
              },
            ]
          },
          {
            name: 'table',
            kind: 'schema:table',
            id: '2',
            data: {
              headers: [],
              records: [{ a: 1, b: 2 }]
            }
          },
          {
            kind: 'bibliography',
            id: '3',
            lines: [
              { text: 'Saunders, A.C., etal, WatrWorks ...', glyphIds: [10, 10, 10] },
            ]
          },
          {
            name: 'reference',
            kind: 'text:lines',
            id: '22',
            lines: [
              { text: 'Saunders, A.C., etal, WatrWorks ...', glyphIds: [10, 10, 10] },
            ]
          },
        ],
        labels: [
          {
            _c1_: { comment: 'represent a bibliography as a labeled set of reference stanzas' },
            name: 'Bibliography',
            id: 'L#3',
            range: [
              { unit: 'stanza', at: [22, 23, 24] }
            ]
          },
        ]
      };

      // expect(isIsomorphic(Transcript, transcriptTemplate)).toBe(true);

  });
});
