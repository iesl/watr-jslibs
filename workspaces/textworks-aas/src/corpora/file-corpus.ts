
import _ from 'lodash';

import path from "path";
import fs from "fs-extra";
import klaw, { Item } from "klaw";

type ArtifactType = string;

export const ArtifactTypes: ArtifactType[] = [
  'pdf',
  'page-image',
  'text',
  'tracelog',
  'html'
];

export interface CorpusArtifact {
  corpusEntry: CorpusEntry;
  artifactType: ArtifactType;
  path: string;
}

export interface CorpusEntry {
  entryId: string;
  path: string;
}



// export async function walkFileCorpus(corpusRoot: string): Promise<void> {
type WalkFunction = ((e: CorpusEntry) => void) |
  ((e: CorpusEntry) => Promise<void>);

export function walkFileCorpus(corpusRoot: string, fn: WalkFunction): Promise<void> {
  return new Promise((resolve) => {
    klaw(corpusRoot)
      .on('data', (item: Item)=> {
        const p = item.path;
        if (p.endsWith('entry-meta.json')) {
          const entryPath = path.dirname(p);
          const entry = {
            entryId: '',
            path: entryPath
          };
          fn(entry)
        }
      })
      .on('end', () => {
        resolve();
      });
  });
}
