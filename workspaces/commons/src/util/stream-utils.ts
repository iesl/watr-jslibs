import _ from "lodash";
import fs from "fs-extra";
import through from "through2";
import { Transform, Readable } from "stream";
import { prettyPrint } from "./pretty-print";
import es, { MapStream } from "event-stream";



export function throughFunc<T, R>(
  f: (t: T, onerr?: (e: any) => void) => R,
): Transform {
  return through.obj(
    (chunk: T, _enc: string, next: (err: any, v: any) => void) => {
      const res = f(chunk, (err: any) => next(err, null));
      Promise.resolve(res)
        .then((res) => next(null, res));
    },
  );
}

export function throughFuncPar<T, R, E>(
  parallelFactor: number,
  f: (t: T, env: E, currTransform: Transform) => R,
): Transform {

  let buffer: R[] = [];
  let envs: E[] = [];

  const chunker = through.obj(
    function(chunk: [T, E], _enc: string, next: (err: any, v: any) => void) {
      const self = this;
      const [data, env] = chunk;
      const localEnv: any = _.clone(env);
      localEnv['parNum'] = buffer.length;

      const res = f(data, localEnv, self);
      buffer.push(res);
      envs.push(localEnv);

      if (buffer.length < parallelFactor) {
        return next(null, null);
      }

      const buf0 = buffer;
      const envs0 = envs;
      buffer = [];
      envs = [];

      Promise.all(buf0.map(t => Promise.resolve(t)))
        .then(res => {
          _.each(res, (r: R, i: number) => this.push([r, envs0[i]]));
          next(null, null);
        });
    },
    function flush(cb) {
      Promise.all(buffer.map(t => Promise.resolve(t)))
        .then(res => {
          _.each(res, (r: R, i: number) => this.push([r, envs[i]]));
        })
        .then(() => cb())
      ;
    },
  );
  return chunker;
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


export function initEnv<T, E>(
  f: (t: T) => E,
): Transform {
  return through.obj(
    (chunk: T, _enc: string, next: (err: any, v: any) => void) => {
      const initEnv = f(chunk);
      Promise.resolve(initEnv)
        .then((env) => next(null, [chunk, env]));
    },
  );
}

export function throughEnvFunc<T, R, E>(
  f: (t: T, env: E, currTransform: Transform) => R,
): Transform {
  return through.obj(
    function(chunk: [T, E], _enc: string, next: (err: any, v: any) => void) {
      const self = this;
      const [tchunk, env] = chunk;
      const res = f(tchunk, env, self);
      Promise.resolve(res)
        .then((res) => next(null, [res, env]));
    },
  );
}

export function filterEnvStream<T, E>(f: (t: T, env: E) => boolean): Transform {
  return through.obj(
    (chunk: [T, E], _enc: string, next: (err: any, v: any) => void) => {
      const [tchunk, env] = chunk;
      const res = f(tchunk, env);
      Promise.resolve(res)
        .then((res) => res ? next(null, [tchunk, env]) : next(null, null));
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


export function prettyPrintTrans(msg: string): Transform {
  return through.obj(
    (data: any, _enc: string, next: (err: any, v: any) => void) => {
      prettyPrint({ msg, data });
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
  let state = "awaiting-start";

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

export function chunkStream<T>(
  chunkSize: number
): Transform {
  let buffer: T[] = [];

  const chunker = through.obj(
    function(data: T, _enc: string, next: (err: any, v: any) => void) {
      if (buffer.length === chunkSize) {
        const r = buffer;
        buffer = [];
        return next(null, r);
      }

      buffer.push(data);
      return next(null, null);
    },
    function flush(cb) {
      this.push(buffer);
      cb();
    },
  );
  return chunker;
}


/**
 * Create a Readable stream of chars by splitting string
 */
export function charStream(str: string): Readable {
  async function* genstr(s: string) {
    yield* s;
  }
  return Readable.from(genstr(str))
}

export function arrayStream(arr: any[]): Readable {
  async function* genstr(a: any[]) {
    yield* a;
  }
  return Readable.from(genstr(arr))
}

export async function promisifyReadableEnd(readStream: Readable): Promise<void> {
  return new Promise((resolve) => {
    readStream.on('end', function () {
      resolve();
    });
  });
}
