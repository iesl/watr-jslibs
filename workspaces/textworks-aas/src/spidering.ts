
import prompts from 'prompts';
import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';


import { csvToPathTree } from './parse-csv';
import { traverseUrls } from './radix-tree';
import { getHtml } from './get-urls';


type CBFunc = () => Promise<void>;

export function initPaths(csvfile: string, outdir: string) {
  let fns: CBFunc[] = []

  csvToPathTree(csvfile).then((treeObj: any) => {

    traverseUrls(treeObj, (url: string, hashId: string, treePath: string[]) => {
      const ask = askUser(url, hashId, treePath, outdir);
      fns = _.concat(fns, ask);
    });
  }).then(async () => {
    const chain = _.chain(fns).reduce(async (acc, action) => {
      return acc.then(action)
        .catch(err => {
          console.log("error: ", err);
        }) ;
    }, Promise.resolve());

    return chain.value()
      .catch((err) => {
        console.log("error: ", err);
      });
  }).catch(err => {
    console.log("error: ", err);
  });

  process.on('exit' , () => {
    console.log( '>>> exit' ) ;
  }) ;

  process.once( 'beforeExit' , () => {
    console.log( '>>> beforeExit' ) ;
  }) ;
}


export async function downloadAll(csvfile: string, outdir: string) {
  const workingDir = path.resolve(outdir);
  const pauseLength = 4 * 1000;

  let fns: CBFunc[] = []

  csvToPathTree(csvfile).then((treeObj: any) => {
    traverseUrls(treeObj, (url: string, hashId: string, treePath: string[]) => {
      if (url === 'no_url') {
        console.log(`no url for ${_.join(treePath, ' / ')}`);
      } else {
        const basepathArr = _.concat(treePath, [hashId]);
        const basepath = path.join(workingDir, ...basepathArr);
        const filepath = path.join(basepath, 'download.html');
        const htmlExists = fs.existsSync(filepath);

        if (!htmlExists) {
          console.log(`queuing ${url}`);
          const fn = async () => {
            console.log(`downloading ${url} to ${basepath}`);
            fs.mkdirsSync(basepath);
            await getHtml(url, filepath);
            return new Promise<void>((resolve) => {
              setTimeout(() => {
                resolve();
              }, pauseLength);
            })
          };
          fns = _.concat(fns, fn);
        } else {
          console.log(`already have ${url} in ${basepath}`);
        }
      }
    });
    return Promise.resolve();
  }).then(async () => {
    const torun = fns.slice(0, 1000);
    console.log(`running ${fns.length} callbacks`);

    const chain = _.chain(torun).reduce(async (acc, action) => {
      return acc.then(action)
        .catch(err => {
          console.log("error0: ", err);
        }) ;
    }, Promise.resolve());

    return chain.value()
      .catch((err) => {
        console.log("error1: ", err);
      });
  });


}


function askUser(url: string, hashId: string, treePath: string[], outdir: string) {
  return async () => {
    const workingDir = path.resolve(outdir);
    const pathstr = _.join(treePath, '/');
    console.log(`working dir: ${workingDir}`);
    console.log(`${pathstr}`);
    console.log(`   url: ${url}`)
    console.log(`   hid: ${hashId}`)
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'What do?',
      choices: [
        { title: 'Download', value: 'download' },
        { title: 'Skip', value: 'skip' },
        { title: 'Quit', value: 'quit' }
      ],
      initial: 0
    })
    switch (response.value) {
      case 'download':
        const basepathArr = _.concat(treePath, [hashId]);
        const basepath = path.join(workingDir, ...basepathArr);
        const filepath = path.join(basepath, 'download.html');
        const exists = fs.existsSync(filepath);
        if (exists) {
          fs.removeSync(filepath);
        }
        console.log(`downloading ${url}`)
        console.log(`    to ${basepath}`)
        fs.mkdirsSync(basepath);
        await getHtml(url, filepath);
        break
      case 'skip':
        break
      case 'quit':
        process.exit();
        break
    }
  }
}

export function runGetHtml(url: string, output: string) {
  console.log(`writing ${url} to ${output}`)
  getHtml(url, output).then(() => {
    const tmp = fs.readFileSync(output);
    const text = tmp.toString();
    console.log(text);
  })
}


