import _ from 'lodash';
import fs from 'fs-extra';
import * as csv from 'fast-csv';
import path from 'path';

import {prettyPrint} from  './pretty-print';

export async function csvToPathTree(csvfile: string): Promise<any> {

  return new Promise((resolve, reject) => {
    const csvabs = path.resolve(csvfile);
    const fileExists = fs.existsSync(csvabs);

    if (!fileExists) {
      return reject(`File not found: ${csvabs} `);
    }
    let accum: any = {};

    function parseCsvRow(row: string[]) {
      const [hashId, dblpId, url] = row;
      const parts0 = dblpId.split('/');
      const parts = _.map(parts0, (p: string) => {
        if (p.match(/\d+/)) {
          return `_${p}`;
        }
        return p;
      });
      const urlList = _.get(accum, parts, []);
      _.set(accum, parts, _.concat(urlList, [[url, hashId]]));
    }

    fs.createReadStream(csvabs)
      .pipe(csv.parse({ headers: false }))
      .on('data', (row: string[]) => {
        parseCsvRow(row);
      })
      .on('end', () => {
        console.log(`done...`);
        // prettyPrint({ msg: 'pre', accum });
        addUrlPaths(accum);
        // prettyPrint({ msg: 'post', accum });
        resolve(accum);
      });
  });
}

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


const addUrlPaths = (initObj: any) => traverseObject((currObj, currPath) => {

  if (_.isArray(currObj)) {
    const urls = currObj;
    const daccum: any = {};

    let iter = 0;

    _.each(urls, ([url, hashId]) => {
      // console.log(`addUrlPaths url: ${url} `);
      // console.log(`            hid: ${hashId} `);
      if (url.includes('//')) {
        const urlDomainAndPath = url.split('//')[1];
        const urlDomain = urlDomainAndPath.split('/')[0];
        const domainParts = urlDomain.split('.').reverse();
        const domainUrlsPath = _.concat(domainParts, '_urls_');
        const urlList = _.get(daccum, domainUrlsPath, []);
        _.set(daccum, domainUrlsPath, _.concat(urlList, [[url, hashId]]));
      } else {
        const nonUrls = _.get(daccum, [url], []);
        _.set(daccum, [url], _.concat(nonUrls, [[url, hashId]]));
      }

      prettyPrint({ msg: `iter ${iter}`, url, hashId, daccum });
    });

    prettyPrint({ msg: 'done', daccum });

    const parentPath = currPath.slice(0, currPath.length-1);
    const lastPathPart = currPath[currPath.length-1];
    const parentObj = _.get(initObj, parentPath);
    parentObj[lastPathPart] = daccum;
  }
}, initObj);
