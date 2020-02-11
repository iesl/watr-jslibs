import _ from "lodash";

import path from "path";
import yargs, {Argv} from "yargs";
import {yall, opt, config} from "./arglib";
import {prettyPrint} from "~/util/pretty-print";
import {reviewCorpus, interactiveReviewCorpus} from "~/qa-editing/qa-review";
import { collectAbstractExtractionStats } from '~/qa-editing/qa-stats';

yargs.command(
  "collect-stats",
  "collect some coverage stats",
  function config(ya: Argv) {
    yall(ya, [
      opt.setCwd,
      opt.existingFile("logfile: logfile on which to base the stats"),
      opt.existingDir("corpus-root: root directory for corpus files"),
    ]);
  },

  function exec(args: any) {
    const fromLog = path.resolve(args.cwd, args.logfile);
    collectAbstractExtractionStats(fromLog, [])
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
    reviewCorpus({corpusRoot, logpath, phase, prevPhase});
  },
);

yargs.command(
  "qa-filter",
  "run filtered stream",
  config(
    opt.cwd,
    opt.dir("logpath: directory for log files"),
    opt.dir("corpus-root: root directory for corpus files"),
    opt.ion("phase: name of review phase (e.g., 'init')", {
      requiresArg: true,
      required: true,
    }),
    opt.ion("prev-phase: use logs from prev phase to drive review", {
      requiresArg: true,
      implies: ["phase"],
    }),
    opt.ion("regex: only include matching records", {
      alias: "m",
      requiresArg: true,
      array: true,
      required: false,
    }),
  ),

  function exec(args: any) {
    const corpusRoot = path.resolve(args.cwd, args.corpusRoot);
    const logpath = path.resolve(args.cwd, args.logpath);
    const phase = args.phase;
    const prevPhase = args.prevPhase;
    const filters = args.regex;
    interactiveReviewCorpus({corpusRoot, logpath, phase, prevPhase, filters});
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
