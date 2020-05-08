import "chai/register-should";

import _ from "lodash";
import { splitCSVRecord } from './workflow';

describe("Workflows", () => {

  it("should split a messy CSV record", () => {
    const examples = [
      "note1,dblp2,Messy field 3, https://zz.xx",
      "note1,dblp2,Mess,y field 3, https://zz.xx",
      "note1,dblp2,Messy ,fi,eld 3,, https://zz.xx",
    ];

    _.each(examples, example => {
      const res = splitCSVRecord(example);

      expect(res['noteId']).toBe('note1');
      expect(res['dblpConfId']).toBe('dblp2');
      expect(res['url']).toBe('https://zz.xx');
      // prettyPrint({ res });
    });
  });
});


