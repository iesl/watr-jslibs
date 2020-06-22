import _, { Dictionary } from "lodash";

import path from "path";
import {
  streamPump, prettyPrint,
} from "commons";

import { readOrderCsv } from '~/openreview/workflow';
import { initLogger, readMetaFile } from '../logging/logging';
import { ensureArtifactsDir, skipIfArtifactExisits, extractionLogName, extractAbstractTransform, ExtractionAppContext } from './extract-abstracts';
import { AlphaRecord } from '../core/extraction-records';
import { walkScrapyCacheCorpus } from '~/corpora/corpus-file-walkers';
import { readUrlFetchChainsFromScrapyLogs, buildFetchChainTree } from '../urls/url-fetch-chains';



async function createAlphaRecordDict(csvFile: string): Promise<Map<string, AlphaRecord>> {
  const inputStream = readOrderCsv(csvFile);

  const urlDict = new Map<string, AlphaRecord>();

  const pumpBuilder = streamPump.createPump()
    .viaStream<AlphaRecord>(inputStream)
    .throughF((inputRec: AlphaRecord) => {
      const { url } = inputRec;
      urlDict.set(url, inputRec);
      // urlDict[noteId] = inputRec;
    })
    .onEnd(async () => {
      console.log({ event: "done createAlphaRecordDict" });
    });

  return pumpBuilder
    .toPromise()
    .then(() => urlDict);
}


import { diff } from 'deep-diff';

export async function runMainWriteAlphaRecords(
  corpusRoot: string,
  scrapyLog: string,
  csvFile: string,
): Promise<void> {

  // TODO: scrapy logging -> url db should be part of the spidering process
  const urlGraph = await readUrlFetchChainsFromScrapyLogs(scrapyLog);
  const csvLookup = await createAlphaRecordDict(csvFile);

  const dirEntryStream = walkScrapyCacheCorpus(corpusRoot);
  const pumpBuilder = streamPump.createPump()
    .viaStream<string>(dirEntryStream)
    .tap((entryPath: string) => {
      const metaFilePath = path.resolve(entryPath, 'meta');
      const metaProps = readMetaFile(metaFilePath);
      if (!metaProps) return;

      const { url, responseUrl } = metaProps;

      const DBG_URL = 'https://www.frontiersin.org/articles/10.3389/fncom.2013.00137/full';
      // if (url !== DBG_URL) return;

      prettyPrint({ mgs: 'runMainWriteAlphaRecords: Begin ', metaProps });

      const urlFetchChain = urlGraph.getUrlFetchChain(url);
      const respUrlFetchChain = urlGraph.getUrlFetchChain(responseUrl);
      const chainDiffs = diff(urlFetchChain, respUrlFetchChain);
      if (chainDiffs) {
        prettyPrint({ mgs: 'runMainWriteAlphaRecords: chainDiffs', chainDiffs });
      }
      const fetchedUrls = _.sortBy(_.uniq(_.map(urlFetchChain, chain => chain.requestUrl)));
      console.log('Fetched Urls');
      _.each(fetchedUrls, f => {
        console.log(f);
      })
      console.log('/////////Fetched Urls');

      const alphaRecsForFetched = fetchedUrls
        .map(u => csvLookup.get(u))
        .filter(u => !_.isNil(u));

      buildFetchChainTree(urlFetchChain);
      const uniqAlphaRecs = _.uniqWith(alphaRecsForFetched, (reca, recb) => {
        const recDiffs = diff(reca, recb);
        if (recDiffs) {
          prettyPrint({ msg: 'rec diffs', reca, recb, recDiffs });
        }
        return !recDiffs;
      });

      prettyPrint({ mgs: 'runMainWriteAlphaRecords', urlFetchChain, alphaRecsForFetched, uniqAlphaRecs  });
      console.log('\n===========================================\n\n')
    });

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
