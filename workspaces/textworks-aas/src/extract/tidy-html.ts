import _ from "lodash";

import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import stream, { Readable } from 'stream';
import { promisifyOn, prettyPrint, throughFunc, streamPump } from 'commons';

import split from 'split';

interface TransformProcess {
  outStream: Readable;
  errStream: Readable;
  completePromise: Promise<number>;
}

export function transformViaTidy(
  configFile: string,
  infile: string
): TransformProcess {
  const proc = spawn('tidy', ['-config', configFile, infile]);

  return streamifyProcess(proc);
}

export type StdErrAndStdOutLines = [string[], string[], number];

export function transformViaTidyBuffered(
  configFile: string,
  infile: string
): Promise<StdErrAndStdOutLines> {

  const { outStream, errStream, completePromise } =
    transformViaTidy(configFile, infile);

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


export async function getFileType(
  infile: string
): Promise<string> {

  const proc = spawn('file', ['-b', '-i', '--no-buffer', infile]);

  const { outStream, completePromise } = streamifyProcess(proc);
  const onDataPromise =  promisifyOn<string>('data', outStream);

  return completePromise.then(() => {
    return onDataPromise;
  });
}

export function streamifyProcess(
  proc: ChildProcessWithoutNullStreams
): TransformProcess {

  const outStreamR = new stream.Readable({
    read() { /* noop */ }
  });

  const errStreamR = new stream.Readable({
    read() { /* noop */ }
  });

  proc.stdout.on('data', (data) => {
    outStreamR.push(data);
  });

  proc.stderr.on('data', (data) => {
    errStreamR.push(data);
  });


  const procClose = new Promise<number>((resolve) => {
    proc.on('close', (code: number) => {
      outStreamR.push(null);
      errStreamR.push(null);
      resolve(code);
    });
  });

  const outStream = outStreamR
    .pipe(split())
    .pipe(throughFunc((t: string) => {
      return t;
    }))
  ;
  const errStream = errStreamR
    .pipe(split())
    .pipe(throughFunc((t: string) => {
      return t;
    }))
  ;

  return {
    completePromise: procClose,
    outStream,
    errStream,
  };
}
