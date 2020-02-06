import _ from "lodash";

import path from "path";
import yargs, {Argv} from "yargs";
import {yall, opt} from "./arglib";
import {corpusStats} from "~/corpora/corpus-browser";
import {createCorpusEntryManifests} from "~/corpora/bundler";
import {prettyPrint} from "~/util/pretty-print";

yargs.command(
  "stats",
  "collect some coverage stats",
  function config(ya: Argv) {
    yall(ya, [
      opt.config,
      opt.setCwd,
      opt.existingDir("corpus-root: root directory for corpus files"),
    ]);
  },
  function exec(args: any) {
    corpusStats(args.corpusRoot);
  },
);

yargs.command(
  "create-manifests",
  "",
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

yargs
  .demandCommand(1, "You need at least one command before moving on")
  .strict()
  .help()
  .fail(function(msg, err, _yargs) {
    const errmsg = err ? `${err.name}: ${err.message}` : "";
    prettyPrint({msg, errmsg});
    process.exit(1);
  }).argv;
