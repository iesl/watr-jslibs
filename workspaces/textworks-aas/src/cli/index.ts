import yargs from "yargs";

import { prettyPrint } from "commons";
import { arglib } from "commons";
import { normalizeHtmls } from "~/extract/reshape-html";

const { opt, config } = arglib;

import "./corpus-cli";
import { createOrder, pruneCrawledFromCSV } from '~/openreview/workflow';

yargs.command(
  "write-norms",
  "Turn *.html files into a normalized form",
  config(
    opt.cwd,
    opt.existingDir("corpus-root: root directory for corpus files"),
  ),
  (argv: any) => {
    const { corpusRoot } = argv;
    normalizeHtmls(corpusRoot);
  },
);

// yargs.command(
//   "openreview-order",
//   "create an order from a CSV file",
//   config(
//     opt.cwd,
//     opt.existingFile("csv: ..."),
//     opt.existingDir("db-data-path: root path to store sqlite data files"),
//   ),
//   (opts: any) => {
//     createOrder({
//       csvFile: opts.csv,
//       dbDataPath: opts.dbDataPath,
//     });
//   },
// );

yargs.command(
  "openreview-prune-csv",
  "create an order from a CSV file",
  config(
    opt.cwd,
    opt.existingFile("scrapyLog: ..."),
    opt.existingFile("csv: ..."),
  ),
  (opts: any) => {
    const { scrapyLog, csv } = opts;
    Promise.all([
      pruneCrawledFromCSV(scrapyLog, csv)
    ]).then(() => {
      console.log('done');
    })
  },
);



yargs
  .demandCommand(1, "You need at least one command before moving on")
  .strict()
  .help()
  .fail(function(msg, err, _yargs) {
    const errmsg = err ? `${err.name}: ${err.message}` : "";
    prettyPrint({ msg, errmsg });
    process.exit(1);
  }).argv;
