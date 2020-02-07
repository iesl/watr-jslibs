import _ from "lodash";
import fs from "fs-extra";
import {Readable} from "stream";

import {dirsteam, stringStreamFilter} from "./dirstream";
import {throughFunc} from "~/util/stream-utils";

export interface ExpandedDir {
  dir: string;
  files: string[];
}

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
