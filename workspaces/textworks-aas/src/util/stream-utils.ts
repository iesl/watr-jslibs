import _ from 'lodash';
import through from 'through2';
import { Transform }  from 'stream';

export function throughFunc<T, R>(f: (t: T, onerr?: (e: any) => void) => R): Transform {
  return through.obj(
    (chunk: T, _enc: string, next: (err: any, v: any) => void) => {
      const res = f(chunk, (err: any) => next(err, null));
      next(null, res);
    }
  );

}

export function sliceStream(start: number, len: number): Transform {
  let currIndex = -1;
  return through.obj(
    (chunk: any, _enc: string, next: (err: any, v: any) => void) => {
      currIndex++;
      if (start <= currIndex && currIndex < start+len) {
        return next(null, chunk);
      }
      return next(null, null);
    }
  );

}
