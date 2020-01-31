import yargs, {} from 'yargs';

import { prettyPrint } from '~/util/pretty-print';

yargs.commandDir('.', {
  recurse: false,
  extensions: ['ts'],
  include: /.*-cmd.ts/,
});

yargs
  .demandCommand(1, 'You need at least one command before moving on')
  .strict()
  .help()
  .fail(function (msg, err, yargs) {
    prettyPrint({ msg, err });
    process.exit(1)
  })
  .argv
;
