//

import {
  PumpBuilder,
  createPump,
  throughFunc,
  initEnv,
  throughEnvFunc,
  filterEnvStream,
  throughAccum,
  handlePumpError,
  filterStream,
  tapStream,
  prettyPrintTrans,
  sliceStream,
  progressCount,
  createReadLineStream,
  stanzaChunker,
} from "./util/stream-utils";

export {
  PumpBuilder,
  createPump,
  throughFunc,
  initEnv,
  throughEnvFunc,
  filterEnvStream,
  throughAccum,
  handlePumpError,
  filterStream,
  tapStream,
  prettyPrintTrans,
  sliceStream,
  progressCount,
  createReadLineStream,
  stanzaChunker,
};

import {
  Radix,
  RadixPath,
  createRadix,
  radInsert,
  radUpsert,
  radGet,
  radTraverseValues
} from "./util/radix-tree";

export {
  Radix,
  RadixPath,
  createRadix,
  radInsert,
  radUpsert,
  radGet,
  radTraverseValues
};

import {
  prettyPrint,
} from "./util/pretty-print";

export {
  prettyPrint
};

import {
  progressLogger,
  BufferedLogger,
  initBufferedLogger
} from "./util/logging";

export {
  progressLogger,
  BufferedLogger,
  initBufferedLogger
};

import {
  csvStream
} from "./util/parse-csv";

export {
  csvStream
};

import {
  matchAll,
  highlightRegions,
  clipParagraph
} from "./util/string-utils";

export {
  matchAll,
  highlightRegions,
  clipParagraph
};

// import {
//   config,
//   yall,
//   setCwd,
//   existingDir,
//   existingFile,
//   configFile,
//   setOpt,
//   opt,
// } from "./cli/arglib"

export * as arglib from "./cli/arglib"
export * from "./corpora"
