import _ from "lodash";

import { spawn } from 'child_process';
import { streamPump, TransformProcess, streamifyProcess } from 'commons';

export function runTidyCmd(
  configFile: string,
  infile: string
): TransformProcess {
  const proc = spawn('tidy', ['-config', configFile, infile]);

  return streamifyProcess(proc);
}

export type StdErrAndStdOutLines = [string[], string[], number];

export function runTidyCmdBuffered(
  configFile: string,
  infile: string
): Promise<StdErrAndStdOutLines> {

  const { outStream, errStream, completePromise } =
    runTidyCmd(configFile, infile);

  const tidyOutput = streamPump
    .createPump()
    .viaStream<string>(outStream)
    .toPromise()

  const tidyErrs = streamPump
    .createPump()
    .viaStream<string>(errStream)
    .toPromise();

  return Promise.all([tidyErrs, tidyOutput, completePromise]);
}

