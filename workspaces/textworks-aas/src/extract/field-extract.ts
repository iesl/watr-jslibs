import _ from "lodash";
import path from "path";

import { MetaFile, readMetaFile } from '~/qa-editing/qa-logging';

import * as Arr from 'fp-ts/lib/Array';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { getFileType, transformViaTidyBuffered } from './tidy-html';
import { readResolveFile, makeCssTreeNormalForm, readResolveFileAsync } from './reshape-html';


export interface Field {
  name: string;
  evidence: string;
  value?: string;
  error?: string;
  complete?: boolean;
}

interface NormalForms {
  'css-normal': null;
  'response-body': null;
  'html-tidy': null
}

export type NormalForm = keyof NormalForms;

interface FileContentValue {
  lines: string[];
  content: string;
}
export interface ExtractionEnv {
  entryPath: string;
  metaProps: MetaFile;
  responseMimeType: string;
  fileContentMap: { [k in keyof NormalForms]?: FileContentValue };
  fields: Field[];
  extractionEvidence: string[];
}

export const initialEnv: ExtractionEnv = {
  entryPath: 'empty',
  metaProps: {
    url: 'empty',
    responseUrl: 'empty',
    status: 0
  },
  responseMimeType: '',
  fileContentMap: {},
  fields: [],
  extractionEvidence: [],
};

export type ExtractionResult = TE.TaskEither<string, ExtractionEnv>;
export type ExtractionFunction = (env: ExtractionEnv) => ExtractionResult;

export const tapWith: (f: (env: ExtractionEnv) => void) => ExtractionFunction =
  f => env => {
    const originalEnv = _.merge({}, env);
    f(env);
    return TE.right(originalEnv);
  };

export const modEnv: (f: (env: ExtractionEnv) => ExtractionEnv) => ExtractionFunction =
  f => env => {
    const newEnv = f(env);
    return TE.right(newEnv);
  };

export const resetEnvForAttemptChain: ExtractionFunction =
  env => {
    env.extractionEvidence = [];
    return TE.right(env);
  };

export const filterUrl: (urlTest: RegExp) => ExtractionFunction =
  (urlTest: RegExp) => (env: ExtractionEnv) => {
    const { metaProps: { responseUrl } } = env;
    if (urlTest.test(responseUrl)) {
      return TE.right(env);
    }
    return TE.left(`url [${responseUrl}] failed test /${urlTest.source}/`)
  };

export const verifyHttpResponseCode: ExtractionFunction =
  (env: ExtractionEnv) => {
    const { metaProps: { status } } = env;
    if (status === 200) {
      return extractionSuccess(env);
    }
    return fatalFailure(`response code: ${status}`)
  };


export const verifyFileExists: (filename: string) => ExtractionFunction =
  (filename: string) => (env: ExtractionEnv) => {
    const { entryPath } = env;
    const file = path.resolve(entryPath, filename);
    const fileExists = fs.existsSync(file);
    return fileExists ? extractionSuccess(env) : nonFatalFailure(`file doesn't exist: ${filename}`);
  };

export const verifyFileNotExists: (filename: string) => ExtractionFunction =
  (filename: string) => (env: ExtractionEnv) => {
    return pipe(
      verifyFileExists(filename)(env),
      TE.swap,
      TE.map(() => env),
      TE.mapLeft(() => `file exists: ${filename}`),
    );
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
        env.responseMimeType = fileType;
        return typeTest.test(fileType) ?
          TE.right(env) :
          fatalFailure(`Unexpected filetype: ${fileType}; wanted ${typeTest.source}`)
      })
    );
  };

export const sanityCheckAbstracts: ExtractionFunction =
  (env: ExtractionEnv) => {
    const { fields } = env;

    const filtered = _.filter(fields, field => {
      const maybeAbstract = field.value;
      if (!maybeAbstract) return false;

      if (maybeAbstract.length < 180) return false;

      return true;
    });

    if (filtered.length > 0) {
      env.fields = filtered;
      return extractionSuccess(env);
    }
    return nonFatalFailure(`sanityCheckAbstracts failed`);
  };


