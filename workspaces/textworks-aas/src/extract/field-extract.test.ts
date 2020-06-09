import "chai/register-should";

import _ from "lodash";
// import fs from "fs-extra";
import path from "path";

import {
  // prettyPrint,
  // throughFunc,
  // BufferedLogger,
  streamPump, prettyPrint,
  // ExpandedDir
} from "commons";

import { MetaFile, readMetaFile } from '~/qa-editing/qa-logging';


// import * as io from 'io-ts';
// import * as Arr from 'fp-ts/lib/Array';
// import * as Ap from 'fp-ts/lib/Apply';
// import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { transformViaTidy, getFileType } from './tidy-html';

describe("Field Extraction Pipeline", () => {

  interface MyEnv {
    entryPath: string;
    // log: BufferedLogger;
    metaProps: MetaFile;
    fileContentBuffer: string[];
  }


  function _filterUrl(urlTest: RegExp, env: MyEnv): TE.TaskEither<string, MyEnv> {
    const { metaProps: { url } } = env;
    if (urlTest.test(url)) {
      return TE.right(env);
    }
    return TE.left(`url [${url}] failed test /${urlTest.source}/`)
  }

  const filterUrl = _.curry(_filterUrl);

  function _runFileVerification(typeTest: RegExp, env: MyEnv): TE.TaskEither<string, MyEnv> {
    const { entryPath } = env;
    const file = path.resolve(entryPath, 'response_body');

    const fileTypeTask: TE.TaskEither<string, string> =
      TE.rightTask(() => getFileType(file));

    return pipe(
      fileTypeTask,
      TE.chain((fileType: string) => {
        return typeTest.test(fileType) ?
          TE.right(env) :
          TE.left(`Unexpected filetype: ${fileType}; wanted ${typeTest.source}`);
      })
    );
  }

  const runFileVerification = _.curry(_runFileVerification);

  function _runHtmlTidy(env: MyEnv): TE.TaskEither<string, MyEnv> {
    const { entryPath } = env;
    const file = path.resolve(entryPath, 'response_body');

    prettyPrint({ msg: '_runHtmlTidy', file });

    const { outStream, errStream } =
      transformViaTidy('./conf/tidy.cfg', file);

    const tidyOutput = streamPump
      .createPump()
      .viaStream<string>(outStream)
      .toPromise()
      .then((output: string[]) => {
        prettyPrint({ output });
        return E.right<string, string[]>(output);
      });

    const tidyErrs = streamPump
      .createPump()
      .viaStream<string>(errStream)
      .toPromise()
      .then((errors: string[]) => {
        prettyPrint({ errors });
        return E.left<string, string[]>(_.join(errors, "; "));
      });

    const outErrP = Promise
      .race([tidyOutput, tidyErrs]);

    const tidyOutputTask: TE.TaskEither<string, string[]> = () => outErrP;
    // const tidyOutputTask: TE.TaskEither<string, string[]> =
    // TE.rightTask(() => tidyOutput);


    return pipe(
      tidyOutputTask,
      TE.chain((tidiedFile: string[]) => {
        return TE.right<string, MyEnv>({ ...env, fileContentBuffer: tidiedFile });
      })
    );
  }
  const runHtmlTidy = _.curry(_runHtmlTidy);


  function _readMetaFileX(env: MyEnv): TE.TaskEither<string, MyEnv> {
    const { entryPath } = env;
    const file = path.resolve(entryPath, 'meta');
    const metaProps = readMetaFile(file)
    if (!metaProps) {
      return TE.left(`meta file not found in ${entryPath}`);
    }
    return TE.right({ ...env, metaProps });
  }
  const readMetaFileX = _.curry(_readMetaFileX);

  it("should run a single extraction stage", async (done) => {

    const testEntryPath = './test/resources/scrapy-cache-entry';

    const initEnv: MyEnv = {
      entryPath: testEntryPath,
      metaProps: {
        url: 'empty',
        responseUrl: 'empty',
        status: 200
      },
      fileContentBuffer: []
    };

    const res = pipe(
      TE.right<string, MyEnv>(initEnv),
      TE.chain(readMetaFileX),
      TE.map((env: MyEnv) => { prettyPrint({ env }); return env; } ),
      TE.chain(filterUrl(/ieee.org/)),
      TE.map((env: MyEnv) => { prettyPrint({ env }); return env; } ),
      TE.chain(runFileVerification(/html/i)),
      TE.map((env: MyEnv) => { prettyPrint({ env }); return env; } ),
      TE.chain(runHtmlTidy),
      TE.map((env: MyEnv) => {
        prettyPrint({ msg: "success", env });
        done()
        return env;
      }),
      TE.mapLeft((err: string) => {
        prettyPrint({ msg: "error", err });
        done();
        return err;
      }),
    );

    res();
  });
});

// const stream = streamPump
//   .createPump<ExpandedDir, MyEnv>()
//   .initEnv<MyEnv>((exDir: ExpandedDir, env: BaseEnv) => {
//     const metafile = path.join(exDir.dir, "meta");
//     const metaProps = readMetaFile(metafile);
//     if (!metaProps) {
//       // return env.error('no metaProps found');
//       // return;
//     }
//     return {
//       entryPath: exDir.dir,
//       metaProps: metaProps,
//     }
//   })
// //   .filter()
// //   .throughF()
