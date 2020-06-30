import "chai";
import _ from "lodash";
// import { prettyPrint } from 'commons';
import { toQualifiedPaths, toObjectPath } from './to-pairs-deep';

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


  it("should create a list of all paths/values in object", () => {
    const examples = [
      sampleRec,
      {
        a0: {
          b0: ['c0', 'c1'],
          b1: ['c2', 'c3'],
        },
        a1: {
          b0: 42,
          b1: 'Forty Two',
        },
      },
    ];

    _.each(examples, example => {
      const pathPairs = toQualifiedPaths(example);
      _.each(pathPairs, (qualPath) => {
        const [, value] = qualPath;
        const opath = toObjectPath(qualPath);
        if (value) {
          const recValue = _.get(example, opath);
          expect(recValue).toBe(value);
        }
      });

      // prettyPrint({ example, pathPairs });
    });
  });
})
