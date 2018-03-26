/**
 *
 **/

/* global require _ watr  */

import {shared} from './shared-state';
import * as ReflowWidget from  './ReflowWidget.js';
import * as rtrees from  './rtrees.js';

let TextGridCompanion = watr.textgrid.TextGrid.Companion;
const TGI = watr.textgrid.TextGridInterop;


/* Return existing text grid (or undefined) for selectedZone */
export function getTextGridForSelectedZone(selectedZone) {
    let annotId = selectedZone.annotId ;
    let zoneLabel = selectedZone.label;
    let maybeExistingGrid = _.find(shared.zones, z => z.annotId == annotId);

    if (maybeExistingGrid !== undefined && maybeExistingGrid.glyphDefs !== null) {
        let textGrid = TextGridCompanion.fromJsonStr(
            JSON.stringify(maybeExistingGrid.glyphDefs)
        );

        let res = {
            textGrid: textGrid,
            annotId: annotId,
            zoneLabel: zoneLabel
        };

        return res;
    }
    return undefined;
}


/* Create new text grid for selected zone */
export function createTextGridFromSelectedZone(selectedAnnot, glyphs) {

    console.log('createTextGridFromSelectedZone', selectedAnnot, glyphs);

    let annotId = selectedAnnot.annotId ;
    let zoneLabel = selectedAnnot.label;
    // let hits = rtrees.searchPage(selectedAnnot.pageNum, selectedAnnot);

    let tuples = _.map(glyphs, hit => {
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

            return [parseInt(rowNum), text, loci];
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
        annotId: annotId,
        zoneLabel: zoneLabel
    };

    return res;


}

export function showGrid(textGridDef, serverExchange) {
    // Get rid of any currently displayed grid
    ReflowWidget.unshowGrid();

    let {textGrid, annotId, zoneLabel} = textGridDef;

    let allSchemas = _.map(shared.curations, c => c.labelSchemas);

    let matchingSchemas = _.filter(allSchemas, s => {
        return _.some(s.schemas, c => c.label === zoneLabel);
    });

    let schema = matchingSchemas[0];
    let localSchema = Object.assign({}, schema);
    localSchema.schemas = _.filter(schema.schemas, s => s.label === zoneLabel);

    localSchema.schemas = localSchema.schemas[0].children;

    let labelSchema = TGI.labelSchemas.schemasFromJson(JSON.stringify(localSchema));

    let reflowWidget = new ReflowWidget.ReflowWidget('reflow-controls', textGrid, labelSchema, annotId, zoneLabel, serverExchange);
    shared.activeReflowWidget = reflowWidget;

    return reflowWidget.init();
}
