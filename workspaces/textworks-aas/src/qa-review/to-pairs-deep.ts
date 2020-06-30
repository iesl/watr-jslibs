import _ from "lodash";

type ToPairsDeepArg = Array<any> | _.AnyKindOfDictionary;
type ObjectPath = string[];
type ObjectPathAndPrimitive = Readonly<[ObjectPath, string, any]>;
type ObjectPathOnly = Readonly<[ObjectPath, string]>;
export type ObjectPathWithValue = ObjectPathAndPrimitive | ObjectPathOnly;


export interface PathPart {
  key: string;
  n: number;
  sibs: number;
  pathType: string;
  value?: any;
}

type PathParts = PathPart[];
type QualifiedPath = Readonly<[PathParts]>;
type QualifiedValue = Readonly<[PathParts, any]>;
type QualifiedPathValue = QualifiedPath | QualifiedValue;

export function toObjectPath(qp: QualifiedPathValue): string[] {
  return _.map(qp[0], p => p.key);
}

export function toQualifiedPaths(obj: ToPairsDeepArg): QualifiedPathValue[] {

  function _loop(
    subobj: any,
    parentPath: PathParts
  ): QualifiedPathValue[] {

    if (_.isArray(subobj)) {
      const subPaths = _.flatMap(subobj, (entry, i) => {
        const pathPart: PathPart = {
          key: i.toString(),
          n: i,
          sibs: subobj.length,
          pathType: 'array'
        };
        const subPath = _.concat(parentPath, pathPart);
        return _loop(entry, subPath);
      });

      return _.concat([[parentPath]], subPaths)
    }

    if (_.isObject(subobj)) {
      const kvs = _.toPairs(subobj);
      const subPaths = _.flatMap(kvs, ([k, v], i) => {
        const pathPart: PathPart = {
          key: k,
          n: i,
          sibs: kvs.length,
          pathType: 'object'
        };
        const subPath = _.concat(parentPath, pathPart);
        return _loop(v, subPath);
      });
      return _.concat([[parentPath]], subPaths)
    }
    return [[parentPath, subobj]];
  }

  return _loop(obj, []);
}
