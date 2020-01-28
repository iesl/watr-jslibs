import _ from 'lodash';
import fs from 'fs-extra';
import * as csv from 'fast-csv';
import path from 'path';

import { traverseObject } from './radix-tree';
import { prettyPrint } from './pretty-print';

export async function parseCsv(csvfile: string): Promise<string[][]> {

  return new Promise((resolve, reject) => {
    const csvabs = path.resolve(csvfile);
    const fileExists = fs.existsSync(csvabs);

    if (!fileExists) {
      return reject(`File not found: ${csvabs} `);
    }

    let accum: any = [];

    fs.createReadStream(csvabs)
      .pipe(csv.parse({ headers: false }))
      .on('data', (row: string[]) => {
        accum.push(row);
      })
      .on('end', () => {
        resolve(accum);
      });
  });
}

export async function csvToPathTree(csvfile: string): Promise<any> {
  return parseCsv(csvfile)
    .then((rows: string[][]) => {
      // prettyPrint({ rows: rows.slice(0, 10) });

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

      _.each(rows, parseCsvRow);

      addUrlPaths(accum);
      return accum;
    });
}




const addUrlPaths = (initObj: any) => traverseObject((currObj, currPath) => {

  if (_.isArray(currObj)) {
    const urls = currObj;
    const daccum: any = {};

    _.each(urls, ([url, hashId]) => {
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
    });

    const parentPath = currPath.slice(0, currPath.length-1);
    const lastPathPart = currPath[currPath.length-1];
    const parentObj = _.get(initObj, parentPath);
    parentObj[lastPathPart] = daccum;
  }
}, initObj);
