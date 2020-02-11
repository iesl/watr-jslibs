import _ from "lodash";

import pumpify from "pumpify";
import path from "path";
import fs from "fs-extra";

import es from "event-stream";
import {Stream} from "stream";
import urlparse from "url-parse";

import {
  newCorpusEntryStream,
  expandDirTrans,
  ExpandedDir,
} from "~/corpora/corpus-browser";

import {
  tapStream,
  progressCount,
  filterStream,
  throughFunc,
} from "~/util/stream-utils";

import {gatherAbstractFiles} from "~/corpora/bundler";
import {BufferedLogger, initBufferedLogger} from "~/util/logging";
import {extractAbstractTransform} from "~/extract/field-extract-abstract";

function resolveLogfileName(logpath: string, phase: string): string {
  return path.resolve(logpath, logfileName(phase));
}

function logfileName(phase: string): string {
  return `qa-review-${phase}-log.json`;
}

function initLogger(logpath: string, phase: string): BufferedLogger {
  const logname = resolveLogfileName(logpath, phase);
  if (fs.existsSync(logname)) {
    throw new Error(
      `log ${logname} already exists. Move or delete before running`,
    );
  }
  return initBufferedLogger(logname);
}

export function createFilteredLogStream(
  logfile: string,
  filters: RegExp[],
): Stream {
  const logReader: fs.ReadStream = fs.createReadStream(logfile);

  return pumpify.obj(
    logReader,
    es.split(),
    es.parse(),

    filterStream((chunk: any) => {
      if (filters.length === 0) return true;

      const statusLogs: string[] = chunk.message.logBuffer;
      return _.every(filters, f => _.some(statusLogs, l => f.test(l)));
    }),
  );
}

function sanityCheckAbstract(log: BufferedLogger, entryDir: ExpandedDir): void {
  const abstractFiles = gatherAbstractFiles(entryDir);
  const abstractStrs = _(abstractFiles)
    .flatMap(([filename, fields]) => {
      return _.map(fields, (f, i) => [filename, f.value, i] as const).filter(
        ([, v]) => v !== undefined,
      );
    })
    .map(([fn, f, i]) => [fn, f!.trim(), i])
    .value();

  if (abstractFiles.length === 0) {
    // No extraction files exist
    log.append("field.abstract.files=false");
  } else if (abstractStrs.length === 0) {
    // no discernable abstracts identified
    log.append("field.abstract.instance=false");
  } else {
    const uniqAbs = _.uniqBy(abstractStrs, v => v[1]);
    const uniqAbsCount = uniqAbs.length;
    const absCount = abstractStrs.length;
    // let entryStatus = "ok";

    log.append(`field.abstract.instance.count=${absCount}`);
    if (uniqAbsCount !== absCount) {
      log.append(`field.abstract.instance.uniq.count=${uniqAbsCount}`);
    }

    _.each(uniqAbs, ([filename, field, fieldNum]) => {
      let abstractStr = field as string;

      if (abstractStr == undefined) {
        return;
      }
      abstractStr = abstractStr.trim();
      const lowcase = abstractStr.toLowerCase();

      if (abstractStr.length < 40) {
        log.append(
          `field.abstract.instance[${filename}:${fieldNum}].length.not-ok`,
        );
      } else {
        log.append(
          `field.abstract.instance[${filename}:${fieldNum}].length.ok`,
        );
      }

      if (lowcase.startsWith("abstract")) {
        log.append(
          `field.abstract.instance[${filename}:${fieldNum}].startword.ok`,
        );
      }

      const filterExprs = [/abstract[ ]+unavailable/];

      _.each(filterExprs, exp => {
        if (exp.test(lowcase)) {
          log.append(
            `field.abstract.instance[${filename}:${fieldNum}].filter[${exp.source}].not-ok`,
          );
        }
      });
    });
  }
}

function reviewEntry(log: BufferedLogger, entryDir: ExpandedDir) {
  // const statusLogs: string[] = [];
  try {
    const propfile = path.join(entryDir.dir, "entry-props.json");
    if (!fs.existsSync(propfile)) return;

    const entryProps = fs.readJsonSync(
      path.join(entryDir.dir, "entry-props.json"),
    );

    const dblpId: string = entryProps.dblpConfId;
    const [, , venue, year] = dblpId.split("/");
    const url: string = entryProps.url;
    const urlp = urlparse(url);

    log.setHeader("entry", entryDir.dir);

    log.append(`entry.url.host=${urlp.host}`);
    log.append(`entry.venue=${venue}`);
    log.append(`entry.venue.year=${year}`);

    sanityCheckAbstract(log, entryDir);
  } catch (e) {
    console.log(`Error: `, e);
  }

  log.commitLogs();
}

interface ReviewCorpusArgs {
  corpusRoot: string;
  logpath: string;
  phase: string;
  prevPhase: string;
  filters?: string[];
}

export async function reviewCorpus({
  corpusRoot,
  logpath,
  phase,
  prevPhase,
}: ReviewCorpusArgs) {
  if (phase === "init") {
    return initReviewCorpus({corpusRoot, logpath});
  }
  interactiveReviewCorpus({corpusRoot, logpath, phase, prevPhase});
}

export async function interactiveReviewCorpus({
  // corpusRoot,
  logpath,
  phase,
  prevPhase,
  filters,
}: ReviewCorpusArgs) {
  const logger = initLogger(logpath, phase);
  // const prevLog = resolveLogfileName(logpath, prevPhase);

  const filterREs: RegExp[] =
    filters !== undefined ? filters.map(f => new RegExp(f)) : [];

  const logfile = resolveLogfileName(logpath, prevPhase);

  const pipef = pumpify.obj(
    createFilteredLogStream(logfile, filterREs),
    // Perform some custom action for each log:
    // e.g., run abstract extraction
    throughFunc((log: any) => log.message.entry),
    expandDirTrans,
    extractAbstractTransform(logger),
    // handlePumpError,
  );

  pipef.on("data", () => true);
}

