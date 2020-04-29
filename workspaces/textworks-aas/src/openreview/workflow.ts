
import pumpify from "pumpify";
import { Stream } from "stream";

import {
  throughFunc,
  csvStream,
  prettyPrint,
  createConsoleLogger,
  createPump,
} from "commons";

import { openDB, initTables, Table, OrderEntry } from './db';

export function readOrderCsv(csvfile: string): Stream {
  return pumpify.obj(
    csvStream(csvfile),
    throughFunc((csvRec: string[]) => {
      const [noteId, dblpConfId] = csvRec;
      const url = csvRec[csvRec.length - 1];
      return {
        url,
        noteId,
        dblpConfId
      }
    })
  );
}

export interface COptions {
  // corpusRoot: string;
  // logpath: string;
  storagePath: string;
  csvFile: string;
}

interface InputRec {
  noteId: string;
  dblpConfId: string;
  url: string;
}

export async function createOrder(opts: COptions) {
  const logger = createConsoleLogger();
  logger.info({ event: "initializing order", config: opts });
  const inputStream = readOrderCsv(opts.csvFile);
  // const env = { orderId: ... };
  // create order
  const db = await openDB(opts.storagePath);
  const newOrder = await Table.Order.create({});
  const orderId = newOrder.id;


  const addOrderEntry: (r: InputRec) => Promise<OrderEntry> = async r => {
    const { noteId, url, dblpConfId } = r;

    const [urlEntry,] = await Table.Url.findOrCreate({
      where: { url },
      defaults: { url }
    });

    const [noteEntry,] = await Table.NoteId.findOrCreate({
      where: { noteId },
      defaults: { noteId }
    });

    const [venueEntry,] = await Table.VenueUrl.findOrCreate({
      where: { url: dblpConfId },
      defaults: { url: dblpConfId }
    });

    return Table.OrderEntry.create({
      order: orderId,
      note: noteEntry.id,
      url: urlEntry.id,
      venue: venueEntry.id,
      source: r,
    });
  }

  const pumpBuilder = createPump()
    .viaStream<InputRec>(inputStream)
    .tap(d => prettyPrint({ d }))
    .throughF(addOrderEntry)
    .tap(orderEntry => {
      const entry = orderEntry.get({ plain: true });
      prettyPrint({ entry });
    })
    .onEnd(() => {
      logger.info({ event: "done" });
    });

  pumpBuilder.start();
}

export async function initDatabase(storagePath: string) {
  const db = await openDB(storagePath);
  initTables(db)
  await db.sync();
}
