import _ from 'lodash';
// import fs from 'fs-extra';
// import path from 'path';


// import { csvToPathTree } from '~/util/parse-csv';
// import { traverseUrls } from '~/util/radix-tree';
// import { prettyPrint } from '~/util/pretty-print';
// import { suspiciousAbstractRegexes } from '~/extract/field-extract-utils';

export type Verified = 'correct' | 'incorrect' ;

export interface ExtractError {
  msg: string;
}

export interface Field {
  name: string;
  evidence: string;
  verified?: Verified;
  value?: string;
}


export interface DocumentMeta {
  fields: Field[];
  url: string;
  id: string;
  path: string;
  error?: ExtractError;
}

/**
 *  Traverse the spidered html files and try to extract fields (abstract)
 *  Write the extracted fields to a json file
 */
// export function extractAbstractFromHtml(csvfile: string, outdir: string) {
//   const workingDir = outdir;

//   const documentMetas: DocumentMeta[] = [];
//   // let docsFound = 0;

//   csvToPathTree(csvfile).then((treeObj: any) => {
//     traverseUrls(treeObj, (url: string, hashId: string, treePath: string[]) => {

//       const meta: DocumentMeta = {
//         fields: [],
//         id: hashId,
//         url,
//         path: '',
//         error: undefined
//       };

//       const basepath = makePath(workingDir, hashId, treePath);
//       if (!basepath) {
//         meta.error = { msg: `basepath doesn't exist: ${basepath}`};
//       } else {
//         meta.path = basepath;
//         const absts = extractAbstract(basepath);
//         if ('msg' in absts) {
//           meta.error = absts;
//         } else {
//           meta.fields = absts;
//         }
//       }

//       documentMetas.push(meta);
//     });
//   }).then(() => {

//     const noAbstracts = documentMetas.filter(dm => {
//       const withAbstracts = dm.fields.filter(f => f.value !== undefined);
//       return withAbstracts.length===0;
//     });

//     const withAbstracts = documentMetas.filter(dm => {
//       return _.some(dm.fields, f => f.value!==undefined);
//     });

//     const nonSuspiciousAbstracts = withAbstracts.filter(dm => {
//       const nonSuspiciousFields = dm.fields.filter(f => {
//         const v = f.value;
//         if (v) {
//           return !_.some(suspiciousAbstractRegexes, re => {
//             const result = re.test(v);
//             const tooShort = v.length <= 80;
//             return result || tooShort;
//           });
//         }
//         return false;

//       });
//       return nonSuspiciousFields.length > 0;
//     });

//     const pruned = _.map(nonSuspiciousAbstracts, dm => {
//       const definedFields = dm.fields.filter(f => f.value!==undefined);
//       const justAbstract = definedFields.map(f => f.value);
//       return {
//         id: dm.id,
//         url: dm.url,
//         fields: [{ kind: 'abstract', value: justAbstract}]
//       }
//     });

//     console.log(`# of nonSuspiciousAbstracts: ${nonSuspiciousAbstracts.length}`);

//     // const withAbstractsAsJson = JSON.stringify(pruned);
//     // fs.writeFileSync('withAbstracts.json', withAbstractsAsJson);

//     // const noAbstractsJson = JSON.stringify(noAbstracts);
//     // fs.writeFileSync('withoutAbstracts.json', noAbstractsJson);

//     const noAbstractsNoErrors = noAbstracts.filter(dm => dm.error===undefined)
//     const withErrors = noAbstracts.filter(dm => dm.error!==undefined)
//     const noAbstractNoErrorCount = noAbstractsNoErrors.length;
//     const allErrors = withErrors.map(dm => dm.error? dm.error : 'ok');
//     const grouped = _.groupBy(allErrors);
//     const errorCounts = _.mapValues(grouped, v => v.length);


//     const domainsWoAbs = noAbstractsNoErrors.map((dm: DocumentMeta) => {
//       let url = dm.url;

//       if (url.includes('//')) {
//         const urlDomainAndPath = url.split('//')[1];
//         const urlDomain = urlDomainAndPath.split('/')[0];
//         return urlDomain;
//       };
//       return url;
//     });



//     const uniqDomains = _.uniq(domainsWoAbs);


//     const examples = _.map(uniqDomains, (domain) => {
//       const domainFields = noAbstractsNoErrors
//         .filter(dm => dm.url.includes(domain));

//       const len = domainFields.length;
//       const urls = domainFields
//         .map(f => {
//           const i = f.path.indexOf('dblp.org/');
//           return {
//             path: f.path.slice(i, f.path.length),
//             url: f.url
//           }
//         });

//       return {
//         domain, len, urls
//       };
//     })

//     prettyPrint({
//       abstractCount:  pruned.length,
//       noAbstractCount: noAbstracts.length,
//       noAbstractNoErrorCount,
//       uniqDomains,
//       // examples,
//       errorCounts
//     });

//     const doiUrls = examples.filter(e => e.domain.includes('doi.org'));

//     _.each(doiUrls, d => {
//       console.log(`domain> ${d.domain} len = ${d.len}`);
//       _.each(d.urls, u => {
//         console.log(`url> ${u.url}`);
//         console.log(`pth> ${u.path}`);
//       });
//     });


//     // _.each(noAbstractsNoErrors, dm => {
//     //   const p = dm.path;
//     //   const i = p.indexOf('dld.d');
//     //   const subp = p.slice(i, p.length);
//     //   console.log(subp);
//     //   console.log(`url> ${dm.url}`);
//     // });

//   });

// }





// function makePath(rootDir: string, hashId: string, treePath: string[]): string|undefined {
//   const basepathArr = _.concat(treePath, [hashId]);
//   const basepath = path.join(rootDir, ...basepathArr);
//   // const filepath = path.join(basepath, 'download.html');
//   const exists = fs.existsSync(basepath);
//   return exists? basepath : undefined;
// }



