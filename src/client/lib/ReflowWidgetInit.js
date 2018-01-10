/**
 *
 **/

/* global require _ watr  */

import {shared} from './shared-state';
import * as ReflowWidget from  './ReflowWidget.js';
import * as rtrees from  './rtrees.js';

let TextGridCompanion = watr.textgrid.TextGrid.Companion;
const TGI = watr.textgrid.TextGridInterop;


export function textGridForSelection(selection) {
    let zoneId = selection.zoneId ;
    let zoneLabel = selection.label;
    let maybeExistingGrid = _.find(shared.zones, z => z.zoneId == zoneId);

    if (maybeExistingGrid !== undefined && maybeExistingGrid.glyphDefs !== null) {
        let textGrid = TextGridCompanion.fromJsonStr(
            JSON.stringify(maybeExistingGrid.glyphDefs)
        );

        let res = {
            textGrid: textGrid,
            zoneId: zoneId,
            zoneLabel: zoneLabel
        };

        return res;
    }
    return undefined;
}


export function createFromSelection(selection) {

    let zoneId = selection.zoneId ;
    let zoneLabel = selection.label;
    let hits = rtrees.searchPage(selection.pageNum, selection);

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


    let data = {
        stableId: shared.currentDocument,
        rows: rowData
    };

    let textGrid = TextGridCompanion.fromJsonStr(
        JSON.stringify(data)
    );

    let res = {
        textGrid: textGrid,
        zoneId: zoneId,
        zoneLabel: zoneLabel
    };

    return res;


}

export function showGrid(textGridDef) {
    // Get rid of any currently displayed grid
    ReflowWidget.unshowGrid();

    let {textGrid, zoneId, zoneLabel} = textGridDef;

    let allSchemas = _.map(shared.curations, c => c.labelSchemas);

    let matchingSchemas = _.filter(allSchemas, s => {
        return _.some(s.schemas, c => c.label === zoneLabel);
    });

    let schema = matchingSchemas[0];
    let localSchema = Object.assign({}, schema);
    localSchema.schemas = _.filter(schema.schemas, s => s.label === zoneLabel);

    localSchema.schemas = localSchema.schemas[0].children;

    let labelSchema = TGI.labelSchemas.schemasFromJson(JSON.stringify(localSchema));

    let reflowWidget = new ReflowWidget.ReflowWidget('reflow-controls', textGrid, labelSchema, zoneId, zoneLabel);
    shared.activeReflowWidget = reflowWidget;

    return reflowWidget.init();
}
