import _ from 'lodash'
import { GlyphPropsRepr, GlyphRepr } from './glyph';


describe('Transcripts', () => {


  function makeGlyphRepr(char: string): GlyphRepr {
    let gchar = char;
    let gprops: GlyphPropsRepr | undefined;

    switch (char) {
      case 'ﬃ':
        gchar = 'ffi';
        gprops = { kind: 'rewrite', gs: [['ﬃ', [19, 94, 9, 10]]] };
        break;
    }
    const repr: GlyphRepr = gprops ?
      [gchar, [100, 200, 300, 400], gprops] :
      [gchar, [100, 200, 300, 400]];

    return repr;
  }

  function makeGlyphReprs(str: string): GlyphRepr[] {
    const reprs = _.map(str, char => makeGlyphRepr(char))
    return reprs;
  }
  const pageTexts = [[
    'H2O I+',
    'ffi'
  ], [
    'Fourscore And',
    'Seven Years'
  ]]

  const page1 = {
    page: 1,
    bounds: [0, 0, 100, 200],
    text: pageTexts[0],
    glyphs: _.map(
      pageTexts[0], textLine => makeGlyphReprs(textLine)
    ),

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


  it.only('glyph bounding box PDF overlays', () => {
    //
    console.log('page1', page1)

  });
  it('text substitutions/escape chars', () => {
    //
  });
  it('links between text sections', () => {
    //
  });
  it('ordering over text/glyphs/shapes', () => {
    //
  });
  it('extracted text with labeled lines/regions', () => {
    //
  });
  it('tracelog shapes', () => {
    //
  });
  it('hierarchical labels over spans of text (textgrid functionality)', () => {
    //
  });
  it('text reshaped into stanzas with suitable classes for rtree-indexing (textgrid functionality)', () => {
    //
  });
  it('represent zones (clipped region of PDF page with contained text)', () => {
    //
  });

  // it('multi-page stanzas', () => {
});
