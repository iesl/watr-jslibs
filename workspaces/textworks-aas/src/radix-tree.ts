
import _ from 'lodash';

export function traverseObject(fn: (o: any, p: string[]) => void, initObj: any) {
  function _loop(lobj: any, lpath: string[]) {
    fn(lobj, lpath);
    if (!_.isArray(lobj)) {
      _.each(_.keys(lobj), k => {
        const newpath = _.concat(lpath, k)
        _loop(lobj[k], newpath);
      });
    }
  }
  _loop(initObj, []);
}


export const printSummary = (accObj: any) => traverseObject((currObj, currPath) => {
  if (_.isArray(currObj)) {
    console.log(`${_.join(currPath, ' / ')}: ${currObj.length}`);
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

export const traverseUrls = (accObj: any, fn: (url: string, hid: string, treePath: string[]) => void) => {
  console.log('traverseUrls; ');

  traverseObject((currObj, currPath) => {

    if (_.isArray(currObj)) {
      _.each(currObj, ([url, hashId]) => {
        fn(url, hashId, currPath);
      });
    }
  }, accObj);
}
