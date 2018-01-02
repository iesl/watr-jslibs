/**
 *
 **/

/* global $ _ d3 */

import {shared} from './shared-state';
import * as dt from './datatypes';
import * as rtrees from './rtrees';
import * as util from './commons.js';
import * as server from './serverApi.js';
import * as modals from './modals.js';

import {t} from './jstags.js';

import * as coords from './coord-sys.js';

export function mkAnnotation(props) {
    return props; // Object.assign({id: nextAnnotId()}, props);
}

export function updateAnnotationShapes() {
    return server.getDocumentZones()
        .then(zoneRecs => refreshZoneHightlights(zoneRecs.zones));
}

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

export function refreshZoneHightlights(zonesJs) {
    let zones = _.map(zonesJs, (z) => dt.zoneFromJson(z));
    rtrees.initPageLabelRTrees(zones);

    d3 .selectAll('.annotation-rect')
       .remove();

    _.each(zones, zone => {
        if (zone.glyphDefs != null) {
            let glyphsLoci = _.flatMap(zone.glyphDefs.rows, r => r.loci);

            let gridDataPts = mapGlyphLociToGridDataPts(glyphsLoci);
            let gridDataByPage = _.groupBy(gridDataPts, p => p.page);
            _.each(gridDataByPage, pageGridData => {
                let pageNum = pageGridData[0].page;
                let textgridSvg = util.d3select.pageTextgridSvg(pageNum);

                textgridSvg
                        .selectAll(`.span${zone.zoneId}`)
                        .data(pageGridData)
                        .enter()
                        .append('rect')
                        .call(util.initRect, d => d)
                        .call(util.initStroke, 'cyan', 1, 0.1)
                        .call(util.initFill, 'green', 0.2)
                        .classed(`span${zone.zoneId}`, true)
                    ;

            });
        }

        _.each(zone.regions, region => {
            let svgPageSelector = `svg#page-image-${region.pageNum}`;

            d3.select(svgPageSelector)
                .selectAll(`#ann${zone.zoneId}_${region.regionId}`)
                .data([region])
                .enter()
                .append('rect')
                .call(util.initRect, r => r.bbox)
                .call(util.initStroke, 'blue', 1, 0.8)
                .call(util.initFill, 'purple', 0.3)
                .attr('id', `ann${zone.zoneId}_${region.regionId}`)
                .classed('annotation-rect', true)
                .classed(`ann${zone.zoneId}`, true)
            ;

        });


    });
}



export function createHeaderLabelUI(annotation) {
    let labelNames = [
        'Title',
        'Authors',
        'Abstract',
        'Affiliations',
        'References'
    ];

    createLabelChoiceWidget(labelNames)
        .then(choice => {
            console.log('choice', choice);

            let ser = _.map(annotation.targets, t => {
                return {
                    page: t[0],
                    bbox: t[1].intRep
                };
            });

            let labelChoice = choice.selectedLabel;

            let labelData = {
                stableId: shared.currentDocument,
                labelChoice: labelChoice,
                selection: {
                    annotType: annotation.type,
                    page: annotation.page,
                    targets: ser
                }
            };

            console.log('labelData', labelData);
            server.postNewRegionLabel(labelData)
                .then(res => {
                    d3.selectAll('.label-selection-rect').remove();
                    updateAnnotationShapes();
                })
                .catch(res => {
                    d3.selectAll('.label-selection-rect').remove();
                })
            ;

        })
        .catch(() => {
            d3.selectAll('.label-selection-rect').remove();
        })
    ;

}


let labelButton = (label) => {
    return t.button(
        `#${label} =${label} .labelChoice @labelChoice .btn-lightlink :submit`, [
            t.small(label)
        ]) ;
};

export function createLabelChoiceWidget(labelNames, containerId) {

    let buttons = _.map(labelNames, labelButton);

    let form =
        t.form([
            t.input(':hidden', '@selectedLabel', '#selectedLabel'),
            t.div(".form-group", buttons)
        ]);

    // let context = '#splitpane_root__bottom';
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

    $('.b-modal-content').css({
        'left': shared.currMouseClientPt.x,
        'top': shared.currMouseClientPt.y
    });
    return labelPromise;
}

