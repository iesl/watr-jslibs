// import * as d3 from  'd3';
import * as $ from  'jquery';
import * as _ from  'underscore';


export function createHeaderLabelUI() {
    let labelNames = [
        'Title',
        'Authors',
        'Abstract',
        'Affiliations',
        'References'
    ];

    let formFrame = $('<div class="form-frame"></div>');
    let form = $('<form class="labeling-form"></form>');
    let btngrp = $('<div class="btn-group-xs"></div>');


    _.each(labelNames, label => {
        let r = $(`<button class="btn btn-xs btn-block btn-default" type="radio" name="labelName" value="${label}" ><small><span class="glyphicon glyphicon-arrow-left" />${label}</small> </button>`);
        btngrp.append(r);
    });

    return $(formFrame).append(form.append(btngrp));

}
