/**
 *
 **/

/* global require _ watr  */
import * as _ from 'lodash';

import { shared } from './shared-state';
import * as ReflowWidget from  './ReflowWidget';

const TextGridCompanion = watr.textgrid.TextGrid.Companion;
const TGI = watr.textgrid.TextGridInterop;


/* Return existing text grid (or undefined) for selectedZone */
export function getTextGridForSelectedZone(selectedZone) {
    const annotId = selectedZone.annotId ;
    const zoneLabel = selectedZone.label;
    const maybeExistingGrid = _.find(shared.zones, z => z.annotId === annotId);

    if (maybeExistingGrid !== undefined && maybeExistingGrid.glyphDefs !== null) {
        const textGrid = TextGridCompanion.fromJsonStr(
            JSON.stringify(maybeExistingGrid.glyphDefs)
        );

        const res = {
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

    const annotId = selectedAnnot.annotId ;
    const zoneLabel = selectedAnnot.label;
    // const hits = rtrees.searchPage(selectedAnnot.pageNum, selectedAnnot);

    const tuples = _.map(glyphs, hit => {
        const g = hit.gridDataPt;
        return [g.row, g.col, g.gridRow];
    });

    const byRows = _.groupBy(tuples, t => t[0]);

    const clippedGrid =
        _.map(_.toPairs(byRows), ([rowNum, rowTuples]) => {
            const cols    = _.map(rowTuples, t => t[1]),
                minCol  = _.min(cols),
                maxCol  = _.max(cols),
                gridRow = rowTuples[0][2],
                text    = gridRow.text.slice(minCol, maxCol+1),
                loci    = gridRow.loci.slice(minCol, maxCol+1)
            ;

            return [parseInt(rowNum), text, loci];
        });

    const sortedRows = _.sortBy(clippedGrid, g => g[0]);

    const rowData = _.map(sortedRows, g => {
        const gfiltered = _.map(g[2], go => {
            return _.pick(go, ['g', 'i']);
        });

        return {
            text: g[1],
            loci: gfiltered
        };
    });


    const data = {
        stableId: shared.currentDocument,
        rows: rowData
    };

    const textGrid = TextGridCompanion.fromJsonStr(
        JSON.stringify(data)
    );

    const res = {
        textGrid: textGrid,
        annotId: annotId,
        zoneLabel: zoneLabel
    };

    return res;


}

export function showGrid(textGridDef, serverExchange) {
    // Get rid of any currently displayed grid
    ReflowWidget.unshowGrid();

    const {textGrid, annotId, zoneLabel} = textGridDef;

    const allSchemas = _.map(shared.curations, c => c.labelSchemas);

    const matchingSchemas = _.filter(allSchemas, s => {
        return _.some(s.schemas, c => c.label === zoneLabel);
    });

    const schema = matchingSchemas[0];
    const localSchema = Object.assign({}, schema);
    localSchema.schemas = _.filter(schema.schemas, s => s.label === zoneLabel);

    localSchema.schemas = localSchema.schemas[0].children;


    const labelSchema = TGI.labelSchemas.schemasFromJson(JSON.stringify(localSchema));

    const reflowWidget = new ReflowWidget.ReflowWidget('reflow-controls', textGrid, labelSchema, annotId, zoneLabel, serverExchange);
    shared.activeReflowWidget = reflowWidget;

    return reflowWidget.init();
}
