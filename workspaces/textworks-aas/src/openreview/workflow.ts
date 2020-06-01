import pumpify from "pumpify";
import { Stream } from "stream";
import _ from "lodash";

import {
  throughFunc,
  prettyPrint,
  createConsoleLogger,
  createReadLineStream,
  filterStream,
} from "commons";

import { openDatabase, Database } from './database';
import { Order, Url, NoteId, VenueUrl, OrderEntry } from './database-tables';
import { streamPump } from 'commons';
import { Dictionary } from 'lodash';

export interface InputRec {
  noteId: string;
  dblpConfId: string;
  url: string;
  title: string;
}

export function splitCSVRecord(rec: string): InputRec {
  const fields = rec.split(',');
  let [noteId, dblpConfId] = fields;
  if (noteId === undefined || dblpConfId === undefined) {
    console.log(`error: splitCSVRecord: ${rec}`);
    noteId = noteId || "ERR-NOTEID";
    dblpConfId = dblpConfId || "ERR-DBLP";
  }
  let url = fields[fields.length - 1];
  const p0 = noteId.length + dblpConfId.length + 2;
  const p1 = rec.length - url.length - 1;
  const title = rec.substring(p0, p1);
  noteId = noteId.trim();
  dblpConfId = dblpConfId.trim();
  url = url.trim();

  return {
    noteId, dblpConfId, url, title
  };
}

export function readOrderCsv(csvfile: string): Stream {
  const inputStream = createReadLineStream(csvfile)


  return pumpify.obj(
    inputStream,
    filterStream((r: string) => r.trim().length > 0),
    throughFunc(splitCSVRecord),
  );
}

export interface COptions {
  csvFile: string;
}

const addOrderEntry: (db: Database, order: Order) => (r: InputRec) => Promise<OrderEntry> =
  (db, order) => async (rec) => {
    const { noteId, url, dblpConfId } = rec;

    return db.run(async () => {
      const urlP = Url.findCreateFind({
        where: { url },
        defaults: { url },
      });

      const noteP = NoteId.findCreateFind({
        where: { noteId },
        defaults: { noteId },
      });

      const venueP = VenueUrl.findCreateFind({
        where: { url: dblpConfId },
        defaults: { url: dblpConfId },
      });

      return Promise
        .all([urlP, noteP, venueP])
        .then(([urlA, noteA, venueA]) => {
          const [urlEntry] = urlA;
          const [noteEntry] = noteA;
          const [venueEntry] = venueA;

          return OrderEntry.create({
            order: order.id,
            note: noteEntry.id,
            url: urlEntry.id,
            venue: venueEntry.id,
          });
        });
    })
  };

export async function createOrder(opts: COptions): Promise<void> {
  const logger = createConsoleLogger();
  logger.info({ event: "initializing order", config: opts });
  const inputStream = readOrderCsv(opts.csvFile);

  const db = await openDatabase();

  const newOrder = await db.run(async () => {
    return Order.create()
      .catch(error => {
        prettyPrint({ error });
      });
  });

  if (!newOrder) return;

  const addEntry = addOrderEntry(db, newOrder);

  let i = 0;
  const pumpBuilder = streamPump.createPump()
    .viaStream<InputRec>(inputStream)
    .throughF(addEntry)
    .tap(() => {
      if (i % 100 === 0) {
        console.log(`processed ${i} records`);
      }
      i += 1;
    })
    .onEnd(async () => {
      logger.info({ event: "done" });
      await db.sql.close();
      logger.info({ event: "db closed" });
    });

  return pumpBuilder.toPromise();
}

// type UrlAndCode = [string, number];
export interface UrlGraph {
  isUrlCrawled(url: string, verbose?: boolean): boolean;
  getUrlFetchChain(url: string): string[];
}

function trimGetClause(str: string): string {
  const li = str.lastIndexOf('>');
  return str.substring(5, li);
}

