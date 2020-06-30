import "chai";
import _ from "lodash";
import { toPairsDeep } from './view-files';
import { prettyPrint } from 'commons/dist';

describe("toPairsDeep implementation", () => {

  const sampleRec: Record<string, any> = {
    foo: "some foo value",
    quux: [
      {
        alpha: 'alpha',
        crux: null,
        crax: undefined,
        gamma: {
          romeo: 'capulet',
          houses: 2,
          priest: 'roman, but really not, I do not think',
        },
        baz: [
          {
            alpha: 'alpha',
            beta: 33,
          },
          'alpha',
          false,
          'gamma',
        ]
      }
    ],
    bar: "some bar value",
  };

  it.only("should create a list of all paths/values in object", () => {
    const deepPairs = toPairsDeep(sampleRec);
    _.each(deepPairs, (pathAndValue) => {
      if (pathAndValue.length === 3) {
        const [path, valueType, value] = pathAndValue;
        const recValue = _.get(sampleRec, path);
        expect(recValue).toBe(value);
      }
    });
    prettyPrint({ deepPairs });
  });

  it("should create a list of all paths/values in object", () => {
    const examples = [
      [],
      {},
      ['a', 1],
      { a: 1 },
      { l: [] },
      { m: {} },
    ];

    _.each(examples, example => {
      const deepPairs = toPairsDeep(example);
      _.each(deepPairs, (pathAndValue) => {
        if (pathAndValue.length === 3) {
          const [path, valueType, value] = pathAndValue;
          const recValue = _.get(example, path);
          expect(recValue).toBe(value);
        }
      });
      // prettyPrint({ example, deepPairs });

    });
  });
})
