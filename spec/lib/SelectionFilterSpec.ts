
/* tslint:disable: no-console */

import * as _ from "lodash";

import { SelectionFilteringEngine, CandidateGroup } from "../../src/client/lib/SelectionFilteringEngine";
import { pp } from "../../src/client/lib/utils";

interface IHeaders {
    tags: string;
    name: string;
}

interface ILogEntry {
    logType: string;
    page: number;
    headers: IHeaders;
}

function candidateGroup(name: string, tags: string): CandidateGroup {
    const candidates = _.map(
        _.range(0, 10), (i) => {
            return {
                page: i,
                logType: "Geometry",
                headers: {
                    tags: `${tags} #${i}`,
                    name: `${name}${i+1}`
                }
            };
        });

    const cset: CandidateGroup = {
        name,
        candidates,
        keyFunc: (c: ILogEntry) => {
            return `page=${c.page} tags=${c.headers.tags}`;
        }
    };

    return cset;
}


describe("Selection Narrowing/Filtering", () => {

    it("return correct # of results", () => {
        const cs1 = candidateGroup("foo", "alex");
        const cs2 = candidateGroup("bar", "blob");
        const cs3 = candidateGroup("foo", "alex");

        const filterEngine = new SelectionFilteringEngine([cs1, cs2]);


        expect(filterEngine.search("al").length).toEqual(10);
        expect(filterEngine.search("ex #3").length).toEqual(1);
        expect(filterEngine.search("3").length).toEqual(2);
        expect(filterEngine.search("l").length).toEqual(20);

        // TODO empty query should not return results.
        const r = filterEngine.query("3");

        console.log("queryResults", pp(r));

    });
});

// beforeEach(function () {
//     jasmine.addMatchers({
//         toBePlaying: function () {
//             return {
//                 compare: function (actual, expected) {
//                     var player = actual;

//                     return {
//                         pass: player.currentlyPlayingSong === expected && player.isPlaying
//                     }
//                 }
//             };
//         }
//     });
// });
