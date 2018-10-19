
/* tslint:disable: no-console */

import * as _ from "lodash";

import { SelectionFilteringEngine, CandidateGroup } from "./FilterEngine";
// import { pp } from "../../src/client/lib/utils";
import { expect } from 'chai';
export function pp(a: any): string {
    return JSON.stringify(a, undefined, 2);
}


interface ILogEntry {
    logType: string;
    page: number;
    tags: string;
    name: string;
}

function candidateGroupF(
    name: string,
    tags: string,
    groupKeyFunc: (c: ILogEntry) => string[]
): CandidateGroup {
    const candidates = _.map(
        _.range(0, 3), (i) => {
            return {
                page: i,
                logType: "Geometry",
                tags: `${tags} #${i}`,
                name: `${name}${i+1}`
            };
        });

    const cset: CandidateGroup = {
        candidates,
        groupKeyFunc
    };

    return cset;
}
function candidateGroup(
    name: string,
    tags: string
): CandidateGroup {
    return candidateGroupF(
        name, tags,
        (c: ILogEntry) => {
            return [name, `page=${c.page}`, `${c.tags}`];
        }
    );
}

function createFilter(cgs: CandidateGroup[]) {
    return new SelectionFilteringEngine(cgs);
}

describe("Selection Narrowing/Filtering", () => {
    const cs1 = candidateGroup("foo", "alex");
    const cs2 = candidateGroup("bar", "blob");
    const cs3 = candidateGroup("foo", "alex");


    const g1 = candidateGroupF("foo", "alex", (g) => ["foo", g.page.toString()]);
    const g2 = candidateGroupF("foo", "greg", (g) => ["foo", g.page.toString()]);
    const g3 = candidateGroupF("bar", "greg", (g) => ["bar", g.page.toString()]);

    it("raw search should return correct # of results", () => {

        const filterEngine = createFilter([cs1, cs2]);

        expect(filterEngine.search("al").length).to.equal(3);
        expect(filterEngine.search("ex #2").length).to.equal(1);
        expect(filterEngine.search("2").length).to.equal(2);
        expect(filterEngine.search("l").length).to.equal(6);

    });

    it("groups entries together based on group key function", () => {


        expect(createFilter([g1, g2, g3]).query("2").length)
            .to.equal(2);

        expect(createFilter([g1, g2]).query("2").length)
            .to.equal(1);

    });

    it("reports the unique (grouped) entry names", () => {
        const groupNames = _.map(createFilter([g1, g2, g3]).query("2"), (g) => g.keystr);
        expect(groupNames).to.eql(["bar 2", "foo 2"]);
    });

    it("reports the unique (grouped) entry names", () => {
        const groupNames = _.map(createFilter([g1, g2]).query("2"), (g) => g.keystr);
        expect(groupNames).to.deep.equal(["foo 2"]);
    });

    it("reports the available query terms, both hit and miss", () => {
        const filterEngine = createFilter([g1, g2, g3]);
        const r = filterEngine.query("2");
        console.log(pp(r));
        //
    });

    it("properly parses queries, strips whitespace", () => {
        // TODO empty query should not return results.
        //
    });
});
