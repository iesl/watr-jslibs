/**
 *
 **/


import * as d3 from  'd3';
import * as $ from  'jquery';
import * as _ from  'lodash';
import {globals} from './globals';
import * as dt from './datatypes';
import * as rtrees from './rtrees';
import * as util from './commons.js';
import * as server from './serverApi.js';

import {$id, t, icon} from './jstags.js';

// let nextAnnotId = util.IdGenerator();
import * as coords from './coord-sys.js';

export function mkAnnotation(props) {
    return props; // Object.assign({id: nextAnnotId()}, props);
}

export function updateAnnotationShapes() {
    server.getAnnotations().then(annotations =>{
        refreshZoneHightlights(annotations.zones);
    });
}

function mapGlyphLociToGridDataPts(glyphsLoci) {

    let dataPts = _.map(glyphsLoci, (charLocus) => {
        let pageNum = charLocus[0][0];
        let charBBox = charLocus[0][1];
        let pdfTextBox = charBBox? coords.mk.fromArray(charBBox) : undefined;
        // coords.mk.fromArray(charBBox) : undefined;

        let pageRTree = globals.pageImageRTrees[pageNum] ;
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
    server.getLabelingPanelWidget()
        .then(labelerHtml => {
            let $labeler = $(labelerHtml);

            $labeler.on('hidden.bs.modal', function () {
                $(this).remove();
            });


            $labeler.find('button.labelChoice').click(function() {
                let $button = $(this);
                $labeler.find('#selectedLabel')
                    .attr('value', $button.attr('value'));
            });

            $labeler.submit(function (event) {
                event.preventDefault();

                let ser = _.map(annotation.targets, t => {
                    return {
                        page: t[0],
                        bbox: t[1].intRep
                    };
                });

                let labelChoice = $('#selectedLabel').attr('value');

                let labelData = {
                    stableId: globals.currentDocument,
                    labelChoice: labelChoice,
                    selection: {
                        annotType: annotation.type,
                        page: annotation.page,
                        targets: ser
                    }
                };

                server.postNewRegionLabel(labelData)
                    .then(res => {
                        $labeler.modal('hide');

                        d3.selectAll('.label-selection-rect').remove();

                        updateAnnotationShapes();
                    });
            });

            $labeler.find('.modal-dialog').css({
                'position': 'absolute',
                'left': globals.currMouseClientPt.x + "px",
                'top': globals.currMouseClientPt.y + "px"
            });


            $labeler.modal();
        })
    ;

}


let labelButton = (label) => {
    return (
        t.button(
            `#${label}`, '.labelChoice .btn .btn-xs .btn-block .btn-default',
            "@labelChoice", ':submit', `=${label}`, [
                   t.small(label)
               ])
       );
   };





export function createTextGridLabeler(annotation) {
    let labelNames = [
        'Title',
        'Authors',
        'Abstract',
        'Affiliations',
        'References'
    ];

    let idAttr = "unset";
    let buttons = _.map(labelNames, labelButton);

    let form =
        t.form({action: '/api/v1/label/span', method: 'POST', enctype:'multipart/form-data'}, [
            t.input(':hidden', '@selectedLabel', '#selectedLabel'),
            t.div(".form-group", buttons)
        ]);


    let $labeler =
        t.div('.modal', '.fade', `#${idAttr}`, {tabindex:"-1", role: "dialog", "aria-labelledby":  `${idAttr}Label`, 'aria-hidden': true}, [
            t.div(".modal-dialog",{role: "document"}, [
                t.div(".modal-content", [
                    t.div(".modal-header",
                          t.span("Choose Label")
                    ),
                    t.div(".modal-body", [
                        form
                    ])
                ])
            ])
        ])
    ;

    $labeler.on('hidden.bs.modal', function () {
        $(this).remove();
    });


    $labeler.find('button.labelChoice').click(function() {
        let $button = $(this);
        $labeler.find('#selectedLabel')
            .attr('value', $button.attr('value'));
    });

    $labeler.submit(function (event) {
        event.preventDefault();

        let labelChoice = $('#selectedLabel').attr('value');

        let filteredTargets = util.filterLoci(annotation.targets);

        let labelData = {
            stableId: globals.currentDocument,
            labelChoice: labelChoice,
            targets: filteredTargets
        };

        server.postNewSpanLabel(labelData)
            .then((res) => {

                console.log('postNewLabel: ', res);
                $labeler.modal('hide');

                d3.selectAll('.label-selection-rect').remove();

                updateAnnotationShapes();
            });
    });
    return $labeler;
}
