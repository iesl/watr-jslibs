//
import _ from 'lodash';
import fs from 'fs-extra';
import * as csv from 'fast-csv';
import path from 'path';

import cmds from 'caporal';
const program = cmds;

program
  .command('load', 'load csv and report some info')
  .argument('<file>', 'csv file name')
  .action((args, _opts, _logger) => {

    loadcsv(args.file)

  });

function traverseObject(fn: (o: any, p: string[]) => void, initObj: any) {
  function _loop(lobj: any, lpath: string[]) {
    // console.log(`traverse: ${_.join(lpath, ' / ')}: obj[ ${_.keys(lobj)} ]`);
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

const printSummary = (accObj: any) => traverseObject((currObj, currPath) => {
  if (_.isArray(currObj)) {
    console.log(`${_.join(currPath, ' / ')}: ${currObj.length}`);
  }
}, accObj);

const addUrlPaths = (initObj: any) => traverseObject((currObj, currPath) => {
  console.log(`addUrlPaths: ${currPath}, `);

  if (_.isArray(currObj)) {
    const urls = currObj;
    const daccum: any = {};
    console.log(`  addUrlPaths (isArray): ${currObj.length}, ${currObj[0]} `);

    _.each(urls, url => {
      if (url.includes('//')) {
        const urlPath = url.split('//')[1];
        const urlDomain = urlPath.split('/')[0];
        const domainParts = urlDomain.split('.').reverse();
        const urlList = _.get(daccum, domainParts, []);
        _.set(daccum, domainParts, _.concat(urlList, url));
      } else {
        const nonUrls = _.get(daccum, [url], []);
        _.set(daccum, [url], _.concat(nonUrls, url));
      }

      const parentPath = currPath.slice(0, currPath.length-1);
      const lastPathPart = currPath[currPath.length-1];
      const parentObj = _.get(initObj, parentPath);
      parentObj[lastPathPart] = daccum;
    });
  }
}, initObj);

function loadcsv(csvfile: string) {

  const csvabs = path.resolve(csvfile);
  const fileExists = fs.existsSync(csvabs);

  console.log(`exists=${fileExists}: ${csvabs} `);

  let accum: any = {};

  if (fileExists) {
    fs.createReadStream(csvabs)
      .pipe(csv.parse({ headers: false }))
      .on('data', (row: string[]) => {
        parseCsvRow(row);
      })
      .on('end', () => {
        console.log(`done...`);
        addUrlPaths(accum);
        printSummary(accum);
      })
    ;

  }


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
    _.set(accum, parts, _.concat(urlList, url));
  }

}


program.parse(process.argv);

        // for (const k0 in accum) {
        //   const accum1 = accum[k0];
        //   for (const k1 in accum1) {
        //     const accum2 = accum1[k1];
        //     for (const k2 in accum2) {
        //       const accum3 = accum2[k2];
        //       for (const k3 in accum3) {
        //         const accum4: string[] = accum3[k3];
        //         const len = accum4.length;
        //         console.log(`${k0} / ${k1} / ${k2} / ${k3} # ${len}`);

        //         const urls = accum4;
        //         const daccum: any = {};

        //         _.each(urls, url => {
        //           if (url.includes('//')) {
        //             const urlPath = url.split('//')[1];
        //             const urlDomain = urlPath.split('/')[0];
        //             const domainParts = urlDomain.split('.').reverse();
        //             const urlList = _.get(daccum, domainParts, []);
        //             _.set(daccum, domainParts, _.concat(urlList, url));
        //           } else {
        //             const nonUrls = _.get(daccum, [url], []);
        //             _.set(daccum, [url], _.concat(nonUrls, url));
        //           }
        //         });
        //       }
        //     }
        //   }
        // }
