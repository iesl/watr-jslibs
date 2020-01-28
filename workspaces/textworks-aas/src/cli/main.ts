import _ from 'lodash';

import path from 'path';
import { fileOrDie, dirOrDie, fileOrUndef } from './utils';

import cmds from 'caporal';
import { defaultSpideringOptions, createSpider, csvToSpiderRecs } from './spidering';
import { runInkDemo } from './ink-sample';
import { extractAbstractFromHtml } from './field-extract';
import { prettyPrint } from './pretty-print';
import { extractAbstractFromHtmls } from './field-extract-abstract';
import { viewNormalizedHtmls } from './reshape-html';
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
  .command('run-spider', 'configure and run a spider')
  .option('--config <path>', 'optional config file instead of passing args')
  .option('--cwd <path>', 'base path to resolve other paths/files (if they are not absolute)')
  .option('--downloads <path>', 'base path to write downloaded files')
  .option('--input <file>', 'json file with spidering records to process', program.STRING)
  .option('--logpath <path>', 'root dir for log files', program.STRING)
  .option('--interactive', 'prompt user to download')
  .option('--useBrowser', 'run a selenium-controlled browser to fetch urls')
  .action((_args: any, opts: any, _logger: any) => {

    const spiderOpts = defaultSpideringOptions;
    const cwd = dirOrDie(opts.cwd);

    // const configFile = fileOrUndef(opts.config, cwd);
    // if (configFile) {}

    const log = opts.logpath || 'spidering-log.json';
    const loggingPath = path.join(cwd, log);

    spiderOpts.spiderInputFile = fileOrDie(opts.input, cwd);
    spiderOpts.interactive = opts.interactive;
    spiderOpts.loggingPath = loggingPath;
    spiderOpts.useBrowser = opts.useBrowser;
    spiderOpts.rootDir = cwd;
    spiderOpts.downloadDir = opts.downloads? dirOrDie(opts.downloads, cwd) : cwd;
    createSpider(spiderOpts);
  });

program
  .command('find-abstracts', 'find abstracts in html')
  .option('--cwd <path>', 'base path to resolve other paths/files (if they are not absolute)')
  .option('--corpus-root <path>', 'root download path')
  .action((args: any, opts: any, _logger: any) => {
    prettyPrint({ opts, args });
    const cwd = dirOrDie(opts.cwd);
    const corpusRoot = dirOrDie(path.join(cwd, opts.corpusRoot));
    extractAbstractFromHtmls(corpusRoot);
  });

program
  .command('view-norms', 'view normalized htmls')
  .option('--cwd <path>', 'base path to resolve other paths/files (if they are not absolute)')
  .option('--corpus-root <path>', 'root download path')
  .action((args: any, opts: any, _logger: any) => {
    prettyPrint({ opts, args });
    const cwd = dirOrDie(opts.cwd);
    const corpusRoot = dirOrDie(path.join(cwd, opts.corpusRoot));
    viewNormalizedHtmls(corpusRoot);
  });

program
  .command('csv-to-srecs', 'convert csv to spidering input file format')
  .option('--cwd <path>', 'base path to resolve other paths/files (if they are not absolute)')
  .option('--csv <file>', 'input csf file ', program.STRING)
  .option('--outfile <file>', 'output json file', program.STRING)
  .action((_args: any, opts: any, _logger: any) => {
    const cwd = dirOrDie(opts.cwd);
    const csvfile = path.join(cwd, opts.csv);
    const outfile = path.join(cwd, opts.outfile);

    csvToSpiderRecs(csvfile, outfile);
  });


program
  .command('ink', 'testing ink ui builder')
  .action((_args: any, _opts: any, _logger: any) => {
    runInkDemo();
  });



program.parse(process.argv);
