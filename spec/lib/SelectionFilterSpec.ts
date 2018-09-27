
import * as sf from "../../src/client/lib/SelectionFilterEngine";
// let sf = require("../../src/client/lib/SelectionFilter");
// let sf = require("../../../src/client/lib/SelectionFilter");

// const geometryLog = {
//     page: 0,
//     logType: "Geometry",
//     body: [],
//     headers: {
//         timestamp: 1537553328946,
//         tags: "Deleted Intersect Image Bounds",
//         callSite: "indexImageRegionsAndDeleteOverlaps",
//         name: ""
//     }
// };

// const relationLog = {
//     page: 0,
//     logType: "Relation",
//     body: [22972, [["MOOKAP+AdvPSTimx99", 0, 45]]],
//     headers: {
//         timestamp: 1537553328946,
//         tags: "Deleted Intersect Image Bounds",
//         callSite: "indexImageRegionsAndDeleteOverlaps",
//         name: ""
//     }
// };

describe("Selection Narrowing/Filtering", () => {
    it("should construct a filtering engine", () => {
        const filterEngine = new sf.SelectionFilteringEngine();
    });
});

