/**
 *
 **/

/* global  FormData */

import * as d3 from  'd3';
import * as $ from  'jquery';
import * as _ from  'lodash';
import {globals} from './globals';

// Globals:
// let $labelForm = $('#label-form > form');
// let $labelButton = $labelForm.find('button#label-type');
// let $cancelButton = $labelForm.find('button#cancel-button');
// $cancelButton.click(cancel);

export function updateAnnotationShapes() {
    _.each(getAnnotations(), (annotation) => {

        _.each(annotation.targets, (target, targetNum) => {
            let [page, mbr] = target;
            let svgPageSelector = `svg#page-image-${page}`;
            let pageImageTop = $(svgPageSelector).parent().position().top;
            let pageImagesOffset = $('div.page-images').position().top;
            let screenY = pageImageTop + pageImagesOffset;

            console.log('pageImageTop', screenY);

            let annotRect = d3.select(svgPageSelector)
                .selectAll(`.ann${annotation.id}_${targetNum}`)
                .append('rect')
                .classed('annotation-rect', true)
                .classed(`ann${annotation.id}_${targetNum}`, true)
                .attr("x", mbr.left)
                .attr("y", mbr.top)
                .attr("width", mbr.width)
                .attr("height", mbr.height)
                .attr("fill-opacity", 0.3)
                .attr("stroke-width", 1)
                .attr("stroke", 'blue')
                .attr("fill", 'purple')
                .transition().duration(200)
                .attr("x", mbr.left)
                .attr("y", mbr.top)
                .attr("width", mbr.width)
                .attr("height", mbr.height)
                .attr("style", "z-index: 100;")
                .attr("fill-opacity", 0.3)
            ;
            annotRect.on("mousedown", function(d) {
                console.log ("mousie!");
            });

        });
    });


}

export function addAnnotation(annotation) {
    let doc = globals.currentDocument;

    if (globals.documentAnnotations[doc] === undefined) {
        globals.documentAnnotations[doc] = [];
    }
    let docAnnots = globals.documentAnnotations[doc];
    docAnnots.push(annotation);
    console.log('global', globals);
    updateAnnotationShapes();
}

export function getAnnotations() {
    let doc = globals.currentDocument;
    let annots = globals.documentAnnotations[doc];
    return annots ? annots : [];
}


// let $labelButtons = $labelForm.find('div#label-buttons');

// $labelButtons.empty();

// function cancel() {
//     d3.selectAll('.label-selection-rect').remove();
//     hideForm();
// }
// function hideForm() {
//     $('#label-form').css({
//         display: 'none'
//     });
//     $labelButtons.empty();
// }

// function setLabelType(label) {
//     return () => {
//         $labelForm.find('input#labelType')
//             .attr('value', label);

//     };
// }

export function createHeaderLabelUI(annotation) {
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

    $.post({
        url: "/api/v1/labeling/ui/labeler",
        data: JSON.stringify(reqData),
        contentType: 'application/json',
        method: "POST"
    }, function(labelerHtml) {
        let $labeler = $(labelerHtml);

        console.log($labeler);

        $('body').append($labeler);

        $labeler.submit(function (event) {
            let $form = $(this);

            event.preventDefault();
            let f = document.forms[$form.attr('id')];

            let formData = new FormData(f);

            // let ser = _.map(annotation.targets, t => [t[0], t[1].intRep]);
            let ser = _.map(annotation.targets, t => {
                return {
                    page: t[0],
                    bbox: t[1].intRep
                };
            });

            let postData = {
                // form: formData,
                selection: {
                    annotType: annotation.type,
                    targets: ser
                }
            };

            addAnnotation(annotation);

            $.post({
                url: "/api/v1/labeling/label",
                data: JSON.stringify(postData),
                datatype: 'json',
                contentType: 'application/json',
                method: "POST"
            }, function(res) {

                console.log('success', res);
                d3.selectAll('.label-selection-rect')
                    .classed('label-selection-rect', false)
                    .transition().duration(200)
                    .attr("fill", 'green') ;

            }) ;
        });


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

        $labeler.modal();

        $labeler.css({
            'margin-left': globals.currentMousePos.x + "px",
            'margin-top': globals.currentMousePos.y + "px"
        });
    });
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
