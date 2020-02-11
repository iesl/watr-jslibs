import _ from "lodash";
import fs from "fs-extra";
import through from "through2";
import pumpify from "pumpify";
import {Transform, Stream} from "stream";
import {prettyPrint} from "./pretty-print";
import es, {MapStream} from "event-stream";

export interface PumpBuilder<ChunkT> {
  streams: Stream[];
  onDataF?: (t: ChunkT) => void;
  onCloseF?: (err: Error) => void;
  onEndF?: () => void;

  throughF<R>(f: (t: ChunkT) => R): PumpBuilder<R>;
  viaStream<R>(s: Stream): PumpBuilder<R>;
  tap(f: (t: ChunkT, i?: number) => void): PumpBuilder<ChunkT>;
  onData(f: (t: ChunkT) => void): PumpBuilder<ChunkT>;
  onClose(f: (err?: Error) => void): PumpBuilder<ChunkT>;
  onEnd(f: () => void): PumpBuilder<ChunkT>;
  start(): Stream;
}

type PartialPB<T> = Partial<PumpBuilder<T>>;

function appendStream<ChunkT>(
  builder: PumpBuilder<ChunkT>,
  vstr: Stream,
): PumpBuilder<any> {
  const newBuilder: PumpBuilder<any> = _.merge(
    {},
    builder,
    {streams: _.concat(builder.streams, [vstr])},
  );

  return newBuilder;
}

export function createPump<ChunkT>(): PumpBuilder<ChunkT> {
  const merge = (builder: PumpBuilder<ChunkT>, part: PartialPB<ChunkT>) =>
    _.merge({}, builder, part);

  const pb0: PumpBuilder<ChunkT> = {
    streams: [],
    onData(f: (t: ChunkT) => void): PumpBuilder<ChunkT> {
      return merge(this, {onDataF: f});
    },
    onClose(f: (err?: Error) => void): PumpBuilder<ChunkT> {
      return merge(this, {onCloseF: f});
    },
    onEnd(f: () => void): PumpBuilder<ChunkT> {
      return merge(this, {onEndF: f});
    },
    throughF<R>(f: (t: ChunkT) => R): PumpBuilder<R> {
      return appendStream(this, throughFunc(f));
    },
    viaStream<R>(s: Stream): PumpBuilder<R> {
      return appendStream(this, s);
    },
    tap(f: (t: ChunkT, i?: number) => void): PumpBuilder<ChunkT> {
      return appendStream(this, tapStream(f));
    },
    start(): Stream {
      const pipe = pumpify.obj(this.streams);
      if (this.onCloseF) {
        pipe.on("close", this.onCloseF);
      }
      if (this.onEndF) {
        pipe.on("end", this.onEndF);
      }
      pipe.on("data", this.onDataF ? this.onDataF : () => {});
      return pipe;
    },
  };
  return pb0;
}
export function throughFunc<T, R>(
  f: (t: T, onerr?: (e: any) => void) => R,
): Transform {
  return through.obj(
    (chunk: T, _enc: string, next: (err: any, v: any) => void) => {
      const res = f(chunk, (err: any) => next(err, null));
      next(null, res);
    },
  );
}

export function throughAccum<T, Acc>(
  f: (acc: Acc, t: T, onerr?: (e: any) => void) => Acc,
  init: Acc,
): Transform {
  let currAcc = init;
  const chunker = through.obj(
    function(chunk: T, _enc: string, next: (err: any, v: any) => void) {
      const newAcc = f(currAcc, chunk, (err: any) => next(err, null));
      currAcc = newAcc;
      next(null, null);
    },
    function flush(cb) {
      this.push(currAcc);
      cb();
    },
  );
  return chunker;
}

export function handlePumpError(error: Error): void {
  if (error) {
    console.log(`Error:`, error);
  }
}

export function filterStream<T>(f: (t: T) => boolean): Transform {
  return through.obj(
    (data: T, _enc: string, next: (err: any, v: any) => void) => {
      if (f(data)) {
        return next(null, data);
      }
      return next(null, null);
    },
  );
}

export function tapStream<T>(f: (t: T, i?: number) => void): Transform {
  let currIndex = -1;

  return through.obj(
    (data: T, _enc: string, next: (err: any, v: any) => void) => {
      currIndex++;
      f(data, currIndex);
      return next(null, data);
    },
  );
}

export function prettyPrintTrans(msg: string): Transform {
  return through.obj(
    (data: any, _enc: string, next: (err: any, v: any) => void) => {
      prettyPrint({msg, data});
      return next(null, data);
    },
  );
}

export function sliceStream(start: number, len: number): Transform {
  let currIndex = -1;
  return through.obj(function(
    chunk: any,
    _enc: string,
    next: (err: any, v: any) => void,
  ) {
    currIndex++;
    if (start <= currIndex) {
      if (currIndex < start + len) {
        return next(null, chunk);
      }
      return next(null, null);
    }
    return next(null, null);
  });
}

export function progressCount(everyN?: number): Transform {
  let currIndex = 0;
  const outputOn = everyN ? everyN : 1;
  return through.obj(
    (chunk: any, _enc: string, next: (err: any, v: any) => void) => {
      if (currIndex % outputOn === 0) {
        console.log(`progress: ${currIndex}`);
      }
      currIndex++;
      return next(null, chunk);
    },
  );
}

export function createReadLineStream(filename: string): MapStream {
  const str: es.MapStream = fs.createReadStream(filename).pipe(es.split());

  return str;
}

/**
 * Turn a stream of text lines into a stream of multi-line string blocks   (stanzas)
 * TODO this does not yet work very well...
 */
export function stanzaChunker(
  testStart: (s: string) => boolean,
  testEnd: (s: string) => boolean,
  // opts?: {
  //   beginOffset?: number;
  //   endOffset?: number;
  // },
): Transform {
  let stanzaBuffer: string[] = [];
  let state: string = "awaiting-start";

  const chunker = through.obj(
    function(line: string, _enc: string, cb) {
      const isStart = testStart(line);
      const isEnd = testEnd(line);

      if (state === "awaiting-start" && isStart) {
        stanzaBuffer = [];
        stanzaBuffer.push(line);
        state = "in-stanza";
      } else if (state === "in-stanza") {
        stanzaBuffer.push(line);
      }

      if (isEnd) {
        state = "awaiting-start";
        const stanza = _.join(stanzaBuffer, "");
        stanzaBuffer = [];
        return cb(null, stanza);
      }

      return cb(null, null);
    },
    function flush(cb) {
      // TODO handle error if buffer has leftovers w/o seeing end marker
      cb();
    },
  );
  return chunker;
}

// TODO const unwind: <T>(arr: T[]): Stream<T> =
// TODO const collect: <T>(arr: Stream<T>): T[] =
