import "chai/register-should";

import _ from "lodash";
import { splitCSVRecord } from './workflow';
import { collectAbstractExtractionStats } from '~/qa-editing/qa-stats';

import path from "path";
import { delay } from 'commons';
import { initTestCorpusDirs, startTestHTTPServer } from './test-utils';


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


  it("should run end-to-end, from spider to bundled abstracts/pdf-links/etc", async (done) => {
    const serverFiles = "./test/resources";
    const scratchDir = path.join(".", "scratch.d");

    const { corpusRoot, corpusPath } = initTestCorpusDirs(scratchDir);

    const app = await startTestHTTPServer(serverFiles);

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
    // await runAbstractFinderOnCorpus({
    //   corpusRoot: corpusPath,
    //   logpath
    // });

    await delay(200);

    // Version that uses log produced by spider?? to run
    // runAbstractFinderUsingLogStream({ corpusRoot, logpath, phase, prevPhase, filters });

    // This is run by abstract finder, not needed
    // normalizeHtmls(corpusRoot);

    // const inputlog = path.resolve(path.join(scratchDir, 'qa-review-abstract-finder-log.json'));
    // const outputlog = path.resolve(path.join(scratchDir, 'clean-abstracts.json'));
    // const outputAbstractsFile = path.resolve(path.join(scratchDir, 'collected-abstracts.json'));
    // const filters: string[] = [];
    // prettyPrint({ inputlog, outputlog });

    // await cleanAbstracts({ corpusRoot, logpath, inputlog, outputlog, filters });

    // await collectAbstractExtractionStats(outputlog, outputAbstractsFile, [])

    // app.close(() => {
    //   console.log('we are done');
    //   done();
    // });
  });
});
