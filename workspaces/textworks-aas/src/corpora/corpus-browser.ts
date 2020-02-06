import _ from "lodash";
import path from "path";
import fs from "fs-extra";
import {Readable, Transform} from "stream";
import through from "through2";

import pump from "pump";

import urlParse from "url-parse";
import {prettyPrint} from "~/util/pretty-print";
import {dirsteam, stringStreamFilter} from "./dirstream";
import { throughFunc } from '~/util/stream-utils';

export function oldCorpusEntryStream(corpusRoot: string): Readable {
  const corpusDirStream = dirsteam(corpusRoot);

  const entryDirFilter = stringStreamFilter((dir: string) => {
    return /_urls_\/.+$/.test(dir);
  });

  return corpusDirStream.pipe(entryDirFilter);
}
export function newCorpusEntryStream(corpusRoot: string): Readable {
  const corpusDirStream = dirsteam(corpusRoot);

  const entryDirFilter = stringStreamFilter((dir: string) => {
    return /[\/][^\/]+\.d$/.test(dir);
  });

  return corpusDirStream.pipe(entryDirFilter);
}

export function corpusStats(corpusRoot: string) {
  const corpusEntryPaths = newCorpusEntryStream(corpusRoot);
  const pipeline = pump(
    corpusEntryPaths,
    expandDir,
    collectVenueCoverageStats(),
    (err: Error) => {
      console.log(`Error:`, err);
    },
  );

  pipeline.on("data", data => {
    prettyPrint({data});
  });
}

export interface ExpandedDir {
  dir: string;
  files: string[];
}

export function expandedDir(path: string) {
  const dirEntries = fs.readdirSync(path, {withFileTypes: true});
  const files = dirEntries
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name);

  const data: ExpandedDir = {
    dir: path,
    files,
  };
  return data;
}

export const expandDir = throughFunc(expandedDir);


const matchingFiles = (re: RegExp) => (fs: string[]) =>
  fs.filter(f => re.test(f));

function collectVenueCoverageStats(): Transform {
  const stats: any = {};
  return through.obj(
    (dir: ExpandedDir, _enc: string, next: (err: any, v: any) => void) => {
      const metaFiles = matchingFiles(/entry-meta/)(dir.files);

      const entryMeta = metaFiles.map(f => {
        const meta = fs.readJsonSync(path.join(dir.dir, f));

        return {
          id: meta.id,
          url: meta.url,
        };
      })[0];

      const {id, url} = entryMeta;

      // const entryMeta = fs.readJsonSync(path.join(dir.dir, "entry-meta.json"));
      const hasExtracted = dir.files.includes("extracted-fields.json");
      const urlParsed = urlParse(url);
      const host = urlParsed.hostname;
      _.update(stats, [host, "abstracts"], n => {
        if (hasExtracted) {
          return n ? n + 1 : 1;
        }
        return n ? n : 0;
      });
      _.update(stats, [host, "urls"], n => {
        return n ? n + 1 : 1;
      });

      if (!hasExtracted) {
        console.log(`url>${url}`);
        console.log(`path>${dir.dir}`);
      }

      return next(null, null);
    },
    function(done: () => void) {
      this.push(stats);
      return done();
    },
  );
}
