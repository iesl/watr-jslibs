import { spawn } from 'child_process';
import { streamifyProcess } from 'commons';
import _ from "lodash";

export async function openFileWithLess(infile: string): Promise<void> {
  const proc = spawn(
    'gnome-terminal',
    ["--command", `sh -c 'less ${infile}'`]
  );

  const { completePromise } = streamifyProcess(proc);
  return completePromise.then(() => undefined);
}

export async function openFileWithBrowser(infile: string): Promise<void> {
  const proc = spawn('firefox', [infile]);
  const { completePromise } = streamifyProcess(proc);
  return completePromise.then(() => undefined);
}

// TODO move this to a utility lib
type ToPairsDeepArg = Array<any> | _.AnyKindOfDictionary;
type ObjectPath = string[];
type ObjectPathAndPrimitive = Readonly<[ObjectPath, string, any]>;
type ObjectPathOnly = Readonly<[ObjectPath, string]>;
export type ObjectPathWithValue = ObjectPathAndPrimitive | ObjectPathOnly;

export function toPairsDeep(obj: ToPairsDeepArg): Array<ObjectPathWithValue> {

  function _loop(subobj: any, pathAccum: string[]): Array<ObjectPathWithValue> {

    if (_.isArray(subobj)) {
      const subPairs = _.flatMap(subobj, (entry, i) => {
        const subpath = _.concat(pathAccum, i.toString());
        return _loop(entry, subpath);
      });
      return _.concat([[pathAccum, 'array']], subPairs)
    }
    if (_.isObject(subobj)) {
      const kvs = _.toPairs(subobj);
      const subPairs = _.flatMap(kvs, ([k, v]) => {
        const subpath = _.concat(pathAccum, k);
        return _loop(v, subpath);
      });
      return _.concat([[pathAccum, 'object']], subPairs)
    }
    return [[pathAccum, typeof subobj, subobj]];
  }

  return _loop(obj, []);
  // .filter(kvs => kvs);

}