import { prettyPrint } from './pretty-print';


interface Field {
  // url: string;
  // path: string;
  name: string;
  evidence: string;
  value?: string;
}

interface DocumentMeta {
  fields: Field[];
  url: string;
  path: string;
  error?: string;
}


export function examineHtml(csvfile: string, outdir: string) {
  const workingDir = path.resolve(outdir);

  // const allFields: Field[] = [];
  const documentMetas: DocumentMeta[] = [];
  let docsFound = 0;

  csvToPathTree(csvfile).then((treeObj: any) => {
    traverseUrls(treeObj, (url: string, hashId: string, treePath: string[]) => {

      const meta: DocumentMeta = {
        fields: [],
        url,
        path: '',
        error: undefined
      };

      const basepathArr = _.concat(treePath, [hashId]);
      const basepath = path.join(workingDir, ...basepathArr);
      const filepath = path.join(basepath, 'download.html');
      const exists = fs.existsSync(filepath);
      if (exists) {
        docsFound += 1;
        meta.path = filepath;

        const buf = fs.readFileSync(filepath);
        const fileContent = buf.toString().trim();

        if (fileContent.length === 0) {
          meta.error = 'file is empty';
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

        meta.fields = fields;
        documentMetas.push(meta);
      }
    });
  }).then(() => {

    const noAbstracts = documentMetas.filter(dm => {
      const withAbstracts = dm.fields.filter(f => f.value !== undefined);
      return withAbstracts.length===0;
    });

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
        .filter(f => f.url.includes(domain));

      const len = domainFields.length;
      const urls = domainFields
        .slice(0, 2)
        .map(f => f.path);

      return {
        len, urls
      };
    })

    prettyPrint({
      docsFound,
      abstractCount: docsFound - noAbstracts.length,
      noAbstractCount: noAbstracts.length,
      noAbstractNoErrorCount,
      uniqDomains,
      examples,
      errorCounts
    });

    _.each(noAbstractsNoErrors, dm => {
      const p = dm.path;
      const i = p.indexOf('dld.d');
      const subp = p.slice(i, p.length);
      console.log(subp);
      console.log(`url> ${dm.url}`);
    });

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

import { Builder, By, WebDriver } from 'selenium-webdriver';


export async function initBrowser() {
  return new Builder().forBrowser('firefox').build();
}

export async function getPageHtml(driver: WebDriver, url: string) {
  await driver.get(url)
  return await driver.getPageSource();
}

// function promptToFetch(url: string, hashId: string, treePath: string[], outdir: string) {
async function promptToFetch(url: string, driver: WebDriver): Promise<string|undefined> {
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: `view: ${url}`,
    choices: [
      { title: 'Download', value: 'download' },
      { title: 'Skip', value: 'skip' },
      { title: 'Quit', value: 'quit' }
    ],
    initial: 0
  })
  switch (response.value) {
    case 'download':
      return getPageHtml(driver, url);
    case 'skip':
      break;
    case 'quit':
      process.exit();
  }
  return;
}

export async function fetchViaFirefox(urlFile: string, _outdir: string) {
  // const workingDir = path.resolve(outdir);
  // const urlList = path.join(workingDir, urlFile);
  const exists = fs.existsSync(urlFile);
  if (! exists) {
    console.log(`Exiting: file ${urlFile} doesn't exist.`)
    return Promise.resolve();
  }

  const urlBuf = fs.readFileSync(urlFile);
  const urls = urlBuf.toString().split('\n').map(l => l.trim()).filter(l => l.length>0);


  const driver = await initBrowser();

  const chain = _.chain(urls).reduce(async (pacc, url) => {
    return pacc.then(async () => {
      const html = await promptToFetch(url, driver)
      console.log(html);
    }).catch(err => {
      console.log("error: ", err);
    }) ;
  }, Promise.resolve());

  await chain.value();
}

export async function controlFirefox() {

  const driver = await new Builder().forBrowser('firefox').build();
  //your code inside this block
  await driver.get('https://selenium.dev')
  const htmlTag = await driver.findElement(By.tagName('html'))
  const htmlText = await htmlTag.getText();
  const htmlInner = await htmlTag.getAttribute('innerHTML');
  const pageSource = await driver.getPageSource();

  prettyPrint({ htmlText, htmlInner, pageSource });

}
