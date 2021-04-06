import _ from 'lodash';

import { Rect } from './shapes';
import * as io from 'io-ts';
import { NonNegativeInt } from '~/lib/codec-utils';
import { Glyph } from './glyph';
import { Label } from './labels';

export const GlyphRef = io.union([
  io.Int,
  io.string
]);

export const Line = io.strict({
  text: io.string,
  glyphs: io.array(GlyphRef)
});

export type Line = io.TypeOf<typeof Line>;

export const Page = io.strict({
  page: NonNegativeInt,
  bounds: Rect,
  glyphs: io.array(Glyph)
});

export type Page = io.TypeOf<typeof Page>;

export const Stanza = io.strict({
  id: NonNegativeInt,
  lines: io.array(Line),
  labels: io.array(Label)
});

export const BuildInfo = io.type({
  appName: io.string,
  appVersion: io.string,
  gitCurrentBranch: io.string,
  gitHeadCommit: io.string,
  scalaVersion: io.string
}, 'BuildInfo');


export const Transcript = io.strict({
  documentId: io.string,
  pages: io.array(Page),
  stanzas: io.array(Stanza),
  // buildInfo: BuildInfo,
}, 'Transcript');

export type Transcript = io.TypeOf<typeof Transcript>;
