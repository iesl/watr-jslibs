
// import * as d3 from  'd3';
import * as $ from  'jquery';
import * as _ from  'underscore';

// function div(attrs) {
//     return $('<div>', attrs).append;
// }
// function form(attrs) {
//     return $('<div>', attrs).append;
// }
export function createHeaderLabelUI() {
    let labelNames = [
        'Title',
        'Authors',
        'Abstract',
        'Affiliations',
        'References'
    ];

    let $labelFormTemplate = $('#templates > #label-form');
    let $labelButton = $labelFormTemplate.find('button#label-type');


    console.log('labelButton', $labelButton);
    let $labelButtons = $labelFormTemplate.find('div#label-buttons');
    $labelButtons.empty();
    // $labelButton.detach();


    $($labelFormTemplate).submit(function (event) {
        var jqxhr = $.post( "/api/v1/label", function() {
            alert( "success" );
        }).done(function() {
            alert( "second success" );
        }).fail(function() {
            alert( "error" );
        }).always(function() {
            alert( "finished" );
        });

        event.preventDefault();
    });


    _.each(labelNames, (label, i) => {
        // let r = $(`<button class="btn btn-xs btn-block btn-default" type="radio" name="labelName" value="${label}" ><small><span class="glyphicon glyphicon-arrow-left" />${label}</small> </button>`);
        let $l = $labelButton.clone();
        $l.empty();
        $l.append($(`<small>(${i+1}) ${label}</small>`)) ;
        $labelButtons.append($l);
    });

    // return $(formFrame).append(form.append(btngrp));
    console.log($labelFormTemplate);
    return $labelFormTemplate;

}
// // Assign handlers immediately after making the request,
// // and remember the jqxhr object for this request
// var jqxhr = $.post( "/api/v1/label", function() {
//     alert( "success" );
// })
//     .done(function() {
//         alert( "second success" );
//     })
//     .fail(function() {
//         alert( "error" );
//     })
//     .always(function() {
//         alert( "finished" );
//     });
