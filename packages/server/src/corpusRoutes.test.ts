//
// import MemoryFileSystem from "memory-fs";
// var fs = new MemoryFileSystem();
import path from "path";
// import { readCorpusEntries } from "./corpusRoutes";
import fs, {  } from "fs-extra";

const ScratchDir = path.join(".", "scratch.d");

const CORPUS_ROOT_DIR = path.join(ScratchDir, 'corpus-root.d')

// after(() => fs.rmdirSync(CORPUS_ROOT_DIR))

describe("read corpus entries", () => {
  const dirnames = ['dir1', 'dir2', 'dir2/dir2_1', 'dir2/dir2_1/dir2_1_1'];
  const filenames = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1'];
  fs.mkdirpSync(CORPUS_ROOT_DIR);

  beforeEach(() => {
    console.log("CORPUS_ROOT_DIR", CORPUS_ROOT_DIR);
    fs.rmdirSync(CORPUS_ROOT_DIR)
    fs.mkdirpSync(CORPUS_ROOT_DIR)
    const DIRS = dirnames.map(dir => path.join(CORPUS_ROOT_DIR, dir))
    const FILES = filenames.map(f => path.join(CORPUS_ROOT_DIR, f))
    DIRS.forEach(dir => fs.mkdirpSync(dir))
    FILES.forEach((f, i) => fs.writeFileSync(f, i.toString()))
  });

  it("read entries", () => {
    console.log('hello, jest!');
    // const entries = readCorpusEntries(CORPUS_ROOT_DIR);
    // console.log(entries);
  });

});

//10.1101-001875.d                                                                                                                         ⬆ ✱ ◼
//   001875.full.pdf
//   bioarxiv.json
//   page-images/
//   page-thumbs/
//   textgrid.json
//   tracelogs/
