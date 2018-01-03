/**
 *
 **/

/* global require _ watr */

import { shared } from './shared-state';
import * as rtrees from  './rtrees.js';


export function createFromCurrentSelectionV0() {
    let selections = shared.currentSelections;

    let rowData = _.flatMap(selections, sel => {
        let hits = rtrees.searchPage(sel.pageNum, sel);

        let tuples = _.map(hits, hit => {
            let g = hit.gridDataPt;
            return [g.row, g.col, g.gridRow];
        });
        let byRows = _.groupBy(tuples, t => t[0]);

        let clippedGrid =
            _.map(_.toPairs(byRows), ([rowNum, rowTuples]) => {
                let cols    = _.map(rowTuples, t => t[1]),
                    minCol  = _.min(cols),
                    maxCol  = _.max(cols),
                    gridRow = rowTuples[0][2],
                    text    = gridRow.text.slice(minCol, maxCol+1),
                    loci    = gridRow.loci.slice(minCol, maxCol+1)
                ;

                return [rowNum, text, loci];
            });

        let sortedRows = _.sortBy(clippedGrid, g => g[0]);

        let rowData = _.map(sortedRows, g => {
            return {
                text: g[1],
                loci: g[2]
            };
        });

        return rowData;
    });

    let data = {
        rows: rowData
    };
    return new TextGrid(data);
}

