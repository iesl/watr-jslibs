/**
 *
 **/

/* global require _ watr */

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
            let gfiltered = _.map(g[2], go => {
                return _.pick(go, ['g', 'i']);
            });

            return {
                text: g[1],
                loci: gfiltered
            };
        });

        return rowData;
    });

    let data = {
        stableId: shared.currentDocument,
        rows: rowData
    };

    let TextGridCompanion = watr.textgrid.TextGrid.Companion;
    console.log('griddata', data);
    let sjsGrid = TextGridCompanion.fromJsonStr(
        JSON.stringify(data)
    );

    console.log('sjsGrid', sjsGrid);
    return sjsGrid;
}

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

/**
 *
 *
 * GridData   :: { rows: [Row] }
 * Row        :: [Cell]
 * Cell       :: {bio: [], g: G, gridDataPt: GridDataPt}
 *             | {bio: [], i: I, gridDataPt}
 * G          :: [charloc,..... ]
 * I          :: charloc
 * Charloc    :: ['c', 0, bbox]
 * Bbox       ::[l, t, w, h]
 * GridDataPt ::
 *
 */

class TextGrid {
    constructor (gridData) {
        this._gridData = gridData;
    }


    get gridData() { return this._gridData; }
    get gridRows() { return this._gridData.rows; }

    joinRows(row) {
        let len = this.gridRows.length;
        if (row < len-1) {
            let pre = this.gridRows.slice(0, row);
            let post = this.gridRows.slice(row+2);
            let r1 = this.gridRows[row];
            let r2 = this.gridRows[row+1];
            let r12 = {
                text: r1.text + r2.text,
                loci: _.concat(r1.loci, r2.loci)
            };
            this._gridData = {
                rows: _.concat(pre, r12, post)
            };
        }
    }

    splitRow(row, col) {
        let splitRows = _.flatMap(this.gridRows, (gridRow, rowNum) => {
            if (row == rowNum) {
                let text0 = gridRow.text.slice(0, col);
                let loci0 = gridRow.loci.slice(0, col);
                let text1 = gridRow.text.slice(col, gridRow.text.length);
                let loci1 = gridRow.loci.slice(col, gridRow.loci.length);
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
        console.log('rowLoci', rowLoci);
        if (rowLoci.length == 1) {
            rowLoci[0].bio.push(`U::${labelChoice}`);
        } else if (rowLoci.length > 1) {
            _.each(rowLoci, (cell, col) => {
                let label = `B::${labelChoice}`;
                if (col==rowLoci.length-1) {
                    label = `L::${labelChoice}`;
                } else if (col > 0){
                    label = `I::${labelChoice}`;
                }
                cell.bio.push(label);
            });
        }
    }

    labelGridData(focalPt, labelChoice) {
        let focusRow = focalPt.row;
        _.each(this.gridRows, (gridRow, rowNum) => {
            if (focusRow == rowNum) {
                // let locFmtA = {g: [['d', 1, [1, 2, 10, 20]]]};
                // let locFmtB = {i: ['d', 1, [1, 2, 10, 20]]};
                this.labelRow(gridRow.loci, labelChoice);
            }
        });
    }

    computeLabelBoundingBoxes() {
        let boxes = {};
        _.each(this.gridRows, (gridRow, row) => {
            _.each(gridRow.loci, (loci, col) => {
                let bios = loci.bio || [];
                _.each(bios, bio => {
                    let [pin, label] = bio.split("::");
                    let index = [row,col];
                    let gridPt = loci.gridDataPt;
                    let cell = {
                        left: 0, top: 0,
                        width: gridPt.width,
                        height: gridPt.height
                    };
                    switch (pin) {
                    case "B":
                        // boxes[index] =
                        break;
                    case "I":
                        break;
                    case "O":
                        break;
                    case "L":
                        break;
                    case "U":
                        break;
                    }
                });

            });
        });
    }

    computeLabelSet() {
        let gridLabels =
            _.uniq(
                _.flatMap(this.gridRows, (gridRow) => {
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