function initReviewCorpus({
  corpusRoot,
  logpath,
}: Pick<ReviewCorpusArgs, "corpusRoot" | "logpath">) {
  const entryStream = newCorpusEntryStream(corpusRoot);
  const logger = initLogger(logpath, "init");
  const reviewFunc = _.curry(reviewEntry)(logger);
  const pipe = pumpify.obj(
    entryStream,
    // sliceStream(0, 100),
    progressCount(500),
    expandDirTrans,
    tapStream(reviewFunc),
    // handlePumpError,
  );

  pipe.on("data", () => {});
}
// body
//    h1 align='center'
//      | ServiceGlobe: Flexible and Reliable Web Services on the
//      |       Internet
//      a href='#foot8'
//        font size='+2'
//          sup
//            | 1
//    comment
//      ## Authors list
//    h6
//      | Markus Keidl
//      br
//      | Universität Passau
//      br
//      | 94030 Passau, Germany
//      br
//      | ++49 (851) 509-3065
//      br
//      a href='mailto:keidl@db.fmi.uni-passau.de'
//        | keidl@db.fmi.uni-passau.de
//    h6
//      | Stefan Seltzsam
//      br
//      | Universität Passau
//      br
//      | 94030 Passau, Germany
//      br
//      | ++49 (851) 509-3065
//      br
//      a href='mailto:seltzsam@db.fmi.uni-passau.de'
//        | seltzsam@db.fmi.uni-passau.de
//    h6
//      | Alfons Kemper
//      br
//      | Universität Passau
//      br
//      | 94030 Passau, Germany
//      br
//      | ++49 (851) 509-3060
//      br
//      a href='mailto:kemper@db.fmi.uni-passau.de'
//        | kemper@db.fmi.uni-passau.de
//    comment
//      ## End authors list
//    h3
//      | ABSTRACT
//    p
//      | We present dynamic service selection for reliable execution and deployment of Web services
//      |       and a generic dispatcher service which augments services with load balancing and high
//      |       availability features.
//    h3
//      | Keywords
//    p

// div .main-container
//     div
//       h2 .subtitle
//         | KODAK lMAGELINK™ OCR Alphanumeric Handprint Module
//       p
//         | Part of:
//         a href='/book/advances-in-neural-information-processing-systems-8-1995'
//           | Advances in Neural Information Processing Systems 8 (NIPS 1995)
//       a href='/paper/1104-kodak-lmagelinktm-ocr-alphanumeric-handprint-module.pdf'
//         | [PDF]
//       a href='/paper/1104-kodak-lmagelinktm-ocr-alphanumeric-handprint-module/bibtex'
//         | [BibTeX]
//       h3
//         | Authors
//       ul .authors
//         li .author
//           a href='/author/alexander-shustorovich-7011'
//             | Alexander Shustorovich
//         li .author
//           a href='/author/christopher-w-thrasher-7012'
//             | Christopher W. Thrasher
//       h3
//         | Abstract
//       p .abstract
//         | Abstract Missing
//       aside
//         h3
//           | Neural Information Processing Systems (NIPS)
//         p
//           | Papers published at the Neural Information Processing Systems Conference.

// span style='left: 255.407px; top: 362.932px; font-size: 19.925px; font-family: serif; transform: scaleX(0.857776);'
//     | Abstract
//   span style='left: 123.2px; top: 393.96px; font-size: 16.605px; font-family: serif; transform: scaleX(0.795301);'
//     | Dimensionality reduction plays a vital role in pat-
//   span style='left: 123.2px; top: 412.358px; font-size: 16.605px; font-family: serif; transform: scaleX(0.800381);'
//     | tern recognition. However, for normalized vector
//   span style='left: 123.2px; top: 430.557px; font-size: 16.605px; font-family: serif; transform: scaleX(0.795707);'
//     | data, existing methods do not utilize the fact that
//   span style='left: 123.2px; top: 448.756px; font-size: 16.605px; font-family: serif; transform: scaleX(0.76209);'
//     | the data is normalized. In this paper, we propose to
//   span style='left: 123.2px; top: 467.155px; font-size: 16.605px; font-family: serif; transform: scaleX(0.799703);'
//     | employ an Angular Decomposition of the normal-
//   span style='left: 123.2px; top: 485.354px; font-size: 16.605px; font-family: serif; transform: scaleX(0.786978);'
//     | ized vector data which corresponds to embedding
//   span style='left: 123.2px; top: 503.553px; font-size: 16.605px; font-family: serif; transform: scaleX(0.831791);'
//     | them on a unit surface.  On graph data for sim-

//   p .abstract
//     | We study the $\ell_0$-Low Rank Approximation Problem, where the goal is,    given an $m \times n$ matrix $A$, to output a rank-$k$ matrix $A'$ for which   $\|A'-A\|_0$ is minimized.    Here, for a matrix $B$, $\|B\|_0$ denotes the number of its non-zero entries.    This
//   aside
//     h3
//       | Neural Information Processing Systems (NIPS)
//     p
//       | Papers published at the Neural Information Processing Systems Conference.
// comment
//   ## #main

// div .article__body
//   comment
//     ## abstract content
//   div .hlFld-Abstract
//     a @abstract
//     div
//       div .colored-block__title
//         h2 #d10000208e1
//           | Abstract
//       div
//         div
//           p
//             | We show that any approach to develop optimum retrieval functions is based on two kinds of assumptions: first, a certain form of representation for documents and requests, and second, additional simplifying assumptions that predefine the type of the re
//             i
//               sub
