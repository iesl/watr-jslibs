/**
 *
 **/


import _ from 'lodash';
import * as $ from 'jquery';
import * as d3 from 'd3';

import {shared} from './shared-state';
import * as rtrees from './rtrees';
import * as server from './serverApi';
import * as modals from './modals';
import * as d3x from './d3-extras';

import {t} from "./tstags";
import * as coords from './coord-sys';

// export function updateAnnotationShapes() {
//     return server.getDocumentAnnotations()
//         .then(zoneRecs => {
//             return refreshZoneHighlights(zoneRecs.zones);
//         });
// }

function mapGlyphLociToGridDataPts(glyphsLoci) {

    let dataPts = _.map(glyphsLoci, (charLocus) => {
        let charDef = charLocus.g ? charLocus.g[0] : charLocus.i;
        let pageNum = charDef[1];
        let charBBox = charDef[2];
        let pdfTextBox = charBBox? coords.mk.fromArray(charBBox) : undefined;

        let pageRTree = shared.pageImageRTrees[pageNum] ;
        let glyphDataPts = pageRTree.search(pdfTextBox);
        let gridDataPt = glyphDataPts[0].gridDataPt;
        return gridDataPt;
    });

    return dataPts;
}


function refreshZoneHighlights(zones) {
    shared.zones = zones;

    rtrees.initPageLabelRTrees(zones);

     d3.selectAll('.annotation-rect')
       .remove();

     d3.selectAll('.glyph-zone-highlight')
         .remove();

    _.each(zones, zone => {
        if (zone.glyphDefs !== null) {
            let glyphsLoci = _.flatMap(zone.glyphDefs.rows, r => r.loci);

            let gridDataPts = mapGlyphLociToGridDataPts(glyphsLoci);
            let gridDataByPage = _.groupBy(gridDataPts, p => p.page);
            _.each(gridDataByPage, pageGridData => {
                let pageNum = pageGridData[0].page;
                let textgridSvg = d3x.d3select.pageTextgridSvg(pageNum);

                textgridSvg
                    .selectAll(`.span${zone.zoneId}`)
                    .data(pageGridData)
                    .enter()
                    .append('rect')
                    .call(d3x.initRect, d => d)
                    .call(d3x.initFill, 'cyan', 0.2)
                    .classed(`span${zone.zoneId}`, true)
                    .classed('glyph-zone-highlight', true) ;

            });
        }

        _.each(zone.regions, region => {
            let svgPageSelector = `svg#page-image-${region.pageNum}`;

            d3.select(svgPageSelector)
                .selectAll(`#ann${zone.zoneId}_${region.regionId}`)
                .data([region])
                .enter()
                .append('rect')
                .call(d3x.initRect, r => r.bbox)
                .call(d3x.initStroke, 'blue', 1, 0.8)
                .call(d3x.initFill, 'purple', 0.2)
                .attr('id', `ann${zone.zoneId}_${region.regionId}`)
                .classed('annotation-rect', true)
                .classed(`ann${zone.zoneId}`, true)
            ;

        });


    });
 }

export function getSharedCurationLabels() {
    let labelNames = _.flatMap(shared.curations, c => {
        let topLabelNames = _.map(c.labelSchemas.schemas, ls => ls.label);
        topLabelNames.unshift('#'+c.workflow);
        return topLabelNames;
    });
    return labelNames;
}

export function createHeaderLabelUI(mbrSelection, page, containerId) {
    let labelNames = getSharedCurationLabels();

    return createLabelChoiceWidget(labelNames, containerId)
        .then(choice => {

            let labelChoice = choice.selectedLabel;

            let zoneData = {
                stableId: shared.currentDocument,
                labelChoice: labelChoice,
                target: {
                    page: page,
                    bbox: mbrSelection
                }
            };

            return zoneData;
        }) ;

}


let labelButton = (label) => {
    return t.button(
        `#${label} =${label} .labelChoice @labelChoice .btn-lightlink :submit`, [
            t.small(label)
        ]) ;
};

export function createLabelChoiceWidget(labelNames, containerId) {

    let buttons = _.map(labelNames, n => {
        if (n[0] === '#') {
            return t.span(n.slice(1));
        } else {
            return labelButton(n);
        }
    });

    let form =
        t.form([
            t.input(':hidden', '@selectedLabel', '#selectedLabel'),
            t.div(".form-group", buttons)
        ]);

    let context =  '#'+containerId;
    let innerPromise = modals.makeFormPromise(form);

    form.find('button.labelChoice').click(function() {
        let $button = $(this);
        form.find('#selectedLabel')
            .attr('value', $button.attr('value'));
    });

    let labelPromise = modals.makeModalPromise(
        context, innerPromise,
        form,
        "Choose Label"
    );

    let containerHeight = $(window).height();
    let dialogHeight = $('#modal-content').height(); // ('clientHeight');
    let maxY = containerHeight - dialogHeight;
    let yPos = Math.min(maxY, shared.currMouseClientPt.y);

    $('.b-modal-content').css({
        'left': shared.currMouseClientPt.x,
        'top': yPos
    });
    return labelPromise;
}
