import yargs from "yargs";

import { prettyPrint } from "commons";
import { arglib } from "commons";
import { normalizeHtmls } from "~/extract/reshape-html";

const { opt, config } = arglib;

import "./spider-cli";
import "./corpus-cli";
import { oneoff } from '~/spider/spidering';

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

yargs.command(
  "oneoff",
  "desc.",
  config(
    opt.cwd,
    opt.existingDir("logpath: directory to put log files"),
    opt.existingFile("input-csv: ..."),
    opt.existingFile("input-json: ..."),
  ),
  (opts: any) => {
    oneoff(opts.inputCsv, opts.inputJson, opts.logpath);
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
