import _, { Dictionary } from "lodash";


import pumpify from "pumpify";

import {
  expandDirTrans,
  dirstream,
  stringStreamFilter,
  streamPump,
} from "commons";

import { Readable } from "stream";
import { readScrapyLogs, readOrderCsv } from '~/openreview/workflow';
import { promisifyReadableEnd } from 'commons';
import { initLogger } from '../logging/logging';
import { ensureArtifactsDir, skipIfArtifactExisits, extractionLogName, extractAbstractTransform } from './extract-abstracts';
import { AlphaRecord } from '../core/extraction-records';
import { ReviewEnv } from './data-clean-abstracts';


export function scrapyCacheDirs(corpusRoot: string): Readable {
  const corpusDirStream = dirstream(corpusRoot);

  const entryDirFilter = stringStreamFilter((dir: string) => {
    const shaHexRE = /[\dabcdefABCDEF]{40}[/]?$/;
    return shaHexRE.test(dir);
  });

  return corpusDirStream.pipe(entryDirFilter);
}

export async function createCSVOrderLookup(csvFile: string): Promise<Dictionary<AlphaRecord>> {
  const inputStream = readOrderCsv(csvFile);
  const urlDict: Dictionary<AlphaRecord> = {};

  const pumpBuilder = streamPump.createPump()
    .viaStream<AlphaRecord>(inputStream)
    .throughF((inputRec: AlphaRecord) => {
      const { url, noteId } = inputRec;
      urlDict[url] = inputRec;
      urlDict[noteId] = inputRec;
    })
    .onEnd(async () => {
      console.log({ event: "done" });
    });

  return pumpBuilder
    .toPromise()
    .then(() => urlDict);
}


export async function runMainWriteAlphaRecords(
  corpusRoot: string,
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

  const dirEntryStream = scrapyCacheDirs(corpusRoot);
  // const logger = initLogger(logpath, "abstract-finder", true);

}

export async function runMainExtractAbstracts(
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

  // sliceStream(0, 20),
  // filterStream((path: string) => /011b8/.test(path)),
  // TODO write AlphaRecord if not exists
  // TODO write UrlChain if not exists
  const pumpBuilder = streamPump.createPump()
    .viaStream<string>(dirEntryStream)
    .initEnv<ReviewEnv>(() => ({
      logger, overwrite, urlGraph, csvLookup
    }))
    .tap(ensureArtifactsDir)
    .filter(skipIfArtifactExisits(extractionLogName))
    .tap(extractAbstractTransform)
    ;

  return pumpBuilder.start();

}
