import _ from 'lodash';

import { Rect } from './shapes';
import * as io from 'io-ts';
import { PositiveInt } from '~/lib/io-utils';
import { Glyph } from './glyph';
import { Label } from './labels';

export const GlyphRef = io.union([
  io.Int,
  io.string
]);

export const Line = io.type({
  text: io.string,
  glyphs: io.array(GlyphRef)
});

export type Line = io.TypeOf<typeof Line>;



export const Page = io.type({
  page: PositiveInt,
  bounds: Rect,
  glyphs: io.array(Glyph)
});

export type Page = io.TypeOf<typeof Page>;

export const Stanza = io.type({
  id: io.string,
  schema: io.string,
  lines: io.array(Line),
  labels: io.array(Label)
});


export const Transcript = io.type({
  documentId: io.string,
  pages: io.array(Page),
  stanzas: io.array(Stanza),
  labels: io.array(Label),
}, 'Transcript');

export type Transcript = io.TypeOf<typeof Transcript>;
