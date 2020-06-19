import _, { Dictionary } from "lodash";

import {
  streamPump,
} from "commons";

import { readScrapyLogs, readOrderCsv } from '~/openreview/workflow';
import { initLogger } from '../logging/logging';
import { ensureArtifactsDir, skipIfArtifactExisits, extractionLogName, extractAbstractTransform, ExtractionAppContext } from './extract-abstracts';
import { AlphaRecord } from '../core/extraction-records';
import { walkScrapyCacheCorpus } from '~/corpora/corpus-file-walkers';



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
): Promise<void> {

  // TODO: scrapy logging -> url db should be part of the spidering process
  const urlGraph = await readScrapyLogs(scrapyLog);
  const csvLookup = await createCSVOrderLookup(csvFile);
  const dirEntryStream = walkScrapyCacheCorpus(corpusRoot);
  // const logger = initLogger(logpath, "abstract-finder", true);
  const pumpBuilder = streamPump.createPump()
    .viaStream<string>(dirEntryStream)

  return pumpBuilder.toPromise()
    .then(() => undefined);

}

export async function runMainExtractAbstracts(
  cacheRoot: string,
  logpath: string,
  overwrite: boolean
): Promise<void> {

  const dirEntryStream = walkScrapyCacheCorpus(cacheRoot);
  const log = initLogger(logpath, "abstract-finder", true);

  // sliceStream(0, 20),
  // filterStream((path: string) => /011b8/.test(path)),
  // TODO write AlphaRecord if not exists
  // TODO write UrlChain if not exists
  const pumpBuilder = streamPump.createPump()
    .viaStream<string>(dirEntryStream)
    .initEnv<ExtractionAppContext>(() => ({
      log,
    }))
    .tap(ensureArtifactsDir(overwrite))
    .filter(skipIfArtifactExisits(extractionLogName))
    .tap(extractAbstractTransform);

  return pumpBuilder.toPromise()
    .then(() => undefined);

}
