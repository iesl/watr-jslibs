import _ from "lodash";


// import * as Arr from 'fp-ts/lib/Array';
// import * as Ap from 'fp-ts/lib/Apply';
// import * as E from 'fp-ts/lib/Either';
// import { pipe } from 'fp-ts/lib/pipeable';
// import { NonNegativeInteger } from "./io-utils";

export interface Field {
  name: string;
  evidence: string;
  value?: string;
  error?: string;
  complete?: boolean;
}


// type ExtractStageResult = E.Either<number, number>;
// type ExtractStage = (e: E.Either<number, number>) => E.Either<number, number>

// export function extractionPipe(
//   ...stages: ExtractStage[]
// ): void {

// }

// export function filterUrl(
//   url: string | RegExp
// ): ExtractStage {

// }
