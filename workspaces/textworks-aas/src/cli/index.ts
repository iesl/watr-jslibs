import yargs, {Argv} from "yargs";

import {prettyPrint} from "commons";
import { arglib } from "commons";
import {normalizeHtmls} from "~/extract/reshape-html";

const { opt, yall } = arglib;

import "./spider-cli";
import "./corpus-cli";

yargs.commandDir(".", {
  recurse: false,
  extensions: ["ts"],
  include: /.*-cmd.ts/,
});

yargs.command(
  "write-norms",
  "desc.",
  (yargs: Argv) => {
    yall(yargs, [
      opt.existingDir("corpus-root: root directory for downloaded files"),
    ]);
  },
  (argv: any) => {
    const {corpusRoot} = argv;
    normalizeHtmls(corpusRoot);
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
