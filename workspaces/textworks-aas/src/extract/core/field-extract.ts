import _ from "lodash";
import path from "path";

import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

import fs from "fs-extra";
import { readResolveFile, readResolveFileAsync } from '~/utils/file-utils';
import { runFileCmd } from '~/utils/run-cmd-file';
import { makeCssTreeNormalForm } from './html-to-css-normal';
import { runTidyCmdBuffered } from '~/utils/run-cmd-tidy-html';
import { ExtractionEnv, ExtractionFunction, NormalForm, extractionSuccess, fatalFailure, nonFatalFailure } from './extraction-process';
import { readMetaFile } from '../logging/logging';

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
      TE.rightTask(() => runFileCmd(file));

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


export const runHtmlTidy: ExtractionFunction =
  (env: ExtractionEnv) => {

    const { fileContentMap, entryPath } = env;

    const normType = 'html-tidy';

    if (normType in fileContentMap) {
      return TE.right(env);
    }

    const file = path.resolve(entryPath, 'response_body');

    const tidyOutput = runTidyCmdBuffered('./conf/tidy.cfg', file)
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


