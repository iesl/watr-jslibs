
import _ from 'lodash';
import path from 'path';
import fs from "fs-extra";
import split from 'split2';
import pump from 'pump';
import through from 'through2';
import { Readable  } from 'stream';
import * as csv from 'fast-csv';
import { csvStream, makeCorpusPathFromUrlDplpNoteId } from '~/util/parse-csv';
import { Transform }  from 'stream';
import { throughFunc, sliceStream } from '~/util/stream-utils';

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
  csvStream
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

    endstr.on('data', () => {
      console.log('processing...')
    });
    endstr.on('done', () => {
      console.log('done...')
    });
  });

}

interface Accum {
  noteId: string;
  dblpConfId: string;
  url: string;
  corpusPath: string;
}

type AccumKey = keyof Accum;

export function jsonifyCSV(fields: AccumKey[], row: string[]): Partial<Accum> {
  const acc: Partial<Accum> = {};
  _.each(row, (rf, ri) => {
    acc[fields[ri]] = rf;
  });
  return acc;
}


import hash from 'object-hash';
import { prettyPrint } from '~/util/pretty-print';

export function normalizeUrlCorpus(urlCsv: string, fromCorpus: string, toCorpus: string) {
  console.log(`normalizeUrlCorpus`);

  const jsonify = _.curry(jsonifyCSV)(['noteId', 'dblpConfId', 'url']);
  const jsonifyTrans = throughFunc(jsonify);

  const csvstr = csvStream(urlCsv);

  const rewrite = throughFunc((acc: Partial<Accum>) => {
    const url = acc.url!;

    const urlHash = hash(url, { algorithm: 'sha1', encoding: 'hex' });
    const leadingPath = urlHash.slice(0, 2).split('').join('/');

    const leafPath = `${acc.noteId}.d`;
    const corpusPath = path.join(leadingPath, leafPath);

    acc.corpusPath = corpusPath;


    path.join(fromCorpus, corpusPath);
    const newCorpusPath = path.join(toCorpus, corpusPath);
    const oldCorpusPath = makeCorpusPathFromUrlDplpNoteId(url, acc.dblpConfId!, acc.noteId!);

    const now = new Date();
    const timeOpts =  { timeStyle: 'medium', hour: '2-digit', minute: '2-digit', seconds: '2-digit', hour12: false };
    const nowTime = now.toLocaleTimeString('en-US', timeOpts)

    const timestamp = nowTime
      .replace(/:/g, '.');


    const oldCorpusFullpath = path.join(fromCorpus, oldCorpusPath);


    const oldPathExists = fs.existsSync(oldCorpusFullpath);
    if (oldPathExists) {
      const dirEntries = fs.readdirSync(oldCorpusFullpath, { withFileTypes: true });
      const files = dirEntries
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);

      prettyPrint({ files });

      _.each(files, filename => {
        const ext = path.extname(filename);
        const bn = filename.slice(0, filename.length-ext.length);
        const newFilename = `${bn}-${timestamp}${ext}`;
        const toFile = path.resolve(newCorpusPath, newFilename);
        const fromFile = path.resolve(oldCorpusFullpath, filename);
        prettyPrint({ fromFile, toFile });
        const toExists = fs.existsSync(toFile);
        if (toExists) {
          console.log(`Warning: ${toFile} already exists`);
        }
        fs.mkdirpSync(newCorpusPath);
        fs.copyFileSync(fromFile, toFile);
      });

    } else {
      prettyPrint({ msg: 'no entry for this record in "from" corpus'});
    }
    return acc;
  });

  const pipeline = pump(
    csvstr,
    // sliceStream(0, 10),
    jsonifyTrans,
    rewrite,
  );

  pipeline.on('data', () => {});

}
