import _ from "lodash";
import path from "path";

import { MetaFile, readMetaFile } from '~/qa-editing/qa-logging';

import * as Arr from 'fp-ts/lib/Array';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { getFileType, transformViaTidyBuffered } from './tidy-html';


export interface Field {
  name: string;
  evidence: string;
  value?: string;
  error?: string;
  complete?: boolean;
}

export interface ExtractionEnv {
  entryPath: string;
  metaProps: MetaFile;
  fileContentBuffer: string[];
  fileContentNormalization: string;
  urlMatcher: RegExp;
  fields: Field[];
}

export const initialEnv: ExtractionEnv = {
  entryPath: 'empty',
  metaProps: {
    url: 'empty',
    responseUrl: 'empty',
    status: 0
  },
  urlMatcher: /never/,
  fileContentNormalization: 'none',
  fileContentBuffer: [],
  fields: [],
};

export type ExtractionFunction = (env: ExtractionEnv) => TE.TaskEither<string, ExtractionEnv>;

export const filterUrl: (urlTest: RegExp) => ExtractionFunction =
  (urlTest: RegExp) => (env: ExtractionEnv) => {
    const { metaProps: { url } } = env;
    if (urlTest.test(url)) {
      return TE.right(env);
    }
    return TE.left(`url [${url}] failed test /${urlTest.source}/`)
  };


export const runFileVerification: (urlTest: RegExp) => ExtractionFunction =
  (typeTest: RegExp) => (env: ExtractionEnv) => {
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
  };

export const runHtmlTidy: ExtractionFunction =
  (env: ExtractionEnv) => {
    const { fileContentNormalization, entryPath } = env;

    const normType = 'html-tidy';
    if (fileContentNormalization === normType) {
      return TE.right(env);
    }

    const file = path.resolve(entryPath, 'response_body');

    const tidyOutput = transformViaTidyBuffered('./conf/tidy.cfg', file)
      .then(([stderr, stdout, exitCode]) => {
        if (exitCode > 0) {
          return E.right<string, string[]>(stdout);
        }
        const errString = _.filter(stderr, l => l.trim().length > 0)[0];
        return E.left<string, string[]>(errString);
      });

    const tidyOutputTask: TE.TaskEither<string, string[]> = () => tidyOutput;

    return pipe(
      tidyOutputTask,
      TE.chain((tidiedFile: string[]) => {
        return TE.right<string, ExtractionEnv>({
          ...env,
          fileContentBuffer: tidiedFile,
          fileContentNormalization: normType
        });
      })
    );

  };

export const readMetaProps: ExtractionFunction =
  (env: ExtractionEnv) => {
    const { entryPath } = env;
    const file = path.resolve(entryPath, 'meta');
    const metaProps = readMetaFile(file)
    if (!metaProps) {
      return TE.left(`meta file not found in ${entryPath}`);
    }
    return TE.right({ ...env, metaProps });
  };


export type BindFunction<E, A> = (env: A) => TE.TaskEither<E, A>;

export function bindTasksEA<E = unknown, A = unknown>(
  init: A,
  fs: BindFunction<E, A>[]
): TE.TaskEither<E, A> {

  const f1 = fs[0];
  const frest = fs.slice(1);
  const r1 = f1(init);

  const result = Arr.array.reduce(frest, r1, (
    acc: TE.TaskEither<E, A>,
    el: BindFunction<E, A>
  ) => {
    return pipe(acc, TE.chain(el));
  });

  return result;
}

export function bindTasks(
  init: ExtractionEnv,
  fs: ExtractionFunction[]
): TE.TaskEither<string, ExtractionEnv> {
  return bindTasksEA<string, ExtractionEnv>(init, fs);
}

export function doPipeline(
  init: ExtractionEnv,
  fs: ExtractionFunction[]
): Promise<E.Either<string, ExtractionEnv>> {
  return bindTasks(init, fs)();
}