// These are the log entries we care about from scrapy
// cat crawler.log | egrep -v '\[protego\]' | egrep -v '\[scrapy\.(down|ext|core|utils|crawler|spidermiddle)'
export async function readScrapyLogs(logfile: string): Promise<UrlGraph> {
  const inputStream = createReadLineStream(logfile)
  const redirectFromGraph: Dictionary<string> = {};
  const redirectToGraph: Dictionary<string> = {};
  const crawled200 = new Set<string>();
  const crawledErr = new Set<string>();
  const getUrlRE = new RegExp('<GET ([^>]*)>([ ]|$)', 'g');

  const pumpBuilder = streamPump.createPump()
    .viaStream<string>(inputStream)
    .throughF((line: string) => {
      const isCrawled = /DEBUG: Crawled/.test(line);
      const isCrawled200 = isCrawled && /\(200\)/.test(line);
      const isRedirect = /DEBUG: Redirecting \((30|meta)/.test(line);
      // const isForbidden = /DEBUG: Forbidden/.test(line);
      // const isCached = /\['cached'\]/.test(line);

      const isDEBUGLine = /S0097539792224838/.test(line);

      const urls1 = line.match(getUrlRE);

      if (isDEBUGLine) {
        prettyPrint({
          msg: 'log line',
          line,
          urls1,
          isCrawled,
          isRedirect,
        });
      }

      if (isRedirect && urls1) {
        const [toUrl, fromUrl] = urls1;
        const t = trimGetClause(toUrl);
        const f = trimGetClause(fromUrl);
        redirectFromGraph[f] = t;
        redirectToGraph[t] = f;
        if (isDEBUGLine) {
          prettyPrint({
            msg: '(redirect)',
            toUrl, t,
            fromUrl, f,
          });
        }
      }
      if (isCrawled && urls1) {
        const [crawlUrl] = urls1;
        const t = trimGetClause(crawlUrl);
        if (isCrawled200) {
          crawled200.add(t);
        } else {
          crawledErr.add(t);
        }
        if (isDEBUGLine) {
          prettyPrint({
            msg: '(crawled)',
            crawlUrl, t,
            isCrawled200
          });
        }
      }
      return line;
    });

  return pumpBuilder.toPromise()
    .then(() => {
      const redirectFrom = redirectFromGraph;
      const redirectTo = redirectToGraph;
      const crawledOk = crawled200;
      const crawledNotOk = crawledErr;
      const getChain = (url: string) => {
        const isDEBUGLine = /S0097539792224838/.test(url);
        const redirects: string[] = [url];
        let urlNext = redirectFrom[redirects[0]];
        if (isDEBUGLine) {
          prettyPrint({
            msg: 'getChain()',
            redirects, urlNext
          });
        }
        while (urlNext !== undefined && !redirects.includes(urlNext)) {
        // while (urlNext !== undefined) {
          redirects.unshift(urlNext);
          urlNext = redirectFrom[redirects[0]];
          if (isDEBUGLine) {
            prettyPrint({
              msg: 'while: from',
              redirects, urlNext
            });
          }
        }
        if (isDEBUGLine) {
          prettyPrint({
            msg: 'midway (pre)',
            redirects, urlNext
          });
        }
        redirects.reverse();
        urlNext = redirectTo[redirects[0]];
        if (isDEBUGLine) {
          prettyPrint({
            msg: 'midway (reversed)',
            redirects, urlNext
          });
        }
        while (urlNext !== undefined && !redirects.includes(urlNext)) {
        // while (urlNext !== undefined) {
          redirects.unshift(urlNext);
          urlNext = redirectTo[redirects[0]];
          if (isDEBUGLine) {
            prettyPrint({
              msg: 'while: to',
              redirects, urlNext
            });
          }
        }
        return redirects;
      };

      return {
        isUrlCrawled(url: string): boolean {
          const chain = getChain(url);
          const filtered = chain.filter(churl => crawledOk.has(churl) || crawledNotOk.has(churl));
          return filtered.length > 0;
        },

        getUrlFetchChain(url: string): string[] {
          return getChain(url);
        }
      }
    });
}

import fs, { } from 'fs-extra';

export async function pruneCrawledFromCSV(scrapyLogs: string, csvFile: string): Promise<void> {
  const urlGraph = await readScrapyLogs(scrapyLogs);
  console.log('created Url Graph');

  const inputStream = readOrderCsv(csvFile);

  const stats = {
    crawled: 0,
    uncrawled: 0,
    no_url: 0
  }

  let i = 0;

  const fd = fs.openSync(`${csvFile}.pruned.csv`, fs.constants.O_CREAT | fs.constants.O_WRONLY);

  const pumpBuilder = streamPump.createPump()
    .viaStream<InputRec>(inputStream)
    .tap((inputRec) => {
      if (i % 100 === 0) {
        console.log(`processed ${i} records`);
      }
      i += 1;

      const { url } = inputRec;
      const isCrawled = urlGraph.isUrlCrawled(url);
      if (isCrawled) {
        stats.crawled += 1;
      } else {

        if (url !== 'no_url') {
          stats.uncrawled += 1;
          const outrec = `,,,${url}\n`;
          fs.appendFileSync(fd, outrec);
        } else {
          stats.no_url += 1;
        }
      }
    }).throughF(d => d);

  await pumpBuilder.toPromise().then(() => {
    fs.closeSync(fd);
  });


  prettyPrint({ stats });
}


export async function verifyCrawledRecords(scrapyLogs: string, csvFile: string): Promise<void> {
  const urlGraph = await readScrapyLogs(scrapyLogs);

  const inputStream = readOrderCsv(csvFile);

  const stats = {
    crawled: 0,
    uncrawled: 0,
    no_url: 0
  }


  const pumpBuilder = streamPump.createPump()
    .viaStream<InputRec>(inputStream)
    .tap((inputRec) => {

      const { url } = inputRec;
      const fetchChain = urlGraph.getUrlFetchChain(url);
      const isCrawled = urlGraph.isUrlCrawled(url);

      if (fetchChain.length > 1) {
        prettyPrint({ url, fetchChain, isCrawled });
        _.each(fetchChain, chainUrl => {
          const fetchChainX = urlGraph.getUrlFetchChain(chainUrl);
          const areEqual = _.isEqual(fetchChainX, fetchChain);
          if (!areEqual) {
            prettyPrint({
              msg: "NOT EQUAL",
              fetchChain,
              chainUrl,
              fetchChainX
            });
          }

        })
      }

      if (isCrawled) {
        stats.crawled += 1;
      } else {
        if (url !== 'no_url') {
          stats.uncrawled += 1;
        } else {
          stats.no_url += 1;
        }
      }
    });

  await pumpBuilder.toPromise();


  prettyPrint({ stats });
}
// textworks-aas: url: 'https://doi.org/10.1109/SPAWC.2015.7227116'
// textworks-aas: fetchChain: [
// textworks-aas:   'https://doi.org/10.1109/SPAWC.2015.7227116',
// textworks-aas:   'http://ieeexplore.ieee.org/document/7227116/',
// textworks-aas:   [length]: 2
// textworks-aas: ]

// 2020-05-29 14:00:08 [scrapy.core.engine] INFO: Closing spider (finished)
// 2020-05-29 14:00:08 [scrapy.statscollectors] INFO: Dumping Scrapy stats:
// {'downloader/exception_count': 180,
//  'downloader/exception_type_count/scrapy.exceptions.IgnoreRequest': 173,
//  'downloader/exception_type_count/twisted.internet.error.ConnectError': 1,
//  'downloader/exception_type_count/twisted.internet.error.DNSLookupError': 2,
//  'downloader/exception_type_count/twisted.internet.error.TimeoutError': 4,
//  'downloader/request_bytes': 2993372,
//  'downloader/request_count': 5484,
//  'downloader/request_method_count/GET': 5484,
//  'downloader/response_bytes': 83423841,
//  'downloader/response_count': 5593,
//  'downloader/response_status_count/200': 2723,
//  'downloader/response_status_count/301': 1348,
//  'downloader/response_status_count/302': 1404,
//  'downloader/response_status_count/303': 7,
//  'downloader/response_status_count/307': 4,
//  'downloader/response_status_count/404': 104,
//  'downloader/response_status_count/500': 3,
//  'elapsed_time_seconds': 7395.622929,
//  'finish_reason': 'finished',
//  'finish_time': datetime.datetime(2020, 5, 29, 18, 0, 8, 918104),
//  'httpcache/firsthand': 2558,
//  'httpcache/hit': 116,
//  'httpcache/miss': 5484,
//  'httpcache/store': 2558,
//  'httperror/response_ignored_count': 83,
//  'httperror/response_ignored_status_count/404': 81,
//  'httperror/response_ignored_status_count/500': 2,
//  'log_count/DEBUG': 6493,
//  'log_count/ERROR': 7,
//  'log_count/INFO': 215,
//  'log_count/WARNING': 51,
//  'memusage/max': 99655680,
//  'memusage/startup': 46215168,
//  'response_received_count': 2674,
//  "robotstxt/exception_count/<class 'twisted.internet.error.DNSLookupError'>": 1,
//  'robotstxt/forbidden': 173,
//  'robotstxt/request_count': 121,
//  'robotstxt/response_count': 120,
//  'robotstxt/response_status_count/200': 96,
//  'robotstxt/response_status_count/404': 23,
//  'robotstxt/response_status_count/500': 1,
//  'scheduler/dequeued': 5613,
//  'scheduler/dequeued/memory': 5613,
//  'scheduler/enqueued': 5613,
//  'scheduler/enqueued/memory': 5613,
//  'start_time': datetime.datetime(2020, 5, 29, 15, 56, 53, 295175)}

