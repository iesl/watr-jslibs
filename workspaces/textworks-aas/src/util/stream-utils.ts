import _ from 'lodash';
import through from 'through2';
import { Transform }  from 'stream';
import { prettyPrint } from './pretty-print';

export function throughFunc<T, R>(f: (t: T, onerr?: (e: any) => void) => R): Transform {
  return through.obj(
    (chunk: T, _enc: string, next: (err: any, v: any) => void) => {
      const res = f(chunk, (err: any) => next(err, null));
      next(null, res);
    }
  );
}

export function tapFunc<T>(f: (t: T, i?: number) => void): Transform {
  let currIndex = -1;

  return through.obj(
    (data: T, _enc: string, next: (err: any, v: any) => void) => {
      currIndex ++;
      f(data, currIndex);
      return next(null, data);
    }
  );
}

export function tapStream(msg: string): Transform {
  return through.obj(
    (data: any, _enc: string, next: (err: any, v: any) => void) => {
      prettyPrint({ msg, data });
      return next(null, data);
    }
  );
}

export function sliceStream(start: number, len: number): Transform {
  let currIndex = -1;
  return through.obj(
    (chunk: any, _enc: string, next: (err: any, v: any) => void) => {
      currIndex++;
      if (start <= currIndex) {
        if ( currIndex < start+len) {
          return next(null, chunk);
        }
        return next('done', null);
      }
      return next(null, null);
    }
  );

}

export function progressCount(): Transform {
  let currIndex = 0;
  return through.obj(
    (chunk: any, _enc: string, next: (err: any, v: any) => void) => {
      console.log(`entry ${currIndex}`)
      currIndex++;
      return next(null, chunk);
    }
  );
}


