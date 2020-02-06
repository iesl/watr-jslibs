import _ from "lodash";

export type Radix<T> = {[s: string]: Radix<T> | T};
export type RadixPath = string[];

const RadixValKey = "_$";

export const createRadix = <T>() => ({} as Radix<T>);

const cleanPath = (p: string | string[]) => {
  let pathParts: string[];
  if (typeof p === "string") {
    pathParts = p.split(".");
  } else {
    pathParts = p;
  }
  return _.map(pathParts, pp => {
    const part = pp.trim();
    if (/^\d+$/.test(part)) {
      return `_${part}`;
    }
    if (/^_[$]$/.test(part)) {
      return `_${part}`;
    }
    return part;
  }).filter(p => p.length > 0);
};

export const insertRadix = <T>(
  radix: Radix<T>,
  path: string | string[],
  t: T,
) => upsertRadix(radix, path, () => t);

export const upsertRadix = <T>(
  radix: Radix<T>,
  path: string | string[],
  f: (t?: T) => T,
) => {
  const valpath = [...cleanPath(path), RadixValKey];
  const prior = _.get(radix, valpath);
  const upVal = f(prior);
  _.set(radix, valpath, upVal);
};

export const traverseRadixValues = <T>(
  radix: Radix<T>,
  f: (path: RadixPath, t?: T) => void,
) => {
  function _loop(rad: Radix<T>, lpath: string[]) {
    const kvs = _.toPairs(rad);
    _(kvs)
      .each(([k, v]) => {
        if (k === RadixValKey) {
          f(lpath, v as T);
        } else {
          const newpath = _.concat(lpath, k);
          _loop(rad[k] as Radix<T>, newpath);
        }
      });
  }
  _loop(radix, []);
};

export function traverseObject(
  fn: (o: any, p: string[]) => void,
  initObj: any,
) {
  function _loop(lobj: any, lpath: string[]) {
    fn(lobj, lpath);
    if (!_.isArray(lobj)) {
      _.each(_.keys(lobj), k => {
        const newpath = _.concat(lpath, k);
        _loop(lobj[k], newpath);
      });
    }
  }
  _loop(initObj, []);
}

export const printSummary = (accObj: any) =>
  traverseObject((currObj, currPath) => {
    if (_.isArray(currObj)) {
      console.log(`${_.join(currPath, " / ")}: ${currObj.length}`);
    }
  }, accObj);

export class RadixTree {
  treeObj: any;

  constructor() {
    this.treeObj = {};
  }

  public insert(key: string[], v: any[]) {
    const currValue = _.get(this.treeObj, key, []);
    _.set(this.treeObj, key, _.concat(currValue, [v]));
  }
}

export const traverseUrls = (
  accObj: any,
  fn: (url: string, hid: string, treePath: string[]) => void,
) => {
  traverseObject((currObj, currPath) => {
    if (_.isArray(currObj)) {
      _.each(currObj, ([url, hashId]) => {
        fn(url, hashId, currPath);
      });
    }
  }, accObj);
};
