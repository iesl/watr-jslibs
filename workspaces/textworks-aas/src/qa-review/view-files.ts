import { spawn } from 'child_process';
import { streamifyProcess } from 'commons';

export async function openFileWithLess(infile: string): Promise<void> {
  const proc = spawn(
    'gnome-terminal',
    ["--command", `sh -c 'less ${infile}'`]
  );

  const { completePromise } = streamifyProcess(proc);
  return completePromise.then(() => undefined);
}

export async function openFileWithBrowser(infile: string): Promise<void> {
  const proc = spawn('firefox', [infile]);
  const { completePromise } = streamifyProcess(proc);
  return completePromise.then(() => undefined);
}
