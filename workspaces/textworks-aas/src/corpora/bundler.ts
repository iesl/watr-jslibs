
import fs from "fs-extra";
import split from 'split2';
import pump from 'pump';
import through from 'through2';
import { Readable  } from 'stream';
import * as csv from 'fast-csv';

function createReadStream(filename: string): Readable {
  const str = fs.createReadStream(filename);
  str.on('end', () => {
    str.destroy();
  });
  return str;
}


function makeNoteIdMapper() {
  const idMap: any = {};
  const chunker = through.obj(
    function (rec: string[], _enc: string, cb) {
      const [noteId,, url] = rec;
      idMap[noteId] = url ;
      return cb(null, null);
    },
    function flush(cb) {
      this.push(idMap);
      cb();
    }
  );
  return chunker;
}
function makeLogChunker() {
  let noteId: string | undefined;
  let abs: string | undefined;
  let nextRec: any;

  const chunker = through.obj(
    function (blineChunk: Buffer, _enc: string, cb) {
      const lineChunk = blineChunk.toString();
      const isStart =  /^extracting/.test(lineChunk);
      const isAbstract =  /^  >/.test(lineChunk);

      if (isStart) {
        if (noteId && abs) {
          nextRec = {
            noteId,
            fields: [{ name: 'abstract', value: abs }]
          };
        }
        noteId = abs = undefined;

        const matchHashId = /\/([^\/]+)\/download.html$/.exec(lineChunk);
        if (!matchHashId) {
          throw Error(`matchHashId should have succeeded on ${lineChunk}`);
        }
        noteId = matchHashId[1];

        if (nextRec) {
          const z = nextRec;
          nextRec = undefined;
          return cb(null, z);
        }
      } else if (isAbstract) {
        const a = lineChunk.split('>')[1].trim();
        abs = a;
      }

      return cb(null, null);
    },
    function flush(cb) {
      if (noteId && abs) {
        this.push({ noteId, fields: [
          { name: 'abstract', value: abs }
        ]});
        noteId = abs = undefined;
      }
      cb();
    }
  );
  return chunker;
}

function makeIdUrlAugmenter(idToUrlMap: any) {
  return through.obj(
    function (rec: any, _enc: string, cb) {
      const noteId = rec['noteId'];
      const url = idToUrlMap[noteId];
      if (!noteId || !url) {
        throw new Error(`no noteId or url found: ${rec}` );
      }
      rec['url'] = url;
      return cb(null, rec);
    },
  );
}

function readCsvFile(csvfile: string) {
  const csvStream = createReadStream(csvfile);
  const csvParser = csv.parse({ headers: false });
  const mapMaker = makeNoteIdMapper();
  const pipe = pump(csvStream, csvParser, mapMaker, (err: Error) => {
    console.log(`done; err=${err}`, err);
  });

  return pipe;
}

export function readLogFile(logfile: string, idToUrlMap: any) {

  const logStream = createReadStream(logfile);

  const logChunker = makeLogChunker();
  const idToUrl = makeIdUrlAugmenter(idToUrlMap);

  const pipe = pump(logStream, split(), logChunker, idToUrl, (err: Error) => {
    console.log(`done; err=${err}`, err);
  });
  return pipe;
}


function jsonCollector() {
  let objs: any[] = [];
  return through.obj(
    function (rec: any, _enc: string, cb) {
      objs.push(rec);
      return cb(null, null);
    },
    function (cb) {
      this.push(objs);
      return cb();
    }
  );
}
function jsonStringify() {
  return through.obj(
    function (jsons: any, _enc: string, cb) {
      return cb(null, JSON.stringify(jsons));
    }
  );
}


export function writeExtractedFieldsToCorpus(csvfile: string, logfile: string) {

  const csvReader = readCsvFile(csvfile);

  csvReader.on('data', (data: any) => {

    const logEntryStream = readLogFile(logfile, data);
    const output = fs.createWriteStream('../../tmp.out.json');
    const stringify = jsonStringify();
    const collector = jsonCollector();

    pump(logEntryStream, collector, stringify, output, (err: Error) => {
      console.log(`done; err=${err}`, err);
    });

  });
}



// export function packageData(csvfile: string, logfile: string) {
//   const csvReader = readCsvFile(csvfile);

//   csvReader.on('data', (data: any) => {
//     const logEntryStream = readLogFile(logfile, data);
//     const output = fs.createWriteStream('../../tmp.out.json');
//     const stringify = jsonStringify();
//     const collector = jsonCollector();

//     pump(logEntryStream, collector, stringify, output, (err: Error) => {
//       console.log(`done; err=${err}`, err);
//     });
//   });
// }
