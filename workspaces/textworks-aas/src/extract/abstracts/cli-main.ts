import _, { Dictionary } from "lodash";

import pumpify from "pumpify";

import {
  expandDirTrans,
  dirstream,
  stringStreamFilter,
  streamPump,
} from "commons";

import { Readable } from "stream";
import { readScrapyLogs, readOrderCsv, InputRec } from '~/openreview/workflow';
import { promisifyReadableEnd } from 'commons';
import { initLogger } from '~/qa-review/qa-logging';
import { extractAbstractTransformFromScrapy } from './field-extract-abstract';


export function scrapyCacheDirs(corpusRoot: string): Readable {
  const corpusDirStream = dirstream(corpusRoot);

  const entryDirFilter = stringStreamFilter((dir: string) => {
    const shaHexRE = /[\dabcdefABCDEF]{40}[/]?$/;
    return shaHexRE.test(dir);
  });

  return corpusDirStream.pipe(entryDirFilter);
}

export async function createCSVOrderLookup(csvFile: string): Promise<Dictionary<InputRec>> {
  const inputStream = readOrderCsv(csvFile);
  const urlDict: Dictionary<InputRec> = {};

  const pumpBuilder = streamPump.createPump()
    .viaStream<InputRec>(inputStream)
    .throughF((inputRec: InputRec) => {
      const { url, noteId } = inputRec;
      urlDict[url] = inputRec;
      urlDict[noteId] = inputRec;
    })
    .onEnd(async () => {
      console.log({ event: "done" });
    });

  return pumpBuilder
    .toPromise()
    .then(() => urlDict)
    ;
}


export async function runAbstractFinderOnScrapyCache(
  cacheRoot: string,
  logpath: string,
  scrapyLog: string,
  csvFile: string,
  overwrite: boolean
): Promise<void> {

  // TODO: scrapy logging -> url db should be part of the spidering process
  const urlGraph = await readScrapyLogs(scrapyLog);
  // url graph tells us the original url from which a downloaded html comes from
  console.log('constructed url graph');

  const csvLookup = await createCSVOrderLookup(csvFile);
  console.log('constructed csv lookup');

  const dirEntryStream = scrapyCacheDirs(cacheRoot);
  const logger = initLogger(logpath, "abstract-finder", true);

  try {
    const pipe = pumpify.obj(
      dirEntryStream,
      // sliceStream(0, 20),
      // filterStream((path: string) => /011b8/.test(path)),
      // TODO write AlphaRecord if not exists
      // TODO write UrlChain if not exists
      // TODO delete artifacts if --overwrite specified
      expandDirTrans,
      extractAbstractTransformFromScrapy(logger, {
        logger,
        urlGraph,
        csvLookup,
        overwrite
      })
    );

    console.log('starting runAbstractFinderOnScrapyCache');
    return promisifyReadableEnd(pipe)
      .then(() => {
        console.log('finished runAbstractFinderOnScrapyCache');
      })
      .catch(error => {
        console.log('Error: runAbstractFinderOnScrapyCache', error);
      })
    ;

  } catch (error) {
    console.log('runAbstractFinderOnScrapyCache', error);
  }
}

