import _ from 'lodash';

import path from "path";
import klaw, { Item } from "klaw";
import { CorpusEntry } from './corpora';

type ArtifactType = string;

export const ArtifactTypes: ArtifactType[] = [
  'pdf',
  'page-image',
  'text',
  'tracelog',
  'html'
];


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



