//
import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';

import { getHtml } from './get-urls';
import { fileOrDie, dirOrDie } from './utils';
import { csvToPathTree, printSummary, traverseObject } from './parse-csv';

import cmds from 'caporal';
const program = cmds;

program
  .command('load', 'load csv and report some info')
  .argument('<file>', 'csv file name')
  .action((args: any, _opts: any, _logger: any) => {
    loadcsv(args.file)
  });

program
  .command('init-paths', 'create dir structure for html/pdf downloads')
  .argument('<file>', 'csv file name')
  .argument('<outputdir>', 'basepath to write output files/directories')
  .option('--rootdir', 'root path')
  .action((args: any, opts: any, _logger: any) => {
    const f = fileOrDie(args.file, opts.rootdir);
    const d=  dirOrDie(args.outputdir, opts.rootdir);
    initPaths(f, d);
  });

program
  .command('get', 'get html')
  .argument('<url>', 'url to fetch')
  .argument('<output>', 'output file')
  .action((args: any, _opts: any, _logger: any) => {
    runGetHtml(args.url, args.output);
  });


function runGetHtml(url: string, output: string) {
  console.log(`writing ${url} to ${output}`)
  getHtml(url, output).then(() => {
    const tmp = fs.readFileSync(output);
    const text = tmp.toString();
    console.log(text);
  })
}

function loadcsv(csvfile: string) {
  csvToPathTree(csvfile).then((treeObj: any) => {
    printSummary(treeObj);
  });
}

const traverseUrls = (accObj: any, fn: (url: string, hid: string, treePath: string[]) => void) => {
  console.log('traverseUrls; ');

  traverseObject((currObj, currPath) => {

    if (_.isArray(currObj)) {
      _.each(currObj, ([url, hashId]) => {
        fn(url, hashId, currPath);
      });
    }
  }, accObj);
}

import prompts from 'prompts';
import { prettyPrint } from './pretty-print';

type CBFunc = () => Promise<void>;

