import _, { Dictionary } from "lodash";

import pumpify from "pumpify";

import {
  expandDirTrans,
  ExpandedDir,
  throughFunc,
  BufferedLogger,
  dirstream,
  stringStreamFilter,
  prettyPrint,
  expandDir,
  streamPump,
  sliceStream,
  filterStream
} from "commons";

import { gatherAbstractFiles } from "~/corpora/bundler";
import { extractAbstractTransformFromScrapy } from "~/extract/field-extract-abstract";
import { Readable } from "stream";
import { initLogger, } from "./qa-logging";
import { readScrapyLogs, readOrderCsv, InputRec } from '~/openreview/workflow';
import { cleanExtractedAbstract } from '~/extract/qa-review-abstracts';
import { promisifyReadableEnd } from 'commons';

export function sanityCheckAbstract(log: BufferedLogger, entryDir0: ExpandedDir): void {
  const entryDir = expandDir(entryDir0.dir)
  const abstractFiles = gatherAbstractFiles(entryDir);
  const abstractStrs = _(abstractFiles)
    .flatMap(([filename, fields]) => {
      return _
        .map(fields, (f, i) => [filename, f.value, i] as const)
        .filter(([, v]) => v !== undefined);
    })
    .map(([fn, f, i]) => [fn, f ? f.trim() : "", i])
    .value();

  if (abstractFiles.length === 0) {
    // No extraction files exist
    log.append("field.abstract.files=false");
  } else if (abstractStrs.length === 0) {
    // no discernable abstracts identified
    log.append("field.abstract.instance=false");
  } else {
    const uniqAbs = _.uniqBy(abstractStrs, v => v[1]);
    const uniqAbsCount = uniqAbs.length;
    const absCount = abstractStrs.length;
    // let entryStatus = "ok";

    log.append(`field.abstract.instance.count=${absCount}`);
    if (uniqAbsCount !== absCount) {
      log.append(`field.abstract.instance.uniq.count=${uniqAbsCount}`);
    }

    _.each(uniqAbs, ([filename, field, fieldNum]) => {
      let abstractStr = field as string;

      if (abstractStr == undefined) {
        return;
      }
      abstractStr = abstractStr.trim();
      const lowcase = abstractStr.toLowerCase();

      if (abstractStr.length < 40) {
        log.append(
          `field.abstract.instance[${filename}:${fieldNum}].length.not-ok`,
        );
      } else {
        log.append(
          `field.abstract.instance[${filename}:${fieldNum}].length.ok`,
        );
      }

      if (lowcase.startsWith("abstract")) {
        log.append(
          `field.abstract.instance[${filename}:${fieldNum}].startword.ok`,
        );
      }

      const filterExprs = [/abstract[ ]+unavailable/];

      _.each(filterExprs, exp => {
        if (exp.test(lowcase)) {
          log.append(
            `field.abstract.instance[${filename}:${fieldNum}].filter[${exp.source}].not-ok`,
          );
        }
      });
    });
  }
}

function scrapyCacheDirs(corpusRoot: string): Readable {
  const corpusDirStream = dirstream(corpusRoot);

  const entryDirFilter = stringStreamFilter((dir: string) => {
    const shaHexRE = /[\dabcdefABCDEF]{40}/;
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
      sliceStream(0, 10),
      // filterStream((path: string) => /011b8/.test(path)),
      expandDirTrans,
      extractAbstractTransformFromScrapy(logger, {
        logger,
        interactive: false,
        urlGraph,
        csvLookup
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


export async function runAbstractCleanerOnScrapyCache(
  cacheRoot: string,
  logpath: string,
  scrapyLog: string,
  csvFile: string,
): Promise<void> {
  const urlGraph = await readScrapyLogs(scrapyLog);
  // url graph tells us the original url from which a downloaded html comes from
  console.log('constructed url graph');

  const csvLookup = await createCSVOrderLookup(csvFile);
  const keylen = _.keys(csvLookup).length;
  const sample = _.toPairs(csvLookup).slice(0, 100);
  console.log('constructed csv lookup, len=', keylen, sample);

  const entryStream = scrapyCacheDirs(cacheRoot);
  const logger = initLogger(logpath, "abstract-cleaner-b", true);

  const pipe = pumpify.obj(
    entryStream,
    expandDirTrans,
    throughFunc((expDir: ExpandedDir) => {
      return cleanExtractedAbstract(expDir, {
        logger: logger,
        interactive: false,
        urlGraph,
        csvLookup
      });
    }),
  );

  console.log('starting runAbstractFinderOnScrapyCache');

  return new Promise((resolve) => {
    pipe.on("end", () => {
      console.log('finished runAbstractFinderOnScrapyCache');
      resolve();
    });

    pipe.on("data", () => undefined);
  }).then(() => {
    logger.commitAndClose()
      .then(() => {
        console.log('done');
      })
  });
}
