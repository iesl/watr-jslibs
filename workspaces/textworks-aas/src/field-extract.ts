import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';


import { csvToPathTree } from './parse-csv';
import { traverseUrls } from './radix-tree';
import { prettyPrint } from './pretty-print';

interface Field {
  name: string;
  evidence: string;
  value?: string;
}
interface ExtractError {
  msg: string;
}

interface DocumentMeta {
  fields: Field[];
  url: string;
  id: string;
  path: string;
  error?: ExtractError;
}

export function extractAbstract(entryRootDir: string): Field[] | ExtractError {
  const htmlFile = path.join(entryRootDir, 'download.html');

  const fileContent = readFile(htmlFile);
  if (!fileContent) {
    return { msg: 'file could not be read' };
  }

  if (fileContent.length === 0) {
    return {msg: 'file is empty' };
  }

  const ls = fileContent.split('\n');
  const fileLines = _(ls)
    .map(l => l.trim())
    .filter(l => l.length>0)
    .value();

  const fields = [
    findAbstractV1(fileLines),
    findAbstractV2(fileLines),
    findAbstractV3(fileLines),
    findAbstractV4(fileLines),
  ];

  return fields.filter(f => f.value);
}

/**
 *  Traverse the spidered html files and try to extract fields (abstract)
 *  Write the extracted fields to a json file
 */
export function extractAbstractFromHtml(csvfile: string, outdir: string) {
  const workingDir = outdir;

  const documentMetas: DocumentMeta[] = [];
  // let docsFound = 0;

  csvToPathTree(csvfile).then((treeObj: any) => {
    traverseUrls(treeObj, (url: string, hashId: string, treePath: string[]) => {

      const meta: DocumentMeta = {
        fields: [],
        id: hashId,
        url,
        path: '',
        error: undefined
      };

      const basepath = makePath(workingDir, hashId, treePath);
      if (!basepath) {
        meta.error = { msg: `basepath doesn't exist: ${basepath}`};
      } else {
        meta.path = basepath;
        const absts = extractAbstract(basepath);
        if ('msg' in absts) {
          meta.error = absts;
        } else {
          meta.fields = absts;
        }
      }

      documentMetas.push(meta);
    });
  }).then(() => {

    const noAbstracts = documentMetas.filter(dm => {
      const withAbstracts = dm.fields.filter(f => f.value !== undefined);
      return withAbstracts.length===0;
    });

    const withAbstracts = documentMetas.filter(dm => {
      return _.some(dm.fields, f => f.value!==undefined);
    });

    const nonSuspiciousAbstracts = withAbstracts.filter(dm => {
      const nonSuspiciousFields = dm.fields.filter(f => {
        const v = f.value;
        if (v) {
          return !_.some(suspiciousAbstractRegexes, re => {
            const result = re.test(v);
            const tooShort = v.length <= 80;
            return result || tooShort;
          });
        }
        return false;

      });
      return nonSuspiciousFields.length > 0;
    });

    const pruned = _.map(nonSuspiciousAbstracts, dm => {
      const definedFields = dm.fields.filter(f => f.value!==undefined);
      const justAbstract = definedFields.map(f => f.value);
      return {
        id: dm.id,
        url: dm.url,
        fields: [{ kind: 'abstract', value: justAbstract}]
      }
    });

    console.log(`# of nonSuspiciousAbstracts: ${nonSuspiciousAbstracts.length}`);

    // const withAbstractsAsJson = JSON.stringify(pruned);
    // fs.writeFileSync('withAbstracts.json', withAbstractsAsJson);

    // const noAbstractsJson = JSON.stringify(noAbstracts);
    // fs.writeFileSync('withoutAbstracts.json', noAbstractsJson);

    const noAbstractsNoErrors = noAbstracts.filter(dm => dm.error===undefined)
    const withErrors = noAbstracts.filter(dm => dm.error!==undefined)
    const noAbstractNoErrorCount = noAbstractsNoErrors.length;
    const allErrors = withErrors.map(dm => dm.error? dm.error : 'ok');
    const grouped = _.groupBy(allErrors);
    const errorCounts = _.mapValues(grouped, v => v.length);


    const domainsWoAbs = noAbstractsNoErrors.map((dm: DocumentMeta) => {
      let url = dm.url;

      if (url.includes('//')) {
        const urlDomainAndPath = url.split('//')[1];
        const urlDomain = urlDomainAndPath.split('/')[0];
        return urlDomain;
      };
      return url;
    });



    const uniqDomains = _.uniq(domainsWoAbs);


    const examples = _.map(uniqDomains, (domain) => {
      const domainFields = noAbstractsNoErrors
        .filter(dm => dm.url.includes(domain));

      const len = domainFields.length;
      const urls = domainFields
        .map(f => {
          const i = f.path.indexOf('dblp.org/');
          return {
            path: f.path.slice(i, f.path.length),
            url: f.url
          }
        });

      return {
        domain, len, urls
      };
    })

    prettyPrint({
      abstractCount:  pruned.length,
      noAbstractCount: noAbstracts.length,
      noAbstractNoErrorCount,
      uniqDomains,
      // examples,
      errorCounts
    });

    const doiUrls = examples.filter(e => e.domain.includes('doi.org'));

    _.each(doiUrls, d => {
      console.log(`domain> ${d.domain} len = ${d.len}`);
      _.each(d.urls, u => {
        console.log(`url> ${u.url}`);
        console.log(`pth> ${u.path}`);
      });
    });


    // _.each(noAbstractsNoErrors, dm => {
    //   const p = dm.path;
    //   const i = p.indexOf('dld.d');
    //   const subp = p.slice(i, p.length);
    //   console.log(subp);
    //   console.log(`url> ${dm.url}`);
    // });

  });

}




