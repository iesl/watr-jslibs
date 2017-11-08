/**
 *
 **/

/* global  FormData */

import * as d3 from  'd3';
import * as $ from  'jquery';
import * as _ from  'lodash';
import {globals} from './globals';
import * as dt from './datatypes';


export function updateAnnotationShapes() {
    getAnnotations().then(annotations =>{
        let zones = _.map(annotations.zones, (z) => dt.zoneFromJson(z));
        // console.log('zones: ', zones);
        _.each(zones, zone => {
            _.each(
                zone.regions, region => {
                    let svgPageSelector = `svg#page-image-${region.pageNum}`;

                    let annotRect = d3.select(svgPageSelector)
                        .selectAll(`.ann${zone.zoneId}_${region.regionId}`)
                        .data([region])
                        .enter()
                        .append('rect')
                        .classed('annotation-rect', true)
                        .classed(`.ann${zone.zoneId}_${region.regionId}`, true)
                        .attr("x", region.bbox.left)
                        .attr("y", region.bbox.top)
                        .attr("width", region.bbox.width)
                        .attr("height", region.bbox.height)
                        .attr("fill-opacity", 0.3)
                        .attr("stroke-width", 1)
                        .attr("stroke", 'blue')
                        .attr("fill", 'purple')
                        .exit()
                        .remove()
                    ;


                });
        });

    });
}

// export function addAnnotation(annotation) {
//     let doc = globals.currentDocument;

//     if (globals.documentAnnotations[doc] === undefined) {
//         globals.documentAnnotations[doc] = [];
//     }
//     let docAnnots = globals.documentAnnotations[doc];
//     docAnnots.push(annotation);
//     console.log('global', globals);
//     updateAnnotationShapes();
// }

export function getAnnotations() {
    return new Promise((resolve, reject) => {
        $.getJSON(
            `/api/v1/labeling/labels/${globals.currentDocument}`,
            function success(response) {
                resolve(response);
            })
            .fail(function() {
                reject("Server Error");
            }) ;
    });
}

function getLabelingPanelWidget() {

    let labelNames = [
        'Title',
        'Authors',
        'Abstract',
        'Affiliations',
        'References'
    ];

    let reqData = {
        labels: labelNames,
        description: "Some Desc"
    };

    return new Promise((resolve, reject) => {
        $.post({
            url: "/api/v1/labeling/ui/labeler",
            data: JSON.stringify(reqData),
            contentType: 'application/json',
            method: "POST"
        }, function success (labelerHtml) {
            resolve(labelerHtml);

        }).fail(function() {
            reject("Server Error");
        });
    });
}

export function createHeaderLabelUI(annotation) {
    getLabelingPanelWidget()
        .then(labelerHtml => {
            let $labeler = $(labelerHtml);


            $('body').append($labeler);

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

                let postData = {
                    stableId: globals.currentDocument,
                    labelChoice: labelChoice,
                    selection: {
                        annotType: annotation.type,
                        targets: ser
                    }
                };


                $.post({
                    url: "/api/v1/labeling/label",
                    data: JSON.stringify(postData),
                    datatype: 'json',
                    contentType: 'application/json',
                    method: "POST"
                }, function(res) {
                    console.log('success', res);

                    $labeler.modal('hide');

                    d3.selectAll('.label-selection-rect').remove();

                    updateAnnotationShapes();

                }) ;
            });

            $labeler.modal();

            $labeler.css({
                'margin-left': globals.currentMousePos.x + "px",
                'margin-top': globals.currentMousePos.y + "px"
            });

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
