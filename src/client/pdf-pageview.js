/**
 * Setup mouse tracking over named dom elements.
 *
 *  note: event page/client/screen/offset explanations:
 *       https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y
 **/

import * as d3 from 'd3';
import * as $ from 'jquery';
import * as _ from 'lodash';
import * as lbl from './labeling';
import * as coords from './coord-sys.js';
import * as panes from  './splitpane-utils.js';
import * as util from  './commons.js';
import * as rtrees from  './rtrees.js';
import Tooltip from 'tooltip.js';

import {initD3DragSelect} from  './dragselect.js';

import { globals } from './globals';

// let knn = require('rbush-knn');
let rtree = require('rbush');

let currentSelections = [];
import * as textview from  './textgrid-view.js';

function toggleLabelSelection(pageNum, hitItems) {
    let svgPageSelector = `svg#page-image-${pageNum}`;
    d3.select(svgPageSelector)
        .selectAll('.select-highlight')
        .data(hitItems, d => d.id)
        .enter()
        .append('rect')
        .classed('select-highlight', true)
        .attr('id', d => d.id)
        .call(util.initRect, d => d)
        .call(util.initStroke, 'black', 1, 0.9)
        .call(util.initFill, 'red', 0.2)
    ;
    // _.each(hoveredLabels, hoverHit => {
    //     let $hit = $(hoverHit.selector);
    // });

}


function initPageImageMouseHandlers(d3$svg, pageNum) {
    function clickHandler(pageNum, clickPt) {

        let queryBox = coords.mk.fromLtwh(clickPt.x, clickPt.y, 1, 1);
        let hoveredLabels = rtrees.searchPageLabels(pageNum, queryBox);
        if (hoveredLabels.length > 0) {

            toggleLabelSelection(pageNum, hoveredLabels);

        } else {

            let pageStr = clickPt.svgSelector.split('-').pop();
            let page =  parseInt(pageStr);

            let neighbors = rtrees.knnQueryPage(page, clickPt, 4);

            if (neighbors.length > 0) {
                let nearestNeighbor = neighbors[0];
                // let ns = _.map(neighbors, (n) => n.char).join('');
                textview.syncScrollTextGrid(clickPt, nearestNeighbor);
            }

        }
    }
    function selectionHandler(selectionRect) {
        let pdfImageRect = coords.mk.fromXy12(selectionRect, coords.coordSys.pdf);

        let pageStr = selectionRect.svgSelector.split('-').pop();
        let page = parseInt(pageStr);

        let hits = rtrees.searchPage(page, pdfImageRect);

        let minBoundSelection = rtrees.queryHitsMBR(hits);

        let annotation = lbl.mkAnnotation({
            type: 'bounding-boxes',
            page: page,
            targets: [[page, minBoundSelection]] // TODO should be another level of nesting here
        });

        createImageLabelingPanel(pdfImageRect, annotation);
    }

    d3$svg.on("mousemove", function(d) {
        let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));
        displayCharHoverReticles(d3$svg, pageNum, userPt);
        displayLabelHovers(pageNum, userPt);
    });
    // d3$svg.on("mousedown", function() {
    // });
    // d3$svg.on("mouseup", function() {
    // });
    // d3$svg.on("mouseover", function() {
    // });
    // d3$svg.on("mousemove", function() {
    // });
    // d3$svg.on("mouseout", function() {
    // });

    initD3DragSelect(d3$svg.attr('id'), (pointOrRect) => {
        if (pointOrRect.point != undefined) {
            clickHandler(pageNum, pointOrRect.point);
        } else if (pointOrRect.rect != undefined) {
            selectionHandler(pointOrRect.rect);
        } else {
            // Move handler
        }
    });
}
export function setupPageImages(contentId, pageImageShapes) {

    let ctx = {maxh: 0, maxw: 0};

    _.map(pageImageShapes, (sh) =>{
        ctx.maxh = Math.max(ctx.maxh, sh[0].y + sh[0].height);
        ctx.maxw = Math.max(ctx.maxw, sh[0].x + sh[0].width);
    });


    panes.setParentPaneWidth(contentId, ctx.maxw + 80);

    let imageSvgs = d3.select(contentId)
        .selectAll(".page-image")
        .data(pageImageShapes, util.getId)
        .enter()
        .append('div').classed('page-image', true)
        .attr('id', (d, i) => `page-image-frame-${i}`)
        .attr('width', d => d[0].x + d[0].width)
        .attr('height', (d) => d[0].y + d[0].height )
        .append('svg').classed('page-image', true)
        .attr('id', (d, i) => `page-image-${i}`)
        .attr('width', d => d[0].x + d[0].width)
        .attr('height', (d) => d[0].y + d[0].height )
    ;


    d3.selectAll('svg.page-image')
        .each(function (pageData, pageNum){
            let d3$svg = d3.select(this);
            initPageImageMouseHandlers(d3$svg, pageNum);
        }) ;


    imageSvgs.selectAll(".shape")
        .data(d => d)
        .enter()
        .each(function (d){
            let self = d3.select(this);
            let shape = d.type;
            return self.append(shape)
                .call(util.initShapeDimensions);
        })
    ;
}

