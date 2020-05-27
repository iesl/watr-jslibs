import pumpify from "pumpify";
import { Stream } from "stream";

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

interface InputRec {
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

export interface UrlGraph {
  isUrlCrawled(url: string): boolean;
}

function trimGetClause(str: string): string {
  const li = str.lastIndexOf('>');
  return str.substring(5, li);
}

export async function readScrapyLogs(logfile: string): Promise<UrlGraph> {
  const inputStream = createReadLineStream(logfile)
  const redirectGraph: Dictionary<string> = {};
  const crawled = new Set<string>();

  const pumpBuilder = streamPump.createPump()
    .viaStream<string>(inputStream)
    .throughF((line: string) => {
      const isCrawled = /DEBUG: Crawled/.test(line);
      const isRedirect301 = /DEBUG: Redirecting \(301\)/.test(line);
      const isRedirect302 = /DEBUG: Redirecting \(302\)/.test(line);
      const isRedirectRefresh = /DEBUG: Redirecting \(meta refresh\)/.test(line);
      // const isForbidden = /DEBUG: Forbidden/.test(line);
      const isCached = /\['cached'\]/.test(line);
      const getUrlRE = new RegExp('<GET ([^>]*)>([ ]|$)', 'g');
      const urls1 = line.match(getUrlRE);

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
      return line;
    });

  return pumpBuilder.toPromise()
    .then(() => {
      const redirects = redirectGraph;
      const crawls = crawled;
      return {
        isUrlCrawled(url: string): boolean {
          let url0 = url;
          let urlNext = redirects[url0];
          while (urlNext !== undefined) {
            url0 = urlNext;
            urlNext = redirects[url0];
          }
          return crawls.has(url0);
        }
      }
    });
}

import fs, { } from 'fs-extra';
export async function pruneCrawledFromCSV(scrapyLogs: string, csvFile: string): Promise<void> {
  const urlGraph = await readScrapyLogs(scrapyLogs);
  const inputStream = readOrderCsv(csvFile);

  console.log('created Url Graph');
  const stats = {
    crawled: 0,
    uncrawled: 0,
    no_url: 0
  }

  const fd = fs.openSync(`${csvFile}.pruned.csv`, fs.constants.O_CREAT | fs.constants.O_WRONLY);

  const pumpBuilder = streamPump.createPump()
    .viaStream<InputRec>(inputStream)
    .tap((inputRec) => {
      const { url } = inputRec;
      const isCrawled = urlGraph.isUrlCrawled(url);
      if (isCrawled) {
        stats.crawled += 1;
        // console.log(`+ ${url}`);
      } else {

        if (url !== 'no_url') {
          stats.uncrawled += 1;
          fs.appendFileSync(fd, url + "\n");
        } else {
          stats.no_url += 1;
        }
      }
    });

  await pumpBuilder.toPromise();

  fs.closeSync(fd);

  prettyPrint({ stats });
}
