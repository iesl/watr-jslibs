import "chai/register-should";

import _ from "lodash";
import { splitCSVRecord } from './workflow';
import { createSpider } from '~/spider/spidering';
import { runAbstractFinderOnCorpus, runAbstractFinderUsingLogStream } from '~/qa-editing/qa-review';
import { cleanAbstracts } from '~/qa-editing/qa-edits';
import { collectAbstractExtractionStats } from '~/qa-editing/qa-stats';
import { normalizeHtmls } from '~/extract/reshape-html';
import jsonServer from 'json-server';

import path from "path";
import fs from "fs-extra";

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

    if (fs.existsSync(scratchDir)) {
      fs.removeSync(scratchDir);
    }
    const corpusRoot = 'corpus-root.d';
    const corpusPath = path.join(scratchDir, corpusRoot)

    fs.mkdirpSync(corpusPath);
    const spiderInputCSV = path.join(scratchDir, 'input-recs.csv');
    fs.writeFileSync(spiderInputCSV, `
YdSqf18935,dblp.org/journals/LOGCOM/2012,Title: Adv. in Cognitive Science.,http://localhost:9000/htmls/download.html
YdSqf18935,dblp.org/journals/LOGCOM/2012,Title: Some Other Title,http://localhost:9000/htmls/download.html
`);

    // start fake server
    const server = jsonServer.create();
    const middlewares = jsonServer.defaults({
      static: serverFiles
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

    const spideringOptions = {
      interactive: false,
      useBrowser: true,
      cwd: scratchDir,
      corpusRoot,
      logpath: scratchDir,
      input: spiderInputCSV,
    };
    await createSpider(spideringOptions);

    // runAbstractFinderOnCorpus(args);
    // runAbstractFinderUsingLogStream({ corpusRoot, logpath, phase, prevPhase, filters });
    // normalizeHtmls(corpusRoot);
    // cleanAbstracts({ corpusRoot, logpath, inputlog, outputlog, filters });
    // collectAbstractExtractionStats(fromLog, [])
    app.close(() => {
      console.log('we are done');
      done();
    });
  });
});
