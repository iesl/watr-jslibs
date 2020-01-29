
import path from 'path';
import fs from "fs-extra";
import split from 'split2';
import pump from 'pump';
import through from 'through2';
import { Readable  } from 'stream';
import * as csv from 'fast-csv';
import { prettyPrint } from '~/util/pretty-print';

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
  let entryPath: string | undefined;
  let nextRec: any;

  const chunker = through.obj(
    function (blineChunk: Buffer, _enc: string, cb) {
      const lineChunk = blineChunk.toString();
      const isStart =  /^extracting/.test(lineChunk);
      const isAbstract =  /^  >/.test(lineChunk);

      if (isStart) {

        if (noteId && abs) {
          nextRec = {
            entryPath,
            noteId,
            fields: [{ name: 'abstract', value: abs }]
          };
        }
        entryPath = noteId = abs = undefined;

        const matchHashId = /^extracting (.*)\/([^\/]+)\/download.html$/.exec(lineChunk);
        if (!matchHashId) {
          throw Error(`matchHashId should have succeeded on ${lineChunk}`);
        }
        entryPath = matchHashId[1];
        noteId = matchHashId[2];
        entryPath = path.join(entryPath, noteId);

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
          { name: 'abstract', value: abs, entryPath }
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
    console.log(`csv:done; err=${err}`, err);
  });

  return pipe;
}

export function readLogFile(logfile: string, idToUrlMap: any) {

  const logStream = createReadStream(logfile);

  const logChunker = makeLogChunker();
  const idToUrl = makeIdUrlAugmenter(idToUrlMap);

  return pump(logStream, split(), logChunker, idToUrl, (err: Error) => {
    console.log(`log:done; err=${err}`, err);
  });
}

export async function writeExtractedFieldsToCorpus(csvfile: string, logfile: string) {

  const csvReader = readCsvFile(csvfile);

  csvReader.on('data', (data: any) => {

    const logEntryStream = readLogFile(logfile, data);

    const endstr = pump(
      logEntryStream,
      through.obj(function (rec: any, _enc: string, callback) {
        const { entryPath, fields, } = rec;

        const exField: object[] = fields;

        if (exField.length > 0) {
          const fieldsFile = path.join(entryPath, 'extracted-fields.json');
          if (fs.existsSync(fieldsFile)) {
            console.log(`Skipping existing: ${fieldsFile}`)
          } else {
            console.log(`Writing: ${fieldsFile}`)
            fs.writeJsonSync(fieldsFile, { fields })
          }
        }

        callback(null, rec);
      }),
      (err: Error) => {
        console.log(`err:done; err: `, err);
      }
    );

    endstr.on('data', (d) => {
      console.log('processing...')
    });
    endstr.on('done', (d) => {
      console.log('done...')
    });
  });

}