function findAbstractV1(fileLines: string[]): Field {
  let field: Field = {
    name: 'abstract',
    evidence: 'line.match(id="abstract")',
  };
  fileLines.findIndex((line, lineNum) => {
    if (line.match('id="abstract"')) {
      const abst = fileLines[lineNum+1];
      field.value = abst;
    }
  });
  // console.log('f>', field);

  return field;
}

function findAbstractV2(fileLines: string[]): Field {
  let field: Field = {
    name: 'abstract',
    evidence: 'line.match(global.document.metadata)',
  };
  fileLines.findIndex((line) => {
    if (line.match('global.document.metadata')) {
      const jsonStart = line.indexOf('{');
      const jsonEnd = line.lastIndexOf('}');
      const lineJson = line.slice(jsonStart, jsonEnd+1);
      try {
        const metadataObj = JSON.parse(lineJson);
        const abst = metadataObj['abstract'];
        field.value = abst;
        // prettyPrint({ abst, metadataObj });
      } catch (e) {
        prettyPrint({ e, lineJson });
      }
    }
  });
  return field;
}

function findAbstractV3(fileLines: string[]): Field {
  let field: Field = {
    name: 'abstract',
    evidence: 'line.match(global.document.metadata)',
  };
  fileLines.findIndex((line, lineNum) => {
    if (line.includes('col-md-12') && !line.includes('signin')) {
      const l1 = fileLines[lineNum+1];
      const l2 = fileLines[lineNum+2];
      const maybeAbstract = !l1.includes('class="keywords"');

      if (maybeAbstract) {
        field.value = l2;
      }
    }
  });
  return field;
}

// TODO detect empty and badly-formed files
function findAbstractV4(fileLines: string[]): Field {
  let field: Field = {
    name: 'abstract',
    evidence: '//doi.org: div[:class="abstract"]/h3+p',
  };
  fileLines.findIndex((line, lineNum) => {
    const l1 = fileLines[lineNum+1];
    const l2 = fileLines[lineNum+2];
    if (line.match('"item abstract"') && l1.match('Abstract') && l2.match('<p>')) {
      const begin = l2.indexOf('<p>')
      const end = l2.lastIndexOf('</p>')
      const abst = line.slice(begin, end);
      field.value = abst;
    }
  });
  //<div class="item abstract">
  //  <h3 class="label">Abstract</h3>
  //  <p>This paper proposes a no... </p>
  //</div>
  return field;
}

function makePath(rootDir: string, hashId: string, treePath: string[]): string|undefined {
  const basepathArr = _.concat(treePath, [hashId]);
  const basepath = path.join(rootDir, ...basepathArr);
  // const filepath = path.join(basepath, 'download.html');
  const exists = fs.existsSync(basepath);
  return exists? basepath : undefined;
}

function readFile(leading: string, ...more: string[]): string|undefined {
  const filepath = path.join(leading, ...more);
  const exists = fs.existsSync(filepath);
  if (exists) {
    const buf = fs.readFileSync(filepath);
    const fileContent = buf.toString().trim();
    return fileContent;
  }
  return undefined;
}


const suspiciousAbstractRegexes = [
  '^</div>',
  '^<div class="item abstract">',
  '^<p><i>',
  '^limited training samples and prevent',
  '^each argume',
  '^However, m',
  '^Frontmatter for Workshop Proceedings.',
  '^This is the preface',
  '^Preface to the 2018 KDD Workshop on Cau',
  '^Presents the welcome message from the conference proceedings.',
  '^The conference offers a note of thanks and lists its reviewers.',
  '^Provides a listing of current committee members and society officers.',
  '^This correspondence calls attenti',
  '^Prospective authors are requested to submit new, unpublished manuscripts',
  '^The seven papers in this special section',
].map(s => new RegExp(s));
