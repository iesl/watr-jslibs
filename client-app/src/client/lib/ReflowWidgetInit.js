"use strict";
/**
 *
 **/
exports.__esModule = true;
/* global require _ watr  */
var shared_state_1 = require("./shared-state");
var ReflowWidget = require("./ReflowWidget");
var TextGridCompanion = watr.textgrid.TextGrid.Companion;
var TGI = watr.textgrid.TextGridInterop;
/* Return existing text grid (or undefined) for selectedZone */
function getTextGridForSelectedZone(selectedZone) {
    var annotId = selectedZone.annotId;
    var zoneLabel = selectedZone.label;
    var maybeExistingGrid = _.find(shared_state_1.shared.zones, function (z) { return z.annotId === annotId; });
    if (maybeExistingGrid !== undefined && maybeExistingGrid.glyphDefs !== null) {
        var textGrid = TextGridCompanion.fromJsonStr(JSON.stringify(maybeExistingGrid.glyphDefs));
        var res = {
            textGrid: textGrid,
            annotId: annotId,
            zoneLabel: zoneLabel
        };
        return res;
    }
    return undefined;
}
exports.getTextGridForSelectedZone = getTextGridForSelectedZone;
/* Create new text grid for selected zone */
function createTextGridFromSelectedZone(selectedAnnot, glyphs) {
    console.log('createTextGridFromSelectedZone', selectedAnnot, glyphs);
    var annotId = selectedAnnot.annotId;
    var zoneLabel = selectedAnnot.label;
    // const hits = rtrees.searchPage(selectedAnnot.pageNum, selectedAnnot);
    var tuples = _.map(glyphs, function (hit) {
        var g = hit.gridDataPt;
        return [g.row, g.col, g.gridRow];
    });
    var byRows = _.groupBy(tuples, function (t) { return t[0]; });
    var clippedGrid = _.map(_.toPairs(byRows), function (_a) {
        var rowNum = _a[0], rowTuples = _a[1];
        var cols = _.map(rowTuples, function (t) { return t[1]; }), minCol = _.min(cols), maxCol = _.max(cols), gridRow = rowTuples[0][2], text = gridRow.text.slice(minCol, maxCol + 1), loci = gridRow.loci.slice(minCol, maxCol + 1);
        return [parseInt(rowNum), text, loci];
    });
    var sortedRows = _.sortBy(clippedGrid, function (g) { return g[0]; });
    var rowData = _.map(sortedRows, function (g) {
        var gfiltered = _.map(g[2], function (go) {
            return _.pick(go, ['g', 'i']);
        });
        return {
            text: g[1],
            loci: gfiltered
        };
    });
    var data = {
        stableId: shared_state_1.shared.currentDocument,
        rows: rowData
    };
    var textGrid = TextGridCompanion.fromJsonStr(JSON.stringify(data));
    var res = {
        textGrid: textGrid,
        annotId: annotId,
        zoneLabel: zoneLabel
    };
    return res;
}
exports.createTextGridFromSelectedZone = createTextGridFromSelectedZone;
function showGrid(textGridDef, serverExchange) {
    // Get rid of any currently displayed grid
    ReflowWidget.unshowGrid();
    var textGrid = textGridDef.textGrid, annotId = textGridDef.annotId, zoneLabel = textGridDef.zoneLabel;
    var allSchemas = _.map(shared_state_1.shared.curations, function (c) { return c.labelSchemas; });
    var matchingSchemas = _.filter(allSchemas, function (s) {
        return _.some(s.schemas, function (c) { return c.label === zoneLabel; });
    });
    var schema = matchingSchemas[0];
    var localSchema = Object.assign({}, schema);
    localSchema.schemas = _.filter(schema.schemas, function (s) { return s.label === zoneLabel; });
    localSchema.schemas = localSchema.schemas[0].children;
    var labelSchema = TGI.labelSchemas.schemasFromJson(JSON.stringify(localSchema));
    var reflowWidget = new ReflowWidget.ReflowWidget('reflow-controls', textGrid, labelSchema, annotId, zoneLabel, serverExchange);
    shared_state_1.shared.activeReflowWidget = reflowWidget;
    return reflowWidget.init();
}
exports.showGrid = showGrid;