// function displayLabelHovers(d3$svg, pageNum, hoverPt) {
function displayLabelHovers(pageNum, hoverPt) {
    let queryBox = coords.mk.fromLtwh(hoverPt.x, hoverPt.y, 1, 1);

    let hoveredLabels = rtrees.searchPageLabels(pageNum, queryBox);
    if (hoveredLabels.length > 0) {
        _.each(hoveredLabels, hoverHit => {
            let $hit = $(hoverHit.selector);
            // console.log('hovering over', $hit);
            if (! $hit.hasClass('tooltipped')) {
                let pageImageFrameId = `div#page-image-frame-${pageNum}`;
                const tt = new Tooltip($hit, {
                    title: hoverHit.label,
                    trigger: 'manual',
                    container: pageImageFrameId
                });
                tt.show();
                $hit.addClass('tooltipped');
                $hit.prop('tooltip', tt);
            }
        });
    } else {
        $('.tooltipped').each(function() {
            let tt = $(this).prop('tooltip');
            tt.dispose();
            $(this).removeClass('tooltipped');
        });
    }
}

function displayCharHoverReticles(d3$svg, pageNum, userPt) {

    let textgridRTree = globals.pageImageRTrees[pageNum] ;
    // let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));

    let queryWidth = 20;
    let queryBoxHeight = textview.TextGridLineHeight * 2;
    let queryLeft = userPt.x-queryWidth;
    let queryTop = userPt.y-queryBoxHeight;
    let queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

    let searchHits = textgridRTree.search(queryBox);
    let hits = _.sortBy(
        searchHits,
        hit => [hit.bottom, hit.right]
    );

    showPageImageGlyphHoverReticles(d3$svg, hits, queryBox);
}





// For PDF Page Image View
export function awaitUserSelection(d3$svg) {
    return new Promise((resolve, reject) => {
        d3$svg.on("mousedown", function() {
        });
        d3$svg.on("mouseup", function() {
        });
        d3$svg.on("mouseover", function() {
        });
        d3$svg.on("mousemove", function() {
        });
        d3$svg.on("mouseout", function() {
        });
    });
}

function createImageLabelingPanel(initSelection, annotation) {

    let target = annotation.targets[0];

    let [page, mbr] = target;

    let svgPageSelector = `svg#page-image-${page}`;

    d3.select(svgPageSelector)
        .append('rect')
        .call(util.initRect, () => initSelection)
        .classed('label-selection-rect', true)
        .call(util.initStroke, 'blue', 1, 1.0)
        .call(util.initFill, 'yellow', 0.7)
        .transition().duration(200)
        .call(util.initRect, () => mbr)
        .call(util.initFill, 'yellow', 0.3)
    ;


    lbl.createHeaderLabelUI(annotation);

}



export function showPageImageGlyphHoverReticles(d3$pageImageSvg, queryHits) {
    let d3$imageHitReticles = d3$pageImageSvg
        .selectAll('.textloc')
        .data(queryHits, d => d.id)
    ;

    d3$imageHitReticles
        .enter()
        .append('rect')
        .datum(d => d.pdfBounds? d.pdfBounds : d)
        .classed('textloc', true)
        .call(util.initRect, d => d)
        .call(util.initStroke, 'blue', 1, 0.2)
        .call(util.initFill, 'blue', 0.5)
    ;

    d3$imageHitReticles
        .exit()
        .remove() ;
}