function initPaths(csvfile: string, outdir: string) {
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


function askUser(url: string, hashId: string, treePath: string[], outdir: string) {
  return async () => {
    const pathstr = _.join(treePath, '/');
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
        const basepath = path.join(...basepathArr);
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

program.parse(process.argv);


// *** WGET (this one works)
// ~/p/t/r/watr-jslibs git:master ❯❯❯ wget -v -d https://aaai.org/ocs/index.php/WS/AAAIW18/paper/viewPaper/16162 -O 1612-v2.html                                                                                                                                                          ✱ ◼
// Setting --output-document (outputdocument) to 1612-v2.html
// DEBUG output created by Wget 1.17.1 on linux-gnu.

// Reading HSTS entries from /home/saunders/.wget-hsts
// URI encoding = ‘UTF-8’
// --2020-01-18 11:47:46--  https://aaai.org/ocs/index.php/WS/AAAIW18/paper/viewPaper/16162
// Resolving aaai.org (aaai.org)... 144.208.67.177
// Caching aaai.org => 144.208.67.177
// Connecting to aaai.org (aaai.org)|144.208.67.177|:443... connected.
// Created socket 4.
// Releasing 0x00007f674719c160 (new refcount 1).
// Initiating SSL handshake.
// Handshake successful; connected socket 4 to SSL handle 0x00007f674719cf80
// certificate:
//   subject: CN=aaai.org,OU=COMODO SSL,OU=Domain Control Validated
//   issuer:  CN=Sectigo RSA Domain Validation Secure Server CA,O=Sectigo Limited,L=Salford,ST=Greater Manchester,C=GB
// X509 certificate successfully verified and matches host aaai.org

// ---request begin---
// GET /ocs/index.php/WS/AAAIW18/paper/viewPaper/16162 HTTP/1.1
// User-Agent: Wget/1.17.1 (linux-gnu)
// Accept: */*
// Accept-Encoding: identity
// Host: aaai.org
// Connection: Keep-Alive

// ---request end---
// HTTP request sent, awaiting response...
// ---response begin---
// HTTP/1.1 200 OK
// Date: Sat, 18 Jan 2020 16:48:24 GMT
// Server: Apache
// Cache-Control: no-store
// Set-Cookie: OCSSID=cfsrpn16gbpme343l58fiiu1d4; path=/ocs/
// Keep-Alive: timeout=5, max=100
// Connection: Keep-Alive
// Transfer-Encoding: chunked
// Content-Type: text/html; charset=utf-8

// ---response end---
// 200 OK

// Stored cookie aaai.org -1 (ANY) /ocs/ <session> <insecure> [expiry none] OCSSID cfsrpn16gbpme343l58fiiu1d4
// Registered socket 4 for persistent reuse.
// URI content encoding = ‘utf-8’
// Length: unspecified [text/html]
// Saving to: ‘1612-v2.html’

// 1612-v2.html                                                               [ <=>                                                                                                                                                                        ]  12.20K  --.-KB/s    in 0.1s

// 2020-01-18 11:47:46 (88.3 KB/s) - ‘1612-v2.html’ saved [12494]

// Saving HSTS entries to /home/saunders/.wget-hsts
// ~/p/t/r/watr-jslibs git:master ❯❯❯ wget -v -d https://aaai.org/ocs/index.php/WS/AAAIW18/paper/viewPaper/16162 -O 1612-v2.html                                                                                                                                                          ✱ ◼
// Setting --output-document (outputdocument) to 1612-v2.html
// DEBUG output created by Wget 1.17.1 on linux-gnu.

// Reading HSTS entries from /home/saunders/.wget-hsts
// URI encoding = ‘UTF-8’
// --2020-01-18 11:47:46--  https://aaai.org/ocs/index.php/WS/AAAIW18/paper/viewPaper/16162
// Resolving aaai.org (aaai.org)... 144.208.67.177
// Caching aaai.org => 144.208.67.177
// Connecting to aaai.org (aaai.org)|144.208.67.177|:443... connected.
// Created socket 4.
// Releasing 0x00007f674719c160 (new refcount 1).
// Initiating SSL handshake.
// Handshake successful; connected socket 4 to SSL handle 0x00007f674719cf80
// certificate:
//   subject: CN=aaai.org,OU=COMODO SSL,OU=Domain Control Validated
//   issuer:  CN=Sectigo RSA Domain Validation Secure Server CA,O=Sectigo Limited,L=Salford,ST=Greater Manchester,C=GB
// X509 certificate successfully verified and matches host aaai.org

// ---request begin---
// GET /ocs/index.php/WS/AAAIW18/paper/viewPaper/16162 HTTP/1.1
// User-Agent: Wget/1.17.1 (linux-gnu)
// Accept: */*
// Accept-Encoding: identity
// Host: aaai.org
// Connection: Keep-Alive

// ---request end---
// HTTP request sent, awaiting response...
// ---response begin---
// HTTP/1.1 200 OK
// Date: Sat, 18 Jan 2020 16:48:24 GMT
// Server: Apache
// Cache-Control: no-store
// Set-Cookie: OCSSID=cfsrpn16gbpme343l58fiiu1d4; path=/ocs/
// Keep-Alive: timeout=5, max=100
// Connection: Keep-Alive
// Transfer-Encoding: chunked
// Content-Type: text/html; charset=utf-8

// ---response end---
// 200 OK

// Stored cookie aaai.org -1 (ANY) /ocs/ <session> <insecure> [expiry none] OCSSID cfsrpn16gbpme343l58fiiu1d4
// Registered socket 4 for persistent reuse.
// URI content encoding = ‘utf-8’
// Length: unspecified [text/html]
// Saving to: ‘1612-v2.html’

// 1612-v2.html                                                               [ <=>                                                                                                                                                                        ]  12.20K  --.-KB/s    in 0.1s

// 2020-01-18 11:47:46 (88.3 KB/s) - ‘1612-v2.html’ saved [12494]

// Saving HSTS entries to /home/saunders/.wget-hsts


// ~/p/t/r/watr-jslibs git:master ❯❯❯ curl -L -ivs https://aaai.org/ocs/index.php/WS/AAAIW18/paper/viewPaper/16162                                                                                                                                                                        ✱ ◼
// *   Trying 144.208.67.177...
// * Connected to aaai.org (144.208.67.177) port 443 (#0)
// * found 148 certificates in /etc/ssl/certs/ca-certificates.crt
// * found 604 certificates in /etc/ssl/certs
// * ALPN, offering http/1.1
// * SSL connection using TLS1.2 / ECDHE_RSA_AES_128_GCM_SHA256
// *        server certificate verification OK
// *        server certificate status verification SKIPPED
// *        common name: aaai.org (matched)
// *        server certificate expiration date OK
// *        server certificate activation date OK
// *        certificate public key: RSA
// *        certificate version: #3
// *        subject: OU=Domain Control Validated,OU=COMODO SSL,CN=aaai.org
// *        start date: Fri, 05 Apr 2019 00:00:00 GMT
// *        expire date: Sat, 18 Apr 2020 23:59:59 GMT
// *        issuer: C=GB,ST=Greater Manchester,L=Salford,O=Sectigo Limited,CN=Sectigo RSA Domain Validation Secure Server CA
// *        compression: NULL
// * ALPN, server accepted to use http/1.1

// > GET /ocs/index.php/WS/AAAIW18/paper/viewPaper/16162 HTTP/1.1
// > Host: aaai.org
// > User-Agent: curl/7.47.0
// > Accept: */*
// >


// < HTTP/1.1 406 Not Acceptable
// HTTP/1.1 406 Not Acceptable
// < Date: Sat, 18 Jan 2020 16:45:21 GMT
// Date: Sat, 18 Jan 2020 16:45:21 GMT
// < Server: Apache
// Server: Apache
// < Content-Length: 373
// Content-Length: 373
// < Content-Type: text/html; charset=iso-8859-1
// Content-Type: text/html; charset=iso-8859-1
