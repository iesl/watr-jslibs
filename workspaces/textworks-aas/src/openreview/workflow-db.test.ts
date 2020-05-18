import "chai/register-should";

import _ from "lodash";
import { splitCSVRecord } from './workflow';
import { createSpider } from '~/spider/spidering';
import { runAbstractFinderOnCorpus } from '~/qa-editing/qa-review';
import { cleanAbstracts } from '~/qa-editing/qa-edits';
import { collectAbstractExtractionStats } from '~/qa-editing/qa-stats';
import jsonServer from 'json-server';

import path from "path";
import fs from "fs-extra";
import { prettyPrint, delay } from 'commons/dist';
import { startTestHTTPServer, initTestCorpusDirs } from './workflow.test';

describe("DB-Driven Workflows", () => {

  it.only("should run end-to-end, from db init to spider to bundled abstracts/pdf-links/etc", async (done) => {
    const serverFiles = "./test/resources";
    const scratchDir = path.join(".", "scratch.d");
    const { corpusRoot, corpusPath, spiderInputCSV } = initTestCorpusDirs(scratchDir);

    const app = await startTestHTTPServer(serverFiles);

    const spideringOptions = {
      interactive: false,
      useBrowser: false,
      cwd: scratchDir,
      corpusRoot,
      logpath: scratchDir,
      input: spiderInputCSV,
    };

    await createSpider(spideringOptions);

    const logpath = scratchDir;

    await runAbstractFinderOnCorpus({
      corpusRoot: corpusPath,
      logpath
    });

    await delay(200);

    const inputlog = path.resolve(path.join(scratchDir, 'qa-review-abstract-finder-log.json'));
    const outputlog = path.resolve( path.join(scratchDir, 'clean-abstracts.json'));
    const outputAbstractsFile = path.resolve( path.join(scratchDir, 'collected-abstracts.json'));
    const filters: string[] = [];
    prettyPrint({ inputlog, outputlog });

    await cleanAbstracts({ corpusRoot, logpath, inputlog, outputlog, filters });

    await collectAbstractExtractionStats(outputlog, outputAbstractsFile, [])

    app.close(() => {
      console.log('we are done');
      done();
    });
  });
});
