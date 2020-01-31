import _ from 'lodash';
import { Argv } from 'yargs';
import { yall, opt } from './arglib';
import { prettyPrint } from '~/util/pretty-print';

export const command = 'spider';

export const aliases = ['crawl'];

export const describe = 'start the spider'

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
  const props = _.pickBy(argv, !_.isFunction);
  const {
    downloads, input, logpath
  } = argv;

  prettyPrint({ msg: 'Spidering', argv, downloads, input, logpath, props });
}
