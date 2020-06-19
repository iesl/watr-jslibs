//
import { Readable } from "stream";
import { dirstream, stringStreamFilter } from 'commons';

export function walkScrapyCacheCorpus(corpusRoot: string): Readable {
  const corpusDirStream = dirstream(corpusRoot);

  const entryDirFilter = stringStreamFilter((dir: string) => {
    const shaHexRE = /[\dabcdefABCDEF]{40}[/]?$/;
    return shaHexRE.test(dir);
  });

  return corpusDirStream.pipe(entryDirFilter);
}
