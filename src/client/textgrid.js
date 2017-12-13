/**
 *
 **/

/* global require _ */

import { shared } from './shared-state';
import * as rtrees from  './rtrees.js';


export function createTextGrid(gridData) {
    return new TextGrid(gridData);
}

export function createFromCurrentSelection() {
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

class TextGrid {
    constructor (gridData) {
        this._gridData = gridData;
    }


    get gridData() { return this._gridData; }
    get gridRows() { return this._gridData.rows; }

    splitGridData(splitFocusPt) {
        let focusRow = splitFocusPt.row;
        let focusCol = splitFocusPt.col;
        let splitRows = _.flatMap(this.gridData.rows, (gridRow, rowNum) => {
            if (focusRow == rowNum) {
                let text0 = gridRow.text.slice(0, focusCol);
                let loci0 = gridRow.loci.slice(0, focusCol);
                let text1 = gridRow.text.slice(focusCol, gridRow.text.length);
                let loci1 = gridRow.loci.slice(focusCol, gridRow.loci.length);
                return [
                    {text: text0, loci: loci0},
                    {text: text1, loci: loci1}
                ];
            } else {
                return [gridRow];
            }

        });

        this._gridData = {
            rows: splitRows
        };
    }

    labelRow(rowLoci, labelChoice) {
        if (rowLoci.length == 1) {
            _.merge(rowLoci[0], {bio: [`U::${labelChoice}`]});
        } else if (rowLoci.length > 1) {
            _.each(rowLoci, (cell, col) => {
                let label = `B::${labelChoice}`;
                if (col==rowLoci.length-1) {
                    label = `L::${labelChoice}`;
                } else if (col > 0){
                    label = `I::${labelChoice}`;
                }
                _.merge(cell, {bio: [label]});
            });
        }
    }

    labelGridData(focalPt, labelChoice) {
        let focusRow = focalPt.row;
        _.each(this.gridData.rows, (gridRow, rowNum) => {
            if (focusRow == rowNum) {
                // let locFmtA = {g: [['d', 1, [1, 2, 10, 20]]]};
                // let locFmtB = {i: ['d', 1, [1, 2, 10, 20]]};
                this.labelRow(gridRow.loci, labelChoice);
            }
        });
    }


    computeLabelSet() {
        let gridLabels =
            _.uniq(
                _.flatMap(this.gridData.rows, (gridRow) => {
                    let bioLabels = _.flatMap(gridRow.loci, l => l.bio? l.bio: []);
                    let uniqLabels = _.map(_.uniq(bioLabels), bio => {
                        let [pin, label] = bio.split("::");
                        return label;
                    });
                    return uniqLabels;
                })
            );
        return gridLabels;
    }

}
