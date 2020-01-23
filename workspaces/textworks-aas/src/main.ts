//
import _ from 'lodash';

import { fileOrDie, dirOrDie } from './utils';
import { csvToPathTree  } from './parse-csv';
import { printSummary } from './radix-tree';

import cmds from 'caporal';
import { runGetHtml, spiderAll, fetchViaFirefox, interactiveSpider, interactiveSpiderViaFF } from './spidering';
import { runInkDemo } from './ink-sample';
import { extractAbstractFromHtml } from './field-extract';
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
  .command('spider-interactive', 'user-driven file download')
  .argument('<file>', 'csv file name')
  .argument('<outputdir>', 'basepath to write output files/directories')
  .option('--rootdir', 'root path')
  .action((args: any, opts: any, _logger: any) => {
    const f = fileOrDie(args.file, opts.rootdir);
    const d = dirOrDie(args.outputdir, opts.rootdir);
    interactiveSpider(f, d);
  });

program
  .command('spider-ff', 'user-driven file download')
  .argument('<file>', 'json')
  .argument('<outputdir>', 'basepath to write output files/directories')
  .option('--rootdir', 'root path')
  .action((args: any, opts: any, _logger: any) => {
    const f = fileOrDie(args.file, opts.rootdir);
    const d = dirOrDie(args.outputdir, opts.rootdir);
    interactiveSpiderViaFF(f, d);
  });

program
  .command('spider', 'fetch all htmls')
  .argument('<file>', 'csv file name')
  .argument('<outputdir>', 'basepath to write output files/directories')
  .option('--rootdir', 'root path')
  .action((args: any, opts: any, _logger: any) => {
    const f = fileOrDie(args.file, opts.rootdir);
    const d = dirOrDie(args.outputdir, opts.rootdir);
    spiderAll(f, d);
  });

program
  .command('extract-html-abstract', 'find abstracts in html')
  .argument('<file>', 'csv file name')
  .argument('<outputdir>', 'html download basepath')
  .option('--rootdir', 'root path')
  .action((args: any, opts: any, _logger: any) => {
    const f = fileOrDie(args.file, opts.rootdir);
    const d = dirOrDie(args.outputdir, opts.rootdir);
    extractAbstractFromHtml(f, d);
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

program
  .command('ink', 'testing ink ui builder')
  .action((_args: any, _opts: any, _logger: any) => {
    runInkDemo();
  });



program.parse(process.argv);
