import "chai";

import { createPump } from "./stream-pump";
import { arrayStream } from './stream-utils';

describe("Pump Builder", () => {

  it("return pump as a promise", async done => {
    const astr = arrayStream("0 1 2 -30 100".split(" "));
    const expected = [0, 1, 2, -30, 100];
    const pumpBuilder = createPump()
      .viaStream<string>(astr)
      .throughF((d) => parseInt(d))
      .onData((d) => {
        const n = expected.shift();
        // prettyPrint({ msg: `data ${typeof d}: ${d} `, n });
        expect(d).toBe(n);
      })
      // .onEnd(() => prettyPrint({ msg: `done!` }))
      ;

    const p = pumpBuilder.toPromise();

    return p.then(() => {
      console.log('promise complete!')
      done();
    });

  });

  it("should compose pipeline function with type safety", async done => {
    const f1: (s: string) => string[] = s => s.split(" ");
    const f2: (s: string[]) => number[] = s => s.map(s0 => parseInt(s0));
    const astr = arrayStream(["0 1 2 -30 100"]);
    const expected = [0, 1, 2, -30, 100];

    const pumpBuilder = createPump()
      .viaStream<string>(astr)
      .throughF(f1)
      .throughF(f2)
      .onData((d) => {
        // prettyPrint({ msg: `data (${typeof d})  `, d });
        expect(d).toEqual(expected);
      })
      .onEnd(() => done());

    pumpBuilder.start();
  });

});
