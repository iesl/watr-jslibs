import _ from "lodash";
import { ExtractionLog } from './extraction-records';

export interface GroundTruthEntry {
  extractionLog: ExtractionLog;
  notes: string[];
}

export interface GroundTruthLog {
  entries: GroundTruthEntry[];
  notes: string[];
}


export function initGroundTruthEntry(extractionLog: ExtractionLog, ...notes: string[]): GroundTruthEntry {
  return {
    extractionLog,
    notes: [...notes],
  };
}

export function initGroundTruthLog(...notes: string[]): GroundTruthLog {
  return {
    entries: [],
    notes: [...notes]
  }
}

export function addGroundTruthEntry(log: GroundTruthLog, entry: GroundTruthEntry): void {
  log.entries.push(entry);
}
