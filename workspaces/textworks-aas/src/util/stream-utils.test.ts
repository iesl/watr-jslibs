import _ from "lodash";
import "chai/register-should";

import {prettyPrint} from "./pretty-print";
import {stanzaChunker, prettyPrintTrans} from "./stream-utils";
import es from "event-stream";
import pump from "pump";

describe("Stream utils ", () => {
  it("should turn stream of lines into stanzas (line groups)", async done => {
    const astr = es.readArray("{ a b c } { d } { e }".split(" "));

    const chunker = stanzaChunker(
      l => l === "{",
      l => l === "}",
    );
    const pipe = pump(astr, prettyPrintTrans("line"), chunker, err => {
      console.log("err", err);
    });

    pipe.on("data", (data: string) => {
      const lines = data.split('\n')
      prettyPrint({lines, data});
    });

    pipe.on("end", () => {
      prettyPrint({msg: "done"});
      done();
    });
  });
});
