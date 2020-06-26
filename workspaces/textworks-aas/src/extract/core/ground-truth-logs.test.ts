import "chai/register-should";

import _ from "lodash";
import { ExtractionLog } from '~/extract/core/extraction-records';
import { initGroundTruthLog,  } from '~/extract/core/ground-truth-logs';

describe("Q/A Logging tests", () => {

  it("should create ground-truth logs", () => {
    const initLog: ExtractionLog = {
      'a.a': 'aa-value',
      'a.b': 'ab-value',
      'c.a': 'ca-value',
    };

    const groundTruthLog = initGroundTruthLog(initLog);

    expect(groundTruthLog).toMatchObject({
      original: initLog,
      correct: {},
      incorrect: {},
      added: {}
    });

    const allTrue = labelGroundTruth(groundTruthLog, /.*/, true);
    expect(allTrue).toMatchObject({
      original: initLog,
      correct: initLog,
      incorrect: {},
      added: {}
    });

    const asTrue = labelGroundTruth(groundTruthLog, /^a/, true);
    expect(asTrue).toMatchObject({
      original: initLog,
      correct: {
        'a.a': 'aa-value',
        'a.b': 'ab-value',
      },
      incorrect: {},
      added: {}
    });

    const csTrue = labelGroundTruth(groundTruthLog, /^c/, true);
    expect(csTrue).toMatchObject({
      original: initLog,
      correct: {
        'c.a': 'ca-value',
      },
      incorrect: {},
      added: {}
    });

    const abFalse = labelGroundTruth(groundTruthLog, /^a.b$/, false);
    expect(abFalse ).toMatchObject({
      original: initLog,
      correct: {},
      incorrect: {
        'a.b': 'ab-value',
      },
      added: {}
    });
  });
});
