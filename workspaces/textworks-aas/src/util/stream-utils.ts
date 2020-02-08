import _ from "lodash";
import fs from "fs-extra";
import through from "through2";
import {Transform} from "stream";
import {prettyPrint} from "./pretty-print";
import es, {MapStream} from "event-stream";

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
  opts?: {
    beginOffset?: number;
    endOffset?: number;
  },
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