export const runLoadResponseBody: ExtractionFunction =
  (env: ExtractionEnv) => {
    const { fileContentMap, entryPath } = env;

    const normType = 'response-body';

    if (normType in fileContentMap) {
      return TE.right(env);
    }

    const fileContent = readResolveFile(entryPath, 'response_body');
    if (!fileContent) {
      return TE.left(`Could not read file response_body`);
    }
    fileContentMap[normType] = {
      content: fileContent,
      lines: []
    };
    return TE.right(env);
  }

export const runCssNormalize: ExtractionFunction =
  (env: ExtractionEnv) => {
    const { fileContentMap, entryPath, responseMimeType } = env;
    const normType = 'css-normal';

    if (normType in fileContentMap) {
      return TE.right(env);
    }
    const htmlTidied = fileContentMap['html-tidy'];
    if (!htmlTidied) {
      return TE.left(`runCssNormalize: no html-tidy output; run after html-tidy;`);
    }

    const { content } = htmlTidied;

    const useXmlProcessing = /xml/i.test(responseMimeType);
    const cssNormalFormLines = makeCssTreeNormalForm(content, /* useXmlMode= */ useXmlProcessing)
    const cssNormalForm = cssNormalFormLines.join("\n");

    fs.writeFileSync(path.resolve(entryPath, `normalized-${normType}`), cssNormalForm);

    fileContentMap['css-normal'] = {
      lines: cssNormalFormLines,
      content: cssNormalForm
    };
    return TE.right(env);
  };


export function extractionSuccess(result: ExtractionEnv): ExtractionResult {
  return TE.right<string, ExtractionEnv>(result);
}

export function fatalFailure(result: string): ExtractionResult {
  return TE.left<string, ExtractionEnv>(`FATAL: ${result}`);
}
export function nonFatalFailure(result: string): ExtractionResult {
  return TE.left<string, ExtractionEnv>(`WARN: ${result}`);
}

export const readCachedFile: (cacheKey: NormalForm) => ExtractionFunction =
  (cacheKey: NormalForm) => (env: ExtractionEnv) => {
    const { fileContentMap, entryPath } = env;
    const cachedFilePath = path.resolve(entryPath, `normalized-${cacheKey}`);
    const maybeContent = () =>
      readResolveFileAsync(cachedFilePath)
        .then((content) => content ? E.right(content) : E.left(`cache miss ${cacheKey}`));

    return pipe(
      maybeContent,
      TE.chain(fileContent => {
        const lines = fileContent.split('\n');
        fileContentMap[cacheKey] = {
          content: fileContent,
          lines
        };
        return extractionSuccess(env);
      }),
      TE.alt(() => extractionSuccess(env))
    );
  };


import fs from "fs-extra";
export const runHtmlTidy: ExtractionFunction =
  (env: ExtractionEnv) => {

    const { fileContentMap, entryPath } = env;

    const normType = 'html-tidy';

    if (normType in fileContentMap) {
      return TE.right(env);
    }

    const file = path.resolve(entryPath, 'response_body');

    const tidyOutput = transformViaTidyBuffered('./conf/tidy.cfg', file)
      .then(([stderr, stdout, exitCode]) => {
        if (exitCode > 0) {
          fs.writeFileSync(path.resolve(entryPath, `normalized-${normType}`), stdout.join("\n"));
          return E.right<string, string[]>(stdout);
        }
        const errString = _.filter(stderr, l => l.trim().length > 0)[0];
        return E.left<string, string[]>(errString);
      });

    const tidyOutputTask: TE.TaskEither<string, string[]> = () => tidyOutput;

    return pipe(
      tidyOutputTask,
      TE.chain((tidiedFile: string[]) => {
        fileContentMap[normType] = {
          lines: tidiedFile,
          content: tidiedFile.join("\n")
        };
        return extractionSuccess(env);
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
    env.metaProps = metaProps;
    return TE.right(env);
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
