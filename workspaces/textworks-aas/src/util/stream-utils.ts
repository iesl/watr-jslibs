import _ from "lodash";
import fs from "fs-extra";
import through from "through2";
import {Transform, Readable} from "stream";
import {prettyPrint} from "./pretty-print";

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

export function tapFunc<T>(f: (t: T, i?: number) => void): Transform {
  let currIndex = -1;

  return through.obj(
    (data: T, _enc: string, next: (err: any, v: any) => void) => {
      currIndex++;
      f(data, currIndex);
      return next(null, data);
    },
  );
}

export function tapStream(msg: string): Transform {
  return through.obj(
    (data: any, _enc: string, next: (err: any, v: any) => void) => {
      prettyPrint({msg, data});
      return next(null, data);
    },
  );
}

export function sliceStream(start: number, len: number): Transform {
  let currIndex = -1;
  return through.obj(
    (chunk: any, _enc: string, next: (err: any, v: any) => void) => {
      currIndex++;
      if (start <= currIndex) {
        if (currIndex < start + len) {
          return next(null, chunk);
        }
        return next("done", null);
      }
      return next(null, null);
    },
  );
}

export function progressCount(everyN?: number): Transform {
  let currIndex = 0;
  const outputOn = everyN? everyN : 1;
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

export function createReadStream(filename: string): Readable {
  const str = fs.createReadStream(filename);
  str.on("end", () => {
    str.destroy();
  });
  return str;
}

/**
 * Turn a stream of text lines into a stream of grouped lines (stanzas)
 * TODO stanzaChunker not yet implemented
 */
export function stanzaChunker(
  testStart: (s: string) => boolean,
  testEnd?: (s: string) => boolean,
): Transform {
  const chunker = through.obj(
    function(line: Buffer, _enc: string, cb) {
      // const lineChunk = blineChunk.toString();
      // const isStart = /^extracting/.test(lineChunk);
      // const isAbstract = /^  >/.test(lineChunk);

      // if (isStart) {
      //   if (noteId && abs) {
      //     nextRec = {
      //       entryPath,
      //       noteId,
      //       fields: [{name: "abstract", value: abs}],
      //     };
      //   }
      //   entryPath = noteId = abs = undefined;

      //   const matchHashId = /^extracting (.*)\/([^\/]+)\/download.html$/.exec(
      //     lineChunk,
      //   );
      //   if (!matchHashId) {
      //     throw Error(`matchHashId should have succeeded on ${lineChunk}`);
      //   }
      //   entryPath = matchHashId[1];
      //   noteId = matchHashId[2];
      //   entryPath = path.join(entryPath, noteId);

      //   if (nextRec) {
      //     const z = nextRec;
      //     nextRec = undefined;
      //     return cb(null, z);
      //   }
      // } else if (isAbstract) {
      //   const a = lineChunk.split(">")[1].trim();
      //   abs = a;
      // }

      return cb(null, null);
    },
    function flush(cb) {
      cb();
    },
  );
  return chunker;
}
