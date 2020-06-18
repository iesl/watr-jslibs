//
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import * as Arr from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/pipeable';
import _ from "lodash";
import { MetaFile } from '../logging/logging';

export interface Field {
  name: string;
  evidence: string;
  value?: string;
  cleaning?: CleaningRuleResult[];
  error?: string;
  complete?: boolean;
}

interface NormalForms {
  'css-normal': null;
  'response-body': null;
  'html-tidy': null
}

export interface CleaningRule {
  name: string;
  precondition(str: string): boolean;
  run(str: string): string;

}

export interface CleaningRuleResult {
  input: string;
  output: string;
  rule: string;
}

export function applyCleaningRules(rules: CleaningRule[], abstractStr: string): [string, CleaningRuleResult[]] {
  let currentAbstract = abstractStr;
  const cleaningResults: CleaningRuleResult[] = [];
  _.each(rules, (rule) => {
    if (rule.precondition(currentAbstract)) {
      const cleaned = rule.run(currentAbstract);
      if (cleaned !== currentAbstract) {
        cleaningResults.push({
          input: currentAbstract,
          output: cleaned,
          rule: rule.name
        });
      }
      currentAbstract = cleaned;
    }
  });
  return [currentAbstract, cleaningResults];
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

export function extractionSuccess(result: ExtractionEnv): ExtractionResult {
  return TE.right<string, ExtractionEnv>(result);
}

export function fatalFailure(result: string): ExtractionResult {
  return TE.left<string, ExtractionEnv>(`FATAL: ${result}`);
}
export function nonFatalFailure(result: string): ExtractionResult {
  return TE.left<string, ExtractionEnv>(`WARN: ${result}`);
}

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
