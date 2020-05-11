import pumpify from "pumpify";
import { Stream } from "stream";

import {
  throughFunc,
  prettyPrint,
  createConsoleLogger,
  createPump,
  createReadLineStream,
  filterStream,
} from "commons";

import { openDatabase, Database } from './db';
import { Order, Url, NoteId, VenueUrl, OrderEntry } from './db-tables';

interface InputRec {
  noteId: string;
  dblpConfId: string;
  url: string;
  title: string;
}

export function splitCSVRecord(rec: string): InputRec {
  // console.log(`splitCSVRecord: ${rec}`);

  const fields = rec.split(',');
  let [noteId, dblpConfId] = fields;
  if (noteId===undefined || dblpConfId === undefined) {
    console.log(`error: splitCSVRecord: ${rec}`);
    noteId = noteId || "ERR-NOTEID";
    dblpConfId = dblpConfId || "ERR-DBLP";
  }
  let url = fields[fields.length-1];
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
  const inputStream = createReadLineStream(csvfile);
  return pumpify.obj(
    inputStream,
    filterStream((r: string) => r.trim().length > 0),
    throughFunc(splitCSVRecord),
  );
}

export interface COptions {
  // corpusRoot: string;
  // logpath: string;
  dbDataPath: string;
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

export async function createOrder(opts: COptions) {
  const logger = createConsoleLogger();
  logger.info({ event: "initializing order", config: opts });
  const inputStream = readOrderCsv(opts.csvFile);

  console.log('!!!!dropping/recreating db!!!')
  const db = await openDatabase();
  // .then(db => db.unsafeResetDatabase());


  console.log('about to create order...')
  const newOrder = await db.run(async () => {
    return Order.create()
      .catch(error => {
        prettyPrint({ error });
      });
  });

  if (!newOrder) return;

  const addEntry = addOrderEntry(db, newOrder);

  let i = 0;
  const pumpBuilder = createPump()
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

  pumpBuilder.start();
}
