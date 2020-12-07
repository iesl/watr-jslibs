import _ from 'lodash';

import { Rect } from './shapes';
import * as io from 'io-ts';
import { PositiveInteger } from '~/lib/io-utils';
import { Glyph } from './glyph';
import { Label } from './labels';


export const Line = io.type({
  text: io.string,
  glyphs: io.array(io.Int)
});

export type Line = io.TypeOf<typeof Line>;

export const Page = (pageNum: number) => io.type({
  page: PositiveInteger,
  bounds: Rect,
  glyphs: io.array(Glyph(pageNum))
});

export const PageT = Page(1);
export type Page = io.TypeOf<typeof PageT>;

export const Stanza = io.type({
  kind: io.string,
  id: io.string,
  lines: io.array(Line)
});


export const Transcript = io.type({
  documentId: io.string,
  pages: io.array(PageT),
  stanzas: io.array(Stanza),
  labels: io.array(Label),
}, 'Transcript');

export type Transcript = io.TypeOf<typeof Transcript>;
