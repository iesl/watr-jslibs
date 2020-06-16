import yargs from "yargs";

import { prettyPrint } from "commons";
import "./corpus-cli";

try {

  const argParse = yargs
    .demandCommand(1, "You need at least one command before moving on")
    .strict()
    .help()
    .fail(function(msg, err, _yargs) {
      const errmsg = err ? `${err.name}: ${err.message}` : "";
      prettyPrint({ msg, errmsg });
      process.exit(1);
    }).argv;

  prettyPrint({ argParse });

} catch (error) {
  prettyPrint({ error });
}
