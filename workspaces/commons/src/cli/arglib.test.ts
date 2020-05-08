//
import "chai";

import _ from "lodash";
import { config, opt, ArgvApp } from "~/cli/arglib";
import yargs from "yargs";
import { prettyPrint } from '~/util/pretty-print';

describe("Arglib tests", () => {
  beforeEach(() => {
    yargs.reset()
  })


  async function runCmd(args: string, ...fs: ArgvApp[]): Promise<object> {
    return new Promise((resolve, reject) => {
      yargs.command(
        "testcmd", "desc",
        config(...fs),
        (argv: any) => resolve(argv)
      );
      const argtokens = args.split(" ");
      const allargs = _.concat(["testcmd"], argtokens);
      prettyPrint({ allargs });

      yargs
        .demandCommand(1, "You need at least one command before moving on")
        .fail(function(msg, err, _yargs) {
          const errmsg = err ? `${err.name}: ${err.message}` : "";
          prettyPrint({msg, errmsg});
          reject(msg);
        }).parse(allargs);
    });
  }

  it("should resolve file/directory args", async (done) => {
    const result = await runCmd(
      "--cwd . --corpus-root df",
      opt.cwd,
      opt.existingDir("corpus-root: root directory for corpus files"),
    ).catch(caughtErr => {
      prettyPrint({ caughtErr });
    });

    prettyPrint({ result });
    done();

  });
});
