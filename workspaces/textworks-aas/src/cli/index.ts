
import "./extraction-cli";
import { arglib, prettyPrint } from "commons";

arglib.YArgs
  .demandCommand(1, "You need at least one command before moving on")
  .strict()
  .help()
  .fail(function(msg, err) {
    // const errmsg = err ? `${err.name}: ${err.message}` : "";
    // prettyPrint({ msg, err, errmsg });
  })
  .argv;


// try {
//   prettyPrint({ argParse });

// } catch (error) {
//   prettyPrint({ error });
// }
