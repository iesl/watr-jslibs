import _ from "lodash";
import "chai/register-should";

import {prettyPrint} from "./pretty-print";
import {
  stanzaChunker,
  prettyPrintTrans,
  throughFunc,
  createPump,
} from "./stream-utils";
import es from "event-stream";
import pumpify from "pumpify";

describe("Stream utils ", () => {
  it("should properly catch pipeline errors", async done => {
    const astr = es.readArray("abcde".split(""));
    const pipe = pumpify.obj(astr, prettyPrintTrans("aabb"));

    pipe.on("data", (data: string) => {
      prettyPrint({data});
      done();
    });
  });

  it.only("should compose pipeline function with type safety", async done => {
    const f1: (s: string) => string[] = s => s.split(" ");
    const f2: (s: string[]) => number[] = s => s.map(s0 => parseInt(s0));
    const astr = es.readArray(["0 1 2 -30 100"]);

    // The new typesafe way:
    const pumpBuilder = createPump()
      .viaStream<string>(astr)
      .tap(d => prettyPrint({msg: '0', d}))
      .throughF(f1)
      .tap(d => prettyPrint({msg: '1', d}))
      .throughF(f2)
      .tap(d => prettyPrint({msg: '2', d}))
      .onData((d) => prettyPrint({msg: 'data', d}))
      .onEnd(() => done()) ;

    pumpBuilder.start();
  });

  it("should turn stream of lines into stanzas (line groups)", async done => {
    const astr = es.readArray("{ a b c } { d } { e }".split(" "));

    const chunker = stanzaChunker(
      l => l === "{",
      l => l === "}",
    );
    const pipe = pumpify.obj(
      astr,
      prettyPrintTrans("line"),
      chunker,
      (err: Error) => {
        console.log("err", err);
      },
    );

    pipe.on("data", (data: string) => {
      const lines = data.split("\n");
      prettyPrint({lines, data});
    });

    pipe.on("end", () => {
      prettyPrint({msg: "done"});
      done();
    });
  });
});
