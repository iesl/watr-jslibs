/**
 *
 **/

/* global  FormData */

import * as d3 from  'd3';
import * as $ from  'jquery';
import * as _ from  'lodash';
import {globals} from './globals';
import * as dt from './datatypes';
import * as rtrees from './rtrees';
import * as util from './commons.js';
import * as server from './serverApi.js';

// import Popper from 'popper.js';
let nextAnnotId = util.IdGenerator();
export function mkAnnotation(props) {
    return Object.assign({id: nextAnnotId()}, props);
}

export function updateAnnotationShapes() {
    server.getAnnotations().then(annotations =>{
        let zones = _.map(annotations.zones, (z) => dt.zoneFromJson(z));
        // console.log('zones: ', zones);
        rtrees.initPageLabelRTrees(zones);
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
                    .exit()
                    .remove()
                ;

            });
        });

    });
}



export function createHeaderLabelUI(annotation) {
    server.getLabelingPanelWidget()
        .then(labelerHtml => {
            let $labeler = $(labelerHtml);

            // $('body').append($labeler);

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

                // let $form = $(this);

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
                'left': globals.currentMousePos.x + "px",
                'top': globals.currentMousePos.y + "px"
            });

            $labeler.modal();

        })
    ;

}

export function createTextGridLabeler(boxes) {
    let labelNames = [
        'Author',
        'University',
        'Date',
        'Journal',
        'Address'
    ];

    // $labelForm.submit(function (event) {
    //     event.preventDefault();

    //     let ldata = $('#label-form > form').serialize();

    //     let postData = {
    //         form: ldata,
    //         selection: boxes
    //     };

    //     // let postData = Object.assign(ldata, selData);
    //     console.log('posting', postData);

    //     $.post( "/api/v1/label", {
    //         data: postData,
    //         datatype: 'json'
    //     }, function(res) {

    //         console.log('success', res);

    //     }).done(function() {
    //     }).fail(function() {
    //     }).always(function() {
    //         hideForm();
    //     });

    // });


    // _.each(labelNames, (label, i) => {
    //     let $l = $labelButton.clone();
    //     $l.empty();
    //     $l.click(setLabelType(label));
    //     $l.append($(`<small>(${i+1}) ${label}</small>`)) ;

    //     $l.attr('name', 'labelType');
    //     $l.attr('value', label) ;
    //     $l.attr('id', label);

    //     $labelButtons.append($l);
    // });

    // return $labelForm;
}
