//
import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';

import { getHtml } from './get-urls';
import { fileOrDie, dirOrDie } from './utils';
import { csvToPathTree  } from './parse-csv';
import { printSummary } from './radix-tree';

import cmds from 'caporal';
import { initPaths, runGetHtml, examineHtml, downloadAll, fetchViaFirefox } from './spidering';
const program = cmds;

/**
 * Roadmap:
 *   - Download initial *.html from given urls, putting them in appropriate directory structure
 *   - Examine outgoing href/links per html, trying to identify likely pdf file link
 *      - in html:
 *        -urls
 *          - head/meta[name] startwith 'citation_'
 *          - head/meta[name] === 'citation_url' => url => proceedings pdf?
 *          - head/meta[name] === 'citation_pdf_url' => url => proceedings pdf?
 *          - head/meta[name] === 'citation_abstract_url' => abstract
 *          - *[href] ~= /https?/ && /.pdf$/
 *        - Abs/Auth/Title
 *          - div[:class=row]/div[:class=col-md-12](0) === abstract
 *          - div[:id|:class=abstract] === abstract
 *          - div[:class=row]/div[:class=col-md-12](1) === keywords
 *
 *   - Examine htmls for embedded abstract/title/author
 *   - For htmls w/o embedded a/t/a:
 *      - Look for pdf and/or redirects to other htmls
 *      - do a spidering of depth 1 or 2 from initial html
 *
 */

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
    const d = dirOrDie(args.outputdir, opts.rootdir);
    initPaths(f, d);
  });

program
  .command('spider', 'fetch all htmls')
  .argument('<file>', 'csv file name')
  .argument('<outputdir>', 'basepath to write output files/directories')
  .option('--rootdir', 'root path')
  .action((args: any, opts: any, _logger: any) => {
    const f = fileOrDie(args.file, opts.rootdir);
    const d = dirOrDie(args.outputdir, opts.rootdir);
    downloadAll(f, d);
  });

program
  .command('examine-htmls', 'look at html')
  .argument('<file>', 'csv file name')
  .argument('<outputdir>', 'html download basepath')
  .option('--rootdir', 'root path')
  .action((args: any, opts: any, _logger: any) => {
    const f = fileOrDie(args.file, opts.rootdir);
    const d = dirOrDie(args.outputdir, opts.rootdir);
    examineHtml(f, d);
  });

program
  .command('fetch-html', 'get html')
  .argument('<url>', 'url to fetch')
  .argument('<output>', 'output file')
  .action((args: any, _opts: any, _logger: any) => {
    runGetHtml(args.url, args.output);
  });

program
  .command('fetch-ff', 'control firefox')
  .argument('<urls>', 'url to fetch')
  .option('--rootdir', 'root path')
  .action((args: any, opts: any, _logger: any) => {
    const urlList = fileOrDie(args.urls, opts.rootdir);
    fetchViaFirefox(urlList, opts.rootdir);
  });


function loadcsv(csvfile: string) {
  csvToPathTree(csvfile).then((treeObj: any) => {
    printSummary(treeObj);
  });
}


program.parse(process.argv);
