import _ from "lodash";

import path from "path";
import yargs, {Argv} from "yargs";
import {yall, opt, config} from "./arglib";
import {createCorpusEntryManifests} from "~/corpora/bundler";
import {prettyPrint} from "~/util/pretty-print";
import {reviewCorpus} from "~/qa-editing/qa-review";

yargs.command(
  "collect-stats",
  "collect some coverage stats",
  function config(ya: Argv) {
    yall(ya, [
      opt.setCwd,
      opt.existingFile("csv: csv with noteId, dblpIds, urls"),
      opt.existingDir("corpus-root: root directory for corpus files"),
    ]);
  },

  function exec(args: any) {
    const fromc = path.resolve(args.cwd, args.corpusRoot);
    createCorpusEntryManifests(args.csv, fromc);
  },
);

yargs.command(
  "qa-review",
  "Review and edit corpus spidering, extraction, data cleaning",
  config(
    opt.cwd,
    opt.dir("logpath: directory to put log files"),
    opt.dir("corpus-root: root directory for corpus files"),
    opt.ion("phase: name of review phase (start with 'init')", {
      requiresArg: true,
    }),
    opt.ion("prev-phase: use logs from prev phase to drive review", {
      requiresArg: true,
      implies: ["phase"],
    }),
  ),

  function exec(args: any) {
    const phase = args.phase;
    const prevPhase = args.prevPhase;
    const corpusRoot = path.resolve(args.cwd, args.corpusRoot);
    const logpath = path.resolve(args.cwd, args.logpath);
    prettyPrint({args});
    reviewCorpus({corpusRoot, logpath, phase, prevPhase});
  },
);

yargs
  .demandCommand(1, "You need at least one command before moving on")
  .strict()
  .help()
  .fail(function(msg, err, _yargs) {
    const errmsg = err ? `${err.name}: ${err.message}` : "";
    prettyPrint({msg, errmsg});
    process.exit(1);
  }).argv;
