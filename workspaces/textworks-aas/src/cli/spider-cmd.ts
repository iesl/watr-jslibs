import _ from 'lodash';
import { Argv } from 'yargs';
import { yall, opt } from './arglib';
import { prettyPrint } from '~/util/pretty-print';
import { createSpider } from '~/spider/spidering';

export const command = 'spider';

export const aliases = ['crawl'];

export const describe = 'Start the spider'

export function builder(yargs: Argv) {
  yall(yargs, [
    opt.config,
    opt.setCwd,
    opt.existingDir('downloads: root directory for downloaded files'),
    opt.existingDir('logpath: directory to put log files'),
    opt.existingFile('input: spidering records'),
  ])
    .option({ interactive: { type: 'boolean', default: false }})
    .option({ useBrowser: { type: 'boolean', default: false }})
  ;


  return yargs;
}

export function handler(argv: any) {
  prettyPrint({ msg: 'Spidering', argv });

  const spiderOpts = argv;
  createSpider(spiderOpts);
}
