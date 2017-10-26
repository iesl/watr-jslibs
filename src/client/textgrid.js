/* global require  */

import * as d3 from 'd3';
import * as $ from 'jquery';
import * as _ from 'underscore';
import * as lbl from './labeling';
import * as coords from './coord-sys.js';
import * as panes from  './splitpane-utils.js';
import * as util from  './commons.js';
import * as rtrees from  './rtrees.js';

import {initD3DragSelect} from  './dragselect.js';

import { globals } from './globals';

let knn = require('rbush-knn');

// let svgs = () => d3.selectAll('svg');
// let pageImageSelector = () => d3.select('div.page-images').selectAll('svg.page-image');

let getX = d => d[0][1][0] / 100.0;
let getY = d => d[0][1][1] / 100.0;
let getW = d => d[0][1][2] / 100.0;
let getH = d => d[0][1][3] / 100.0;



/**
 *  Capture a click on the textgrid-side and scroll the corresponding page image into
 *  view, flashing an indicator on the image point corresponding to the text
 */
function syncScrollTextGrid(clickPt, neighbor) {

    // let { minX: x, minY: y, page: pageNum, row: row, col: col } = neighbor;
    let { page: pageNum, row: row } = neighbor;

    let pageTextgridSvgId = `#page-textgrid-${pageNum}`;
    let pageTextTop = $(pageTextgridSvgId).parent().position().top;

    let pageImageTop = $(`#page-image-${pageNum}`).parent().position().top;
    let pageTextClickY = clickPt.y;
    let pageImagesOffset = $('div.page-images').position().top;
    let userAbsY = pageImageTop + pageTextClickY + pageImagesOffset;
    // let pageRelativeClickedY = clickPt.y;

    let scrollTo = pageTextTop + (row * 16) - userAbsY;

    $('#splitpane_root__bottom__right').scrollTop(scrollTo);

    d3.select(pageTextgridSvgId)
        .append('circle')
        .attr("cx", 10)
        .attr("cy", (row*16)+10)
        .attr("r", 20)
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
        .attr("cx",  getX(headLoc))
        .attr("cy", getY(headLoc))
        .attr("r", 20)
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
            let loci = util.filterLoci(d.loci);
            let coords = d3.mouse(this);
            syncScrollPageImages(coords, loci);
        })
        .on("mouseup", function(d) {
            let selection = util.getSelectionText();
            console.log('selected: ', d,  selection);
            // let loci = filterLoci(d.loci);
        })
        .on("mouseover", function(d) {
            let loci = util.filterLoci(d.loci);
            // console.log('mouseover: ', d.loci);

            // pageImageSelector()
            util.d3select.pageImages()
                .selectAll('.textloc')
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

        }).on("mouseout", function() {
            // return pageImageSelector().selectAll('.textloc')
            return util.d3select.pageImages()
                .selectAll('.textloc')
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
        .text(function(d){ return "∙  " + d.text + "  ↲"; })
        .call(textGridLocationIndicator)
    ;
}




function createLabelingPanel(annotation) {
    console.log('createLabelingPanel', annotation);


    // let sortedHits = _.sortBy(hits, hit => hit.minX);
    // let hitStr = _.map(sortedHits, n => n.char).join('');
    // console.log('selectRect', selectRect, 'hit:', hitStr);
    // console.log('selectRect', selectRect, 'minRect:', [minX, minY, maxX-minX, maxY-minY]);
    // Create visual feedback for selection
    let svgPageSelector = `svg#page-image-${annotation.page}`;

    d3.select(svgPageSelector)
        .append('rect')
        .classed('label-selection-rect', true)
        .attr("x", annotation.userBounds.left)
        .attr("y", annotation.userBounds.top)
        .attr("width", annotation.userBounds.width)
        .attr("height", annotation.userBounds.height)
        .attr("fill-opacity", 0.7)
        .attr("stroke-width", 1)
        .attr("stroke", 'blue')
        .attr("fill", 'yellow')
        .transition().duration(200)
        .attr("x", annotation.minBounds.left)
        .attr("y", annotation.minBounds.top)
        .attr("width", annotation.minBounds.width)
        .attr("height", annotation.minBounds.height)
        .attr("fill-opacity", 0.3)
    ;


    let headerLabeler = lbl.createHeaderLabelUI();

    let divPageImages = `div.page-images`;

    // console.log(headerLabeler);

    // let [leftX, llY] = bboxLowLeftPt(annotation.userBounds);

    // let labelSelectionBottom = llY > coords.currentMousePos.y ? llY : coords.currentMousePos.y;
    // let top = Math.max(
    //     currentMousePos.y
    // );
    // // currentMousePos.y + bboxHeight(annotation.userBounds),

    $(headerLabeler).css({
        left: globals.currentMousePos.x,
        top: globals.currentMousePos.y
    });

    $(divPageImages).append(headerLabeler);

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
        .each(function (){
            let svg = d3.select(this);

            initD3DragSelect(svg.attr('id'), (pointOrRect) => {
                if (pointOrRect.point != undefined) {
                    // Point click handler
                    let clickPt = pointOrRect.point;
                    let pageStr = clickPt.svgSelector.split('-').pop();
                    let page =  +pageStr;

                    let pageRTree = globals.pageImageRTrees[page];

                    let x = clickPt.x,
                        y = clickPt.y,
                        num = 4;

                    let neighbors = knn(pageRTree, x, y, num);
                    if (neighbors.length > 0) {
                        let nearestNeighbor = neighbors[0];
                        // let ns = _.map(neighbors, (n) => n.char).join('');
                        syncScrollTextGrid(clickPt, nearestNeighbor);
                    }

                } else if (pointOrRect.rect != undefined) {
                    // Rectangular selection handler
                    let selectRect = pointOrRect.rect;
                    let pdfImageRect = coords.mk.fromXy12(pointOrRect.rect, coords.coordSys.pdf);

                    let pageStr = selectRect.svgSelector.split('-').pop();
                    let page =  +pageStr;

                    let hits = rtrees.searchPage(page, pdfImageRect);

                    let minBoundSelection = rtrees.queryHitsMBR(hits);

                    let annotation = {
                        page: page,
                        userBounds: pdfImageRect,
                        minBounds: minBoundSelection
                    };

                    createLabelingPanel(annotation);
                } else {

                    // Move handler
                }
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

    rtrees.initRTrees(textgrids);

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
