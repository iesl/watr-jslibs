import _ from "lodash";
import { Readable } from "stream";
import { dirstream, stringStreamFilter } from 'commons';
import path from "path";
import fs from "fs-extra";


export function walkScrapyCacheCorpus(corpusRoot: string): Readable {
  const corpusDirStream = dirstream(corpusRoot);

  const entryDirFilter = stringStreamFilter((dir: string) => {
    const shaHexRE = /[\dabcdefABCDEF]{40}[/]?$/;
    return shaHexRE.test(dir);
  });

  return corpusDirStream.pipe(entryDirFilter);
}

const artifactSubdirO = {
  'spidering-logs': null,
  'cache': null,
  'ground-truth': null,
  'extracted-fields': null,
};

type artifactSubdirT = typeof artifactSubdirO;
export type ArtifactSubdir = keyof artifactSubdirT;

const artifactSubdirs: ArtifactSubdir[] = [
  'spidering-logs',
  'cache',
  'ground-truth',
  'extracted-fields',
]

export function resolveCorpusFile(entryPath: string, artifactDir: ArtifactSubdir, corpusFilename: string): string {
  return path.resolve(entryPath, artifactDir, corpusFilename);
}
export function ensureArtifactDir(entryPath: string, artifactDir: ArtifactSubdir): void {
  const artifactDirPath = path.resolve(entryPath, artifactDir);
  const artifactDirExists = fs.existsSync(artifactDirPath);
  if (artifactDirExists) return;

  fs.mkdirSync(artifactDirPath);
}

export function readCorpusFile<T>(entryPath: string, artifactDir: ArtifactSubdir, corpusFilename: string): T | undefined {
  const filePath = path.resolve(entryPath, artifactDir, corpusFilename);
  return readJsonOrUndef(filePath);
}
export function readCorpusFileAsync<T>(entryPath: string, artifactDir: ArtifactSubdir, corpusFilename: string): Promise<T | undefined> {
  const filePath = path.resolve(entryPath, artifactDir, corpusFilename);
  return readJsonOrUndefAsync(filePath);
}

export function hasCorpusFile(entryPath: string, artifactDir: ArtifactSubdir, corpusFilename: string): boolean {
  const filePath = path.resolve(entryPath, artifactDir, corpusFilename);
  return fs.existsSync(filePath);
}

export function writeCorpusFile<T>(entryPath: string, artifactDir: ArtifactSubdir, filename: string, content: T): boolean {
  ensureArtifactDir(entryPath, artifactDir);
  const filePath = resolveCorpusFile(entryPath, artifactDir, filename);
  return writeJson(filePath, content);
}


function readJsonOrUndef<T>(filePath: string): T | undefined {
  if (!fs.existsSync(filePath)) return;
  return fs.readJsonSync(filePath);
}
async function readJsonOrUndefAsync<T>(filePath: string): Promise<T | undefined> {
  if (!fs.existsSync(filePath)) return;
  return fs.readJson(filePath);
}

export function writeJson<T>(filePath: string, obj: T): boolean {
  if (fs.existsSync(filePath)) return false;
  fs.writeJsonSync(filePath, obj);
  return true;
}

export function resolveEntryPath(entryPath: string, subPath: string): string {
  return path.resolve(entryPath, subPath);
}

export const ensureArtifactDirectories = (entryPath: string): void => {
  _.each(artifactSubdirs, d => {
    const artifactPath = resolveEntryPath(entryPath, d);
    const artifactDirExists = fs.existsSync(artifactPath);
    if (!artifactDirExists) {
      fs.mkdirSync(artifactPath);
    }
  });
};
