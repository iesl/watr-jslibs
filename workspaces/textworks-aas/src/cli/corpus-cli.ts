import _ from "lodash";

import path from "path";
import yargs from "yargs";
import { arglib } from "commons";
import { runAbstractFinderOnCorpus, runAbstractFinderUsingLogStream } from "~/qa-editing/qa-review";
import { cleanAbstracts } from '~/qa-editing/qa-edits';

const { opt, config } = arglib;

yargs.command(
  "find-abstracts-in-corpus",
  "run the abstract finder over htmls in corpus",
  config(
    opt.cwd,
    opt.existingDir("logpath: directory to put log files"),
    opt.existingDir("corpus-root: root directory for corpus files"),
  ),
  (args: any) => {
    runAbstractFinderOnCorpus(args);
  },
);

yargs.command(
  "find-abstracts-via-logstream",
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
    runAbstractFinderUsingLogStream({ corpusRoot, logpath, phase, prevPhase, filters });
  },
);


yargs.command(
  "clean-abstracts",
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
    cleanAbstracts({ corpusRoot, logpath, inputlog, outputlog, filters });
  },
);
