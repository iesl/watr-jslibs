import _ from 'lodash';
import path from 'path';
import fs, {} from 'fs-extra';
import { Readable, Transform }  from 'stream';
import through from 'through2';

import pump from 'pump';

import urlParse from 'url-parse';
import { prettyPrint } from '~/util/pretty-print';
import { dirsteam, stringStreamFilter } from './dirstream';

export function oldCorpusEntryStream(corpusRoot: string): Readable {
  const corpusDirStream = dirsteam(corpusRoot);

  const entryDirFilter = stringStreamFilter((dir: string) => {
    return /_urls_\/.+$/.test(dir);
  });

  return corpusDirStream
    .pipe(entryDirFilter);
}
export function newCorpusEntryStream(corpusRoot: string): Readable {
  const corpusDirStream = dirsteam(corpusRoot);

  const entryDirFilter = stringStreamFilter((dir: string) => {
    return /[\/][^\/]+\.d$/.test(dir);
  });

  return corpusDirStream
    .pipe(entryDirFilter);
}


export function corpusStats(corpusRoot: string) {
  const corpusDirStream = dirsteam(corpusRoot);

  const entryDirFilter = stringStreamFilter((dir: string) => {
    return /_urls_\/.+$/.test(dir);
  });

  const pipeline = pump(
    corpusDirStream,
    entryDirFilter,
    expandDir(),
    collectStats(),
    (err: Error) => {
      console.log(`Error:`, err);
    });

  pipeline.on('data', (data) =>{
    prettyPrint({ data });
  });

}

export interface ExpandedDir {
  dir: string;
  files: string[];
}


export function expandDir(): Transform {
  return through.obj(
    (dir: string, _enc: string, next: (err: any, v: any) => void) => {
      const dirEntries = fs.readdirSync(dir, { withFileTypes: true });
      const files = dirEntries
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);
      const data: ExpandedDir = {
        dir, files
      };

      return next(null, data);
    }
  );
}


function collectStats(): Transform {
  const stats: any = {};
  return through.obj(
    (dir: ExpandedDir, _enc: string, next: (err: any, v: any) => void) => {
      const entryMeta = fs.readJsonSync(path.join(dir.dir, 'entry-meta.json'))
      const hasExtracted = dir.files.includes('extracted-fields.json');
      const url = entryMeta.url;
      const urlParsed = urlParse(url);
      const host = urlParsed.hostname;
      _.update(stats, [host, 'abstracts'], (n) => {
        if (hasExtracted) {
          return n? n+1 : 1;
        }
        return n? n : 0;
      });
      _.update(stats, [host, 'urls'], (n) => {
        return n? n+1 : 1;
      });

      if (!hasExtracted) {
        console.log(`url>${url}`);
        console.log(`path>${dir.dir}`);
      }

      return next(null, null);
    },
    function (done: () => void) {
      this.push(stats);
      return done();
    }
  );
}
