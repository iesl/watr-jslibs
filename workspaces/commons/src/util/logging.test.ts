//
import "chai";
import _ from 'lodash';
import path from "path";
import fs from "fs-extra";

import { initBufferedLogger, newFileStreamTransport, flushAndReopen } from './logging';

import {
  createLogger,
  format,
  transports,
  Logger,
} from "winston";

import { prettyPrint } from './pretty-print';
import { arrayStream  } from './stream-utils';
import { createPump } from './stream-pump';
import { delay } from './utils';

function openLogger(
  logpath: string
): Logger {

  const log = createLogger({
    level: "debug",
    transports: [
      newFileStreamTransport(logpath)
    ],
  });
  return log;
}

function statFileSize(filepath: string): number {
  const exists = fs.existsSync(filepath);
  if (exists) {
    const stats = fs.statSync(filepath);
    // prettyPrint({ stats });
    return stats.size;
  }
  return -1;
}

let qq = 0;
function dbgFileInfo(filepath: string): string {
  qq += 1;
  const bname = path.basename(filepath);
  const stats = statFileSize(filepath);
  return `${bname}: size: ${stats}  (#${qq})`;
}


describe("Logging", () => {
  const tmpdir = './test.tmp.d';
  const logname = 'test.log';
  const logpath = path.resolve(tmpdir, logname);
  const logpathPretty = path.resolve(tmpdir, `${logpath}.pretty.txt`);


  beforeEach(() => {
    console.log('beforeEach', dbgFileInfo(logpath));

    if (fs.existsSync(tmpdir)) {
      fs.emptyDirSync(tmpdir);
      fs.rmdirSync(tmpdir);
    }
    fs.mkdirpSync(tmpdir);
  });

  it("should immediately write raw logger file output", async (done) => {
    const logWriteStream = fs.createWriteStream(logpath, { flags: 'w+' });
    const logWriteStream2 = fs.createWriteStream(logpathPretty, { flags: 'w+' });

    logWriteStream.on('drain', () => {
      console.log('drain');
    });


    const streamTransport = new transports.Stream({
      stream: logWriteStream,
      format: format.combine(format.timestamp(), format.json()),
    });
    const streamTransport2 = new transports.Stream({
      stream: logWriteStream2,
      format: format.combine(format.prettyPrint()),
    });

    const log = createLogger({
      level: "debug",
      transports: [
        streamTransport,
        streamTransport2,
      ],
    });

    const endPromise = new Promise((resolve) => {
      log.on('finish', function() {
        logWriteStream.close();
        logWriteStream2.close();
        resolve();
      });
    });

    // console.log(dbgFileInfo(logpath));
    // const logitPromise = new Promise((resolve) => {

    //   log.info({
    //     infobit1: { some: ['data', { that: 'is', end: 'less ' }] },
    //     infobit2: { some: ['data', { that: 'is', end: 'less ' }] },
    //     infobit3: { some: ['data', { that: 'is', end: 'less ' }] },
    //     infobit4: { some: ['data', { that: 'is', end: 'less ' }] },
    //     infobit5: { some: ['data', { that: 'is', end: 'less ' }] }
    //   });

    //   // logWriteStream.on('finish', function() {
    //   //   console.log('logWriteStream: finish');
    //   //   console.log(dbgFileInfo(logpath));
    //   //   done();
    //   // });
    //   // log.remove(streamTransport)
    //   // logWriteStream = fs.createWriteStream(logpath, { flags: 'w+' });
    //   resolve();
    // });

    log.info({
      infobit1: { some: ['data', { that: 'is', end: 'less ' }] },
      infobit2: { some: ['data', { that: 'is', end: 'less ' }] },
      infobit3: { some: ['data', { that: 'is', end: 'less ' }] },
      infobit4: { some: ['data', { that: 'is', end: 'less ' }] },
      infobit5: { some: ['data', { that: 'is', end: 'less ' }] }
    });

    await new Promise((resolve) => {
      process.nextTick(() => {
        resolve();
      })
    });

    log.info({
      BBinfobit1: { some: ['data', { that: 'is', end: 'less ' }] },
      BBinfobit2: { some: ['data', { that: 'is', end: 'less ' }] },
      BBinfobit3: { some: ['data', { that: 'is', end: 'less ' }] },
      BBinfobit4: { some: ['data', { that: 'is', end: 'less ' }] },
      BBinfobit5: { some: ['data', { that: 'is', end: 'less ' }] }
    });

    await new Promise((resolve) => {
      process.nextTick(() => {
        resolve();
      })
    });

    _.each(_.range(3), (n) => {
      log.info({
        rrinfobit1: { some: ['data', { that: 'is', end: 'less ' }] },
        rrinfobit2: { some: ['data', { that: 'is', end: 'less ' }] },
        rrinfobit3: { some: ['data', { that: 'is', end: 'less ' }] },
        rrinfobit4: { some: ['data', { that: 'is', end: 'less ' }] },
        rrinfobit5: { some: ['data', { that: 'is', end: 'less ' }] }
      });
      log.debug(`debug:entry.number=${n}`);
      console.log(dbgFileInfo(logpath));
    });

    log.end();

    return endPromise.then(() => {
      console.log('endPromise.then(() => ) ');
      console.log(dbgFileInfo(logpath));
      console.log('commitAndClose: done');
      done();
    })
  });

  it.only("should create buffered loggers", async (done) => {
    expect(statFileSize(logpath)).toBe(-1);

    // const fst = () => newFileStreamTransport(logpath)

    const log = initBufferedLogger(logpath);
    console.log(dbgFileInfo(logpath));
    // expect(statFileSize(logpath))toBe(true);

    _.each(_.range(4), async (n) => {
      log.append('entry.number', n);
      if (n % 2 === 0) {
        await log.commitLogs();
      }
      console.log(
        'file',
        dbgFileInfo(logpath),
        dbgFileInfo(logpathPretty)
      );
    });

    log.commitAndClose()
      .then(() => {
        console.log('commitAndClose: done');
        done();
      })

  });

  it("should close and reopen  logger files to flush output", async (done) => {
    const log = openLogger(logpath);

    log.info({
      infobit1: { some: ['data', { that: 'is', end: 'less ' }] },
      infobit2: { some: ['data', { that: 'is', end: 'less ' }] },
      infobit3: { some: ['data', { that: 'is', end: 'less ' }] },
      infobit4: { some: ['data', { that: 'is', end: 'less ' }] },
      infobit5: { some: ['data', { that: 'is', end: 'less ' }] }
    });

    console.log('point A', dbgFileInfo(logpath));

    const fst = () => newFileStreamTransport(logpath)
    // await flushAndReopen(log, [fst]);

    console.log('point b', dbgFileInfo(logpath));

    const astr = arrayStream(_.range(80));

    const pumpBuilder = createPump()
      .viaStream<number>(astr)
      .throughF((n) => {
        log.info({
          infobit1: { some: [`${n}. data`, { that: 'is', end: `less:  ${n}.` }] },
          infobit2: { some: [`${n}. data`, { that: `is`, end: `less:  ${n}.` }] },
          infobit3: { some: [`${n}. data`, { that: `is`, end: `less:  ${n}.` }] },
          infobit4: { some: [`${n}. data`, { that: `is`, end: `less:  ${n}.` }] },
          infobit5: { some: [`${n}. data`, { that: `is`, end: `less:  ${n}.` }] }
        });

        if (n % 10 === 0) {
          console.log('LOOP: ', n, dbgFileInfo(logpath));
        }
        // return flushAndReopen(log, [fst]).then(() => delay(2));
      });

    await pumpBuilder.toPromise();

    await flushAndReopen(log, [fst]).then(() => delay(200));

    let inf = dbgFileInfo(logpath);
    console.log('point C', inf);

    // log.end();

    // await new Promise((resolve) => {
    //   log.on('finish', function() {
    //     resolve();
    //   });
    // });
    console.log('logEndPromise.then(() => ) ');
    inf = dbgFileInfo(logpath);
    console.log('point Z', inf);
    console.log('commitAndClose: done');
    done();

  });
});
