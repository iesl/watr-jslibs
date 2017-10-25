/* global require define _ $ */

import * as d3 from  'd3';
import * as $ from  'jquery';
import * as _ from  'underscore';

import * as panes from  './splitpane-utils.js';
import * as util from  './commons.js';
import {initD3DragSelect} from  './dragselect.js';

let svgs = () => d3.selectAll('svg');
let pageImageSelector = () => d3.select('div.page-images').selectAll('svg.page-image');

let getX = d => d[0][1][0] / 100.0;
let getY = d => d[0][1][1] / 100.0;
let getW = d => d[0][1][2] / 100.0;
let getH = d => d[0][1][3] / 100.0;

let filterLoci = loci => _.filter(loci,  loc => {
    return typeof loc !== "string";
});

export function selectShapes(dataBlock) {
    return svgs().selectAll(".shape")
        .data(dataBlock.shapes, util.getId) ;
}

function syncScrollPageImages(coords, loci) {

    // Use first location as sync point
    let headLoc = loci[0];
    let pageNum = headLoc[0][0];
    let pdfTextY = getY(headLoc);
    let pdfTextH = getH(headLoc);
    // console.log('pdf text y', pdfTextY);

    // Get visible abs Y-position of user click:
    let pageTextTop = $(`#page-textgrid-${pageNum}`).parent().position().top;
    let pageTextClickY = coords[1];
    let pageTextsOffset = $('div.page-textgrids').position().top;
    let userAbsY = pageTextTop + pageTextClickY + pageTextsOffset;

    // Get offset of clicked text on page
    let pageImageSvgId = `#page-image-${pageNum}`;
    let pageImageTop = $(pageImageSvgId).parent().position().top;

    let scrollTo = pageImageTop + pdfTextY - pdfTextH - 10 - userAbsY;

    $('#splitpane_root__bottom__left').scrollTop(scrollTo);

    d3.select(pageImageSvgId)
        .append('circle')
        .attr("cx", function(d){ return getX(headLoc); })
        .attr("cy", function(d){ return getY(headLoc); })
        .attr("r", function(d){ return 20; })
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 0)
        .attr("fill",  "yellow")
        .attr("stroke",  "black")
        .transition()
        .duration(300)
        .attr("r", 1)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 1)
        .delay(10)
        .remove()
    ;
}

function textGridLocationIndicator(r) {
    return r
        .on("mousedown", function(d) {
            let loci = filterLoci(d.loci);
            let coords = d3.mouse(this);
            syncScrollPageImages(coords, loci);
        })
        .on("mouseup", function(d) {
            let selection = util.getSelectionText();
            console.log('selected: ', d,  selection);
            // let loci = filterLoci(d.loci);
        })
        .on("mouseover", function(d) {
            let loci = filterLoci(d.loci);
            // console.log('mouseover: ', d.loci);

            // #d3-chain-indent#
            pageImageSelector().selectAll('.textloc')
                .data(loci)
                .enter()
                .append('rect')
                .classed('textloc', true)
                .attr("x", getX)
                .attr("y", (d) => {return getY(d)-getH(d);})
                .attr("width", getW)
                .attr("height", getH)
                .attr("opacity", 0.4)
                .attr("fill-opacity", 0.5)
                .attr("stroke-width", 0)
                .attr("stroke", 'blue')
                .attr("fill", 'blue')
            ;

        }).on("mouseout", function(d) {
            return pageImageSelector().selectAll('.textloc')
                .remove();
        });

}


function setupPageTexts(contentId, textgrids) {

    let textgridsel = d3.select(contentId)
        .selectAll(".textgrid")
        .data(textgrids, util.getId)
        .enter()
        .append('div').classed('page-textgrid', true)
        .append('svg').classed('textgrid', true)
        .attr('id', (d, i) => `page-textgrid-${i}`)
        .attr('width', 600)
        .attr('height', grid => {
            return grid.rows.length * 18;
        })
    ;

    return textgridsel.selectAll('.gridrow')
        .data(d => d.rows)
        .enter()
        .append('text') .classed('gridrow', true)
        .attr("y", (d, i) => 20 + (i * 16))
        .attr("x", () => 40)
        .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
        .text(function(d, i){ return "∙  " + d.text + "  ↲"; })
        .call(textGridLocationIndicator)
    ;
}

function setupPageImages(contentId, pageImageShapes) {

    let ctx = {maxh: 0, maxw: 0};

    _.map(pageImageShapes, (sh) =>{
        ctx.maxh = Math.max(ctx.maxh, sh[0].height);
        ctx.maxw = Math.max(ctx.maxw, sh[0].width);
    });

    panes.setParentPaneWidth(contentId, ctx.maxw+30);

    let imageSvgs = d3.select(contentId)
        .selectAll(".page-image")
        .data(pageImageShapes, util.getId)
        .enter()
        .append('div').classed('page-image', true)
        .append('svg').classed('page-image', true)
        .attr('id', (d, i) => `page-image-${i}`)
        .attr('width', (d) => d[0].width)
        .attr('height', (d) => d[0].height)
    ;

    d3.selectAll('svg.page-image')
        .each(function (d){
            let svg = d3.select(this);

            initD3DragSelect(svg.attr('id'), (r) => {
                // console.log('r: ', r);
            });
        })
    ;


    imageSvgs.selectAll(".shape")
        .data(d => d)
        .enter()
        .each(function (d){
            let self = d3.select(this);
            let shape = d.type;
            return self.append(shape)
                .call(util.initShapeAttrs);
        })
    ;
}

export function RenderTextGrid(dataBlock) {
    let pages = dataBlock.pages;
    let textgrids = _.map(pages, p => p.textgrid);
    let pageShapes = _.map(pages, p => p.shapes);

    let {leftPaneId: leftPaneId, rightPaneId: rightPaneId} =
        panes.splitVertical('.content-pane', {fixedLeft: 200});


    let leftContent = d3.select(`#${leftPaneId}`)
        .append('div').classed('page-images', true)
    ;

    let rightContent = d3.select(`#${rightPaneId}`)
        .append('div').classed('page-textgrids', true)
    ;

    setupPageImages('div.page-images', pageShapes);
    setupPageTexts('div.page-textgrids', textgrids);

    // leftPane.selectAll(".shape")
    //     .data(gridShapes, util.getId)
    //     .enter()
    //     .each(function (d){
    //         let self = d3.select(this);
    //         let shape = d.type;
    //         return self.append(shape)
    //             .call(util.initShapeAttrs);
    //     })
    // ;

    leftContent.selectAll("image")
        .attr("opacity", 1.0)
    ;

    // return rightPane.selectAll('.gridrow')
    //     .data(gridRows)
    //     .enter()
    //     .append('text')
    //     .classed('gridrow', true)
    //     .attr("y", function(d, i){ return 20 + (i * 16); })
    //     .attr("x", function(d, i){ return 70; })
    //     .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
    //     .text(function(d, i){ return "∙  " + d.text + "  ↲"; })
    //     .call(textGridLocationIndicator)
    // ;

    // return leftPane.selectAll('.gridrow');
    return d3;

}
