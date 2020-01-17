//
import _ from 'lodash';
import fs from 'fs-extra';
import csv from 'fast-csv';
import path from 'path';

import cmds from 'caporal';
const program = cmds;

program
  .command('load', 'load csv and report some info')
  .argument('<file>', 'csv file name')
  .action((args, _opts, _logger) => {

    loadcsv(args.file)

  });

function loadcsv(csvfile: string) {

  const csvabs = path.resolve(csvfile);
  const fileExists = fs.existsSync(csvabs);

  console.log(`exists=${fileExists}: ${csvabs} `);

  fs.createReadStream(csvabs)
    .pipe(csv.parse({ headers: true }))
    .on('data', row => {
      console.log('> ', row);
    });
}
