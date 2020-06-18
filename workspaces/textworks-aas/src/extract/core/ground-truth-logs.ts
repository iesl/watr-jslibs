
import _ from "lodash";
import fs from "fs-extra";
import { ExtractionLog } from './extraction-records';

export interface GroundTruthLog {
  original: ExtractionLog;
  correct: ExtractionLog;
  incorrect: ExtractionLog;
  added: ExtractionLog;
  notes: string[];
}

export function loadGroundTruthLog(path: string): GroundTruthLog | undefined {
  if (!fs.existsSync(path)) {
    return;
  }
  return fs.readJsonSync(path);
}

export function saveGroundTruthLog(path: string, log: GroundTruthLog): void {
  if (fs.existsSync(path)) {
    fs.removeSync(path);
  }
  fs.writeJsonSync(path, log);
}
export function initGroundTruthLog(extractionLog: ExtractionLog): GroundTruthLog {
  return {
    original: extractionLog,
    correct: {},
    incorrect: {},
    added: {},
    notes: [],
  };
}

export function labelGroundTruth(log: GroundTruthLog, entryRE: RegExp, asTrue: boolean): GroundTruthLog {
  const keyValPairs = _.toPairs(log.original);
  const labeled = _.filter(keyValPairs, ([key]) => {
    return entryRE.test(key);
  });
  const labeledRec = _.fromPairs(labeled);
  const toMerge = asTrue ? { correct: labeledRec } : { incorrect: labeledRec };
  const updated = _.merge({}, log, toMerge)
  return updated;
}

export function addGroundTruthRec(log: GroundTruthLog, rec: ExtractionLog): GroundTruthLog {
  return _.merge({}, log, { added: rec })
}
