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

let nextAnnotId = util.IdGenerator();

export function mkAnnotation(props) {
    return Object.assign({id: nextAnnotId()}, props);
}

export function updateAnnotationShapes() {
    server.getAnnotations().then(annotations =>{
        refreshZoneHightlights(annotations.zones);
    });
}

export function refreshZoneHightlights(zonesJs) {
    let zones = _.map(zonesJs, (z) => dt.zoneFromJson(z));
    rtrees.initPageLabelRTrees(zones);

    d3 .selectAll('.annotation-rect')
       .remove();

    _.each(zones, zone => {
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
                        targets: ser
                    }
                };

                server.postNewLabel(labelData)
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





export function createTextGridLabeler(boxes) {
    let labelNames = [
        'Title',
        'Authors',
        'Abstract',
        'Affiliations',
        'References'
    ];

    let idAttr = "unset";
    let buttons = _.map(labelNames, labelButton);
    console.log('buttons', buttons);

    let form =
        t.form({action: '/api/v1/label', method: 'POST', enctype:'multipart/form-data'}, [
            t.input(':hidden', '@selectedLabel', '#selectedLabel'),
            t.div(".form-group", buttons)
        ]);

    console.log('form', form);

    let $labeler =
        t.div('.modal', '.fade', `#${idAttr}`, {tabindex:"-1", role: "dialog", "aria-labelledby":  `${idAttr}Label`, 'aria-hidden': true}, [
            t.div(".modal-dialog",{role: "document"}, [
                t.div(".modal-content", [
                    t.div(".modal-header", [
                        t.span("Choose Label")
                    ]),
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

        // let ser = _.map(annotation.targets, t => {
        //     return {
        //         page: t[0],
        //         bbox: t[1].intRep
        //     };
        // });

        let labelChoice = $('#selectedLabel').attr('value');

        let labelData = {
            stableId: globals.currentDocument,
            labelChoice: labelChoice,
            selection: {
                annotType: "TODO",
                targets: []
            }
        };

        server.postNewLabel(labelData)
            .then((res) => {

                console.log('posted char label',  res);

                $labeler.modal('hide');

                d3.selectAll('.label-selection-rect').remove();

                updateAnnotationShapes();
            });
    });
    return $labeler;
}
