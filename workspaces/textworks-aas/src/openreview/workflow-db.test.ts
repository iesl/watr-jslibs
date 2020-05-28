import "chai/register-should";

import _, { Dictionary } from "lodash";
import path from "path";
import { prettyPrint } from 'commons';

import { initTestCorpusDirs, createEmptyDB } from './test-utils';
describe("DB-Driven Workflows", () => {

  it.only("should parse scrapy spider logs and commit them to database", () => {
    const logs = `
2020-05-26 16:40:32 [protego] DEBUG: Rule at line 84 without any user agent to enforce it on.
2020-05-26 16:40:32 [scrapy.core.engine] DEBUG: Crawled (200) <GET http://proceedings.mlr.press/v97/li19i.html> (referer: None) ['cached']
2020-05-26 16:40:32 [scrapy.core.engine] DEBUG: Crawled (200) <GET http://hdl.handle.net/robots.txt> (referer: None) ['cached']
2020-05-26 16:40:32 [protego] DEBUG: Malformed rule at line 3 : cannot set request rate using '1/1'. Ignoring this rule.
2020-05-26 16:40:39 [scrapy.downloadermiddlewares.redirect] DEBUG: Redirecting (302) to <GET http://aclweb.org/anthology/D17-1063> from <GET https://doi.org/10.18653/v1/d17-1063>
2020-05-26 16:40:41 [scrapy.downloadermiddlewares.redirect] DEBUG: Redirecting (301) to <GET https://arxiv.org/abs/1902.08918> from <GET http://arxiv.org/abs/1902.08918>
2020-05-26 22:52:45 [scrapy.downloadermiddlewares.redirect] DEBUG: Redirecting (302) to <GET https://dl.acm.org/action/cookieAbsent> from <GET https://dl.acm.org/citation.cfm?id=1577077&cookieSet=1>
2020-05-26 22:52:50 [scrapy.downloadermiddlewares.redirect] DEBUG: Redirecting (302) to <GET http://portal.acm.org/citation.cfm?doid=347090.347105> from <GET https://doi.org/10.1145/347090.347105>
2020-05-26 22:52:45 [scrapy.downloadermiddlewares.robotstxt] DEBUG: Forbidden by robots.txt: <GET https://dl.acm.org/action/cookieAbsent>
`
    const redirectGraph: Dictionary<string> = {};
    const crawled: Set<string> = new Set();

    function trimGetClause(str: string): string {
      const li = str.lastIndexOf('>');
      return str.substring(5, li);
    }

    const lines = logs.split('\n');
    _(lines).map(line => {
      const isCrawled = /DEBUG: Crawled/.test(line);
      const isRedirect301 = /DEBUG: Redirecting \(301\)/.test(line);
      const isRedirect302 = /DEBUG: Redirecting \(302\)/.test(line);
      const isRedirectRefresh = /DEBUG: Redirecting \(meta refresh\)/.test(line);
      const isForbidden = /DEBUG: Forbidden/.test(line);
      const isCached = /\['cached'\]/.test(line);
      const getUrlRE = new RegExp('<GET ([^>]*)>([ ]|$)', 'g');
      const urls1 = line.match(getUrlRE);
      // _.map(urls, (url) => {}).

      const isRedirect = isRedirect302 || isRedirect301 || isRedirectRefresh;

      if (isRedirect && urls1) {
        const [toUrl, fromUrl] = urls1;
        const t = trimGetClause(toUrl);
        const f = trimGetClause(fromUrl);
        redirectGraph[f] = t;
      }
      if (isCrawled && urls1) {
        const [crawlUrl] = urls1;
        const t = trimGetClause(crawlUrl);
        crawled.add(t);

      }

      // prettyPrint({line, urls1});
    }).value();

    prettyPrint({ redirectGraph, crawled });


  });

  it("should run end-to-end, from db init to spider to bundled abstracts/pdf-links/etc", async (done) => {
    const serverFiles = "./test/resources";
    const scratchDir = path.join(".", "scratch.d");
    const { corpusRoot, corpusPath, spiderInputCSV } = initTestCorpusDirs(scratchDir);
    const db = await createEmptyDB();


    /**
     *
     *  - [ ] populate database with input csv records
     *  [noteId, paperUrl, venueUrl] (pdf? pdfUrl?)
     *  artifactType: field/abstract, field/title html/pdf-link
     *  ArtifactRequest: [noteTuple, artifactType, requestTransactionId]
     *  RequestTransaction: [requestId, parentRequestId, status(open, success, failure)]
     *  TransactionLog: [requestId, messageKey, message]
     *
     *  - [ ] query database/logs to see the state of un/spidered/extracted records
     *  - [ ] Scrape/crawl any unspidered records
     *  - [ ] Extract
     *
     *
     **/




    // const app = await startTestHTTPServer(serverFiles);

    // const spideringOptions = {
    //   interactive: false,
    //   useBrowser: false,
    //   cwd: scratchDir,
    //   corpusRoot,
    //   logpath: scratchDir,
    //   input: spiderInputCSV,
    // };

    // await createSpider(spideringOptions);

    // const logpath = scratchDir;

    // await runAbstractFinderOnCorpus({
    //   corpusRoot: corpusPath,
    //   logpath
    // });

    // await delay(200);

    // const inputlog = path.resolve(path.join(scratchDir, 'qa-review-abstract-finder-log.json'));
    // const outputlog = path.resolve( path.join(scratchDir, 'clean-abstracts.json'));
    // const outputAbstractsFile = path.resolve( path.join(scratchDir, 'collected-abstracts.json'));
    // const filters: string[] = [];
    // prettyPrint({ inputlog, outputlog });

    // await cleanAbstracts({ corpusRoot, logpath, inputlog, outputlog, filters });

    // await collectAbstractExtractionStats(outputlog, outputAbstractsFile, [])

    // app.close(() => {
    //   console.log('we are done');
    //   done();
    // });

    await db.close();

    done();
  });
});
