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

export function initTestCorpusDirs(scratchDir: string) {
  if (fs.existsSync(scratchDir)) {
    fs.removeSync(scratchDir);
  }
  const corpusRoot = 'corpus-root.d';
  const corpusPath = path.join(scratchDir, corpusRoot)

  fs.mkdirpSync(corpusPath);
  const spiderInputCSV = path.join(scratchDir, 'input-recs.csv');
  fs.writeFileSync(spiderInputCSV, `
Y15,dblp.org/journals/LOGCOM/2012,Title: Adv. in Cognitive Science.,http://localhost:9000/htmls/page0.html
Y35,dblp.org/journals/LOGCOM/2014,Title: Some Third Title,http://localhost:9000/htmls/page1.html
Y25,dblp.org/journals/LOGCOM/2013,Title: Some Other Title,http://localhost:9000/htmls/page2.html
`);

  return {
    corpusRoot,
    corpusPath,
    spiderInputCSV
  };
}

export async function startTestHTTPServer(staticFilesRoot: string) {
  // start fake server
  const server = jsonServer.create();
  const middlewares = jsonServer.defaults({
    static:staticFilesRoot
  });

  server.use(middlewares)

  // const router = jsonServer.router('db.json')
  // server.use(router)

  const app: any = await new Promise((resolve) => {
    const app = server.listen(9000, () => {
      console.log('JSON Server is running')
      resolve(app);
    });
  });
  return app;
}


describe("Workflows", () => {

  it("should split a messy CSV record", () => {
    const examples = [
      "note1,dblp2,Messy field 3, https://zz.xx",
      "note1,dblp2,Mess,y field 3, https://zz.xx",
      "note1,dblp2,Messy ,fi,eld 3,, https://zz.xx",
    ];

    _.each(examples, example => {
      const res = splitCSVRecord(example);

      expect(res['noteId']).toBe('note1');
      expect(res['dblpConfId']).toBe('dblp2');
      expect(res['url']).toBe('https://zz.xx');
      // prettyPrint({ res });
    });
  });


  it.only("should run end-to-end, from spider to bundled abstracts/pdf-links/etc", async (done) => {
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

    /**
     * └── scratch.d
     *     ├── corpus-root.d
     *     │  └── d
     *     │      └── 4
     *     │          └── Y15.d
     *     │              ├── download.html-08.23.43.html                <- produced by spider
     *     │              ├── download.html-08.23.43.html.ex.abs.json    <- produced by runAbstractFinderOnCorpus
     *     │              └── download.html-08.23.43.html.norm.txt       <- produced by runAbstractFinderOnCorpus
     *     ├── input-recs.csv                                            <- initial input records
     *     ├── qa-review-abstract-finder-log.json                        <- log produced by runAbstractFinderOnCorpus
     *     ├── qa-review-abstract-finder-log.json.pretty.txt             <- prettified log produced by runAbstractFinderOnCorpus
     *     └── spider-log.json                                           <- log produced by spider
     */
    await runAbstractFinderOnCorpus({
      corpusRoot: corpusPath,
      logpath
    });

    await delay(200);

    // Version that uses log produced by spider?? to run
    // runAbstractFinderUsingLogStream({ corpusRoot, logpath, phase, prevPhase, filters });

    // This is run by abstract finder, not needed
    // normalizeHtmls(corpusRoot);

    const inputlog = path.resolve(path.join(scratchDir, 'qa-review-abstract-finder-log.json'));
    const outputlog = path.resolve(path.join(scratchDir, 'clean-abstracts.json'));
    const outputAbstractsFile = path.resolve(path.join(scratchDir, 'collected-abstracts.json'));
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
