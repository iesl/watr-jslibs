/**
 *
 *
 *
 **/

import * as d3 from  'd3';
import * as $ from  'jquery';
import * as _ from  'underscore';

// Globals:
let $labelForm = $('#label-form > form');
let $labelButton = $labelForm.find('button#label-type');
let $cancelButton = $labelForm.find('button#cancel-button');
$cancelButton.click(cancel);

let $labelButtons = $labelForm.find('div#label-buttons');
$labelButtons.empty();

function cancel() {
    d3.selectAll('.label-selection-rect').remove();
    hideForm();
}
function hideForm() {
    $('#label-form').css({
        display: 'none'
    });
    $labelButtons.empty();
}

function setLabelType(label) {
    return () => {
        $labelForm.find('input#labelType')
            .attr('value', label);

    };
}

export function createHeaderLabelUI() {
    let labelNames = [
        'Title',
        'Authors',
        'Abstract',
        'Affiliations',
        'References'
    ];

    $labelForm.submit(function (event) {
        event.preventDefault();

        let ldata = $('#label-form > form').serialize();

        let currSelRect = d3.selectAll('.label-selection-rect');
        let postData = {
            form: ldata,
            selection: {
                x: currSelRect.attr('x'),
                y: currSelRect.attr('y'),
                width: currSelRect.attr('width'),
                height: currSelRect.attr('height')
            }
        };

        // let postData = Object.assign(ldata, selData);
        console.log('posting', postData);

        $.post( "/api/v1/label", {
            data: postData,
            datatype: 'json'
        }, function(res) {

            console.log('success', res);
            d3.selectAll('.label-selection-rect')
                .classed('label-selection-rect', false)
                .transition().duration(200)
                .attr("fill", 'green') ;

        }).done(function() {
            // alert( "second success" );
        }).fail(function() {
        }).always(function() {
            hideForm();
            // cleanup
        });

    });


    _.each(labelNames, (label, i) => {
        let $l = $labelButton.clone();
        $l.empty();
        $l.click(setLabelType(label));
        $l.append($(`<small>(${i+1}) ${label}</small>`)) ;

        $l.attr('name', 'labelType');
        $l.attr('value', label) ;
        $l.attr('id', label);

        $labelButtons.append($l);
    });

    return $labelForm;
}

export function createTextGridLabeler(boxes) {
    let labelNames = [
        'Author',
        'University',
        'Date',
        'Journal',
        'Address'
    ];

    $labelForm.submit(function (event) {
        event.preventDefault();

        let ldata = $('#label-form > form').serialize();

        let postData = {
            form: ldata,
            selection: boxes
        };

        // let postData = Object.assign(ldata, selData);
        console.log('posting', postData);

        $.post( "/api/v1/label", {
            data: postData,
            datatype: 'json'
        }, function(res) {

            console.log('success', res);

        }).done(function() {
        }).fail(function() {
        }).always(function() {
            hideForm();
        });

    });


    _.each(labelNames, (label, i) => {
        let $l = $labelButton.clone();
        $l.empty();
        $l.click(setLabelType(label));
        $l.append($(`<small>(${i+1}) ${label}</small>`)) ;

        $l.attr('name', 'labelType');
        $l.attr('value', label) ;
        $l.attr('id', label);

        $labelButtons.append($l);
    });

    return $labelForm;
}
