import _ from "lodash";

import path from "path";
import yargs, {Argv} from "yargs";
import { arglib } from "commons";
import {prettyPrint} from "commons";
import {reviewCorpus} from "~/qa-editing/qa-review";
import { collectAbstractExtractionStats } from '~/qa-editing/qa-stats';
import { reviewAbstractQuality } from '~/qa-editing/qa-edits';

const { opt, config, yall } = arglib;

yargs.command(
  "collect-stats",
  "collect some coverage stats regarding abstract extraction",
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
    opt.ion("phase: name of review phase (defaults to 'init')", {
      requiresArg: true,
      default: "init",
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
    const phase = args.phase;
    const prevPhase = args.prevPhase;
    const corpusRoot = path.resolve(args.cwd, args.corpusRoot);
    const logpath = path.resolve(args.cwd, args.logpath);
    const filters = args.regex;
    reviewCorpus({corpusRoot, logpath, phase, prevPhase, filters});
  },
);

yargs.command(
  "qa-interactive",
  "",
  config(
    opt.cwd,
    opt.dir("logpath: directory in which to find/put log files"),
    opt.dir("corpus-root: root directory for corpus files"),
    opt.ion("inputlog: log from which to stream input entries", {
      requiresArg: true
    }),
    opt.ion("outputlog: output logfile name", {
      requiresArg: true
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
    const inputlog = path.resolve(logpath, args.inputlog);
    const outputlog = path.resolve(logpath, args.outputlog);
    const filters = args.regex;
    reviewAbstractQuality({ corpusRoot, logpath, inputlog, outputlog, filters });
  },
);
