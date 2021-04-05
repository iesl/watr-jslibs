import _ from 'lodash';
import { Transcript } from './transcript';
import { Glyph } from '~/lib/transcript/glyph';
import { RTreeIndexable } from '~/lib/transcript/TextGlyphDataTypes';
import { mk } from '~/lib/coord-sys'
import RBush from 'rbush'
import { Rect } from './shapes';
import { LineDimensions } from '../html-text-metrics';
import { newIdGenerator } from '../utils';

type RTreeIndexKey = string;

export interface TranscriptIndexable<T> extends RTreeIndexable {
  cargo: T;
  indexedRects: Record<RTreeIndexKey, Rect>;
  primaryKey: RTreeIndexKey;
  primaryRect: Rect;
}

export class TranscriptIndex {
  transcript: Transcript;
  indexes: Record<RTreeIndexKey, RBush<TranscriptIndexable<any>>>;
  indexables: Record<number, TranscriptIndexable<any>>;
  nextId: () => number;

  constructor(t: Transcript) {
    this.transcript = t;
    this.indexes = {};
    this.indexables = {};
    this.initIndexables();
    this.nextId = newIdGenerator(1);
  }

  initIndexables(): void {
    const { pages } = this.transcript;
    _.each(pages, (page) => {

      const primaryKey = `page#${page.page}/glyphs`;
      const pageIndexables = _.map(page.glyphs, (glyph) => {
        const { x, y, width, height } = glyph.rect;
        const charBounds = mk.fromLtwh(x, y, width, height);
        const { minX, minY, maxX, maxY } = charBounds;
        const indexedRects: Record<RTreeIndexKey, Rect> = {};
        indexedRects[primaryKey] = glyph.rect;
        const glyphOverlay: TranscriptIndexable<Glyph> = {
          cargo: glyph,
          primaryKey,
          primaryRect: glyph.rect,
          indexedRects,
          id: glyph.id,
          minX, minY, maxX, maxY
        };

        this.indexables[glyphOverlay.id] = glyphOverlay;
        return glyphOverlay;
      });

      const rtree = new RBush<TranscriptIndexable<Glyph>>()
      rtree.load(pageIndexables);
      this.indexes[primaryKey] = rtree;
    });
  }


  public indexStanza(stanzaIndex: number, putTextLn: PutTextLn): Rect {
    const stanza = this.transcript.stanzas[stanzaIndex];

    const primaryKey = `stanza#${stanzaIndex}`;
    const rtree = new RBush<TranscriptIndexable<string|number>>()
    this.indexes[primaryKey] = rtree;
    let maxWidth = 0;
    let totalHeight = 0;
    _.each(stanza.lines, (line, lineNum) => {
      const lineDimensions = putTextLn(lineNum, line.text);
      maxWidth = Math.max(maxWidth, lineDimensions.width);
      totalHeight += lineDimensions.height;

      const lineIndexables = _.map(line.glyphs, (glyphRef, i) => {
        const charDim = lineDimensions.charBounds[i];
        const { x, y, width, height } = charDim;
        const charBounds = mk.fromLtwh(x, y, width, height);
        const { minX, minY, maxX, maxY } = charBounds;

        if (_.isNumber(glyphRef)) {
          const pageGlyph = this.indexables[glyphRef];
          pageGlyph.indexedRects[primaryKey] = charDim;
          const stanzaIndexable: TranscriptIndexable<number> = {
            cargo: glyphRef,
            primaryKey,
            primaryRect: charDim,
            indexedRects: pageGlyph.indexedRects,
            id: glyphRef,
            minX, minY, maxX, maxY
          };
          return stanzaIndexable;
        }
        const stanzaIndexable: TranscriptIndexable<string> = {
          cargo: glyphRef,
          primaryKey,
          primaryRect: charDim,
          indexedRects: {},
          id: -this.nextId(),
          minX, minY, maxX, maxY
        };
        return stanzaIndexable;
      });
      rtree.load(lineIndexables);
    });

    return {
      kind: 'rect',
      x: 0, y: 0,
      width: maxWidth,
      height: totalHeight
    };
  }
}

export type PutTextLn = (lineNum: number, text: string) => LineDimensions;
