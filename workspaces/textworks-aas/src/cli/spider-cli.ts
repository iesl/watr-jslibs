import _ from "lodash";

import yargs, {Argv} from "yargs";
import {yall, opt} from "commons/dist/cli/arglib";
import {prettyPrint} from "commons";
import { createSpider } from '~/spider/spidering';

yargs.command(
  "crawl",
  "Start the spider/crawler",
  function config(ya: Argv) {
    yall(ya, [
      opt.config,
      opt.setCwd,
      opt.existingDir("corpus-root: root directory for corpus files"),
      opt.existingDir("logpath: directory to put log files"),
      opt.existingFile("input: spidering records"),
    ])
      .option({interactive: {type: "boolean", default: false}})
      .option({useBrowser: {type: "boolean", default: false}});
  },

  function exec(argv: any) {
    prettyPrint({msg: "Spidering", argv});

    const spiderOpts = argv;
    createSpider(spiderOpts);
  },
);
