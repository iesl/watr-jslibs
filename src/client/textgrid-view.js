/**
 *
 *  Render for extracted text display (TextGrid)
 *  Canvas based implementation.  d3+svg was too sluggish.
 *
 */

/* global require setTimeout */

import * as d3 from 'd3';
import * as $ from 'jquery';
import * as _ from 'lodash';
import * as lbl from './labeling';
import * as coords from './coord-sys.js';
import * as panes from  './splitpane-utils.js';
import * as util from  './commons.js';
import * as rtrees from  './rtrees.js';
import * as pageview from  './pdf-pageview.js';

import { globals } from './globals';

// let knn = require('rbush-knn');
let rtree = require('rbush');

export const TextGridLineSpacing = 16;
export const TextGridLineHeight  = 16;
const TextGridOriginPt = coords.mkPoint.fromXy(20, 20);

/** Page sync flashing indicator dot */
function scrollSyncIndicator(parentSelection, indicatorPoint) {
    d3.select(parentSelection)
        .append('circle')
        .attr("cx", indicatorPoint.x)
        .attr("cy", indicatorPoint.y)
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


function initHoverReticles(d3$textgridSvg) {
    let reticleGroup = d3$textgridSvg
        .append('g')
        .classed('reticles', true);


    reticleGroup
        .append('rect')
        .classed('query-reticle', true)
        .call(util.initStroke, 'blue', 1, 0.6)
        .call(util.initFill, 'blue', 0.2)
    ;
    return reticleGroup;
}

function showGlyphHoverReticles(d3$textgridSvg, queryBox, queryHits) {
    let pageNum = parseInt(d3$textgridSvg.attr('page'));

    d3$textgridSvg.select('g.reticles')
        .select('rect.query-reticle')
        .call(util.initRect, () => queryBox)
    ;


    let d3$hitReticles = d3$textgridSvg.select('g.reticles')
        .selectAll('.hit-reticle')
        .data(queryHits, (d) => d.id)
    ;

    d3$hitReticles
        .enter()
        .append('rect')
        .classed('hit-reticle', true)
        .attr('id', d => d.id)
        .call(util.initRect, d => d)
        .call(util.initStroke, 'green', 1, 0.2)
        .call(util.initFill, 'yellow', 0.7)
    ;

    d3$hitReticles
        .exit()
        .remove() ;

    let ns = _.filter(queryHits, (hit) => {
        return hit.pdfBounds !== undefined;
    });

    pageview.showPageImageGlyphHoverReticles(
        util.d3select.pageImage(pageNum),
        ns
    );
    // let d3$imageHitReticles = util.d3select.pageImage(pageNum)
    //     .selectAll('.textloc')
    //     .data(ns, (d) => d.id)
    // ;

    // d3$imageHitReticles
    //     .enter()
    //     .append('rect')
    //     .datum(d => d.pdfBounds)
    //     .classed('textloc', true)
    //     .attr("x", d => d.left)
    //     .attr("y", d => d.top)
    //     .attr("width", d => d.width)
    //     .attr("height", d => d.height)
    //     .attr("stroke-opacity", 0.2)
    //     .attr("fill-opacity", 0.5)
    //     .attr("stroke-width", 1)
    //     .attr("stroke", 'blue')
    //     .attr("fill", 'blue') ;

    // d3$imageHitReticles
    //     .exit()
    //     .remove() ;
}

// function getFrameTopClientPos(pageNum) {
//     // Get offset of clicked text on page
//     let pageImageFrameId = `div#page-image-frame-${pageNum}`;
//     let pageImageFrame = $(pageImageFrameId);
//     let pageImageFramePosition = pageImageFrame.position();
//     let frameTop = pageImageFramePosition.top;
//     let containerTop = $(`div.page-images`).position().top;
//     let absFrameTop = frameTop - containerTop ;
//     return absFrameTop;
// }

function syncScrollFrame(clientPt, dataPt, pageNum, whichSide, paneId) {

    // Get offset of clicked text on page
    let pageImageFrameId = `div#${whichSide}-frame-${pageNum}`;
    let pageImageFrame = $(pageImageFrameId);
    let pageImageFramePosition = pageImageFrame.position();
    let frameTop = pageImageFramePosition.top;
    let containerTop = $(`div.${whichSide}s`).position().top;
    let userPtY = clientPt.y;
    let hitGlyphTop = dataPt.top;
    let absFrameTop = frameTop - containerTop ;
    let scrollTo = absFrameTop + (hitGlyphTop - userPtY - 10);

    $(paneId).scrollTop(scrollTo);

    scrollSyncIndicator(
        `svg#${whichSide}-${pageNum}`,
        dataPt.topLeft
    );
}

/**
 *  Capture a click on the textgrid-side and scroll the corresponding page image into
 *  view, flashing an indicator on the image point corresponding to the text
 */
function syncScrollPageImages(clientPt, dataPt) {
    syncScrollFrame(clientPt, dataPt.pdfBounds, dataPt.page, 'page-image', '#splitpane_root__bottom__left');
}

/**
 *  Capture a click on the page image side and scroll the corresponding page text into
 *  view, flashing an indicator on the text point
 */
export function syncScrollTextGrid(clientPt, neighbor) {

    let { page: pageNum, row: row } = neighbor;

    let pageTextgridSvgId = `div#textgrid-frame-${pageNum}`;
    let frameTop = $(pageTextgridSvgId).position().top;

    // let containerTop = $(`div.page-textgrids`).position().top;
    let absFrameTop = frameTop; //  - containerTop ;

    let textGridNeighborY = row * TextGridLineHeight;
    let scrollTo = absFrameTop + (textGridNeighborY - clientPt.y - 10);

    $('#splitpane_root__bottom__right').scrollTop(scrollTo);

    scrollSyncIndicator(
        `svg#textgrid-svg-${pageNum}`,
        coords.mkPoint.fromXy(10, textGridNeighborY+10)
    );

}

function showSelectionHighlight(d3$textgridSvg, selections) {

    let sel = d3$textgridSvg
        .selectAll("rect.selects")
        .data(selections, d=> d.id )
    ;
    sel.enter()
        .append('rect')
        .classed("selects", true)
        .attr('id', d => d.id)
        .call(util.initRect, d => d)
        .call(util.initStroke, 'black', 1, 0.1)
        .call(util.initFill, 'blue', 0.4)
    ;

    sel.exit().remove() ;
}



/*

  */

function textgridSvgHandlers(d3$textgridSvg) {
    let pageNum = parseInt(d3$textgridSvg.attr('page'));
    let reticleGroup = initHoverReticles(d3$textgridSvg);

    let neighborHits = [];
    let gridSelection = [];
    let selectionStartId = undefined;
    let selectionEndId = undefined;


    d3$textgridSvg
        .on("mousedown", function() {
            let mouseEvent = d3.event;

            let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);

            if (neighborHits.length > 0) {
                let firstHit = neighborHits[neighborHits.length-1];

                syncScrollPageImages(clientPt, firstHit);

                if (mouseEvent.shiftKey) {
                    // Switch to text selection cursor
                    // Start text selection
                    selectionEndId = selectionStartId = parseInt(firstHit.id);
                }
            }

        })
        .on("mouseup", function() {
            if (selectionStartId) {

                let annotBoxes = _.map(gridSelection, pt => pt.locus[0]);

                // _.each(gridSelection, (g) =>{
                //     console.log('gridsel: ', g);
                // });

                let annotation = lbl.mkAnnotation({
                    type: 'char-boxes',
                    page: pageNum,
                    targets: annotBoxes
                });

                gridSelection = [];
                selectionStartId = undefined;
                selectionEndId = undefined;
                d3$textgridSvg
                    .selectAll("rect.glyph-selects")
                    .remove() ;

                createTextGridLabelingPanel(annotation);
            }

        })
        .on("mouseover", function() {
            reticleGroup
                .attr("opacity", 0.4);
        })
        .on("mousemove", function() {
            // show the grid-side bbox
            let textgridRTree = globals.textgridRTrees[pageNum] ;
            let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));

            let queryWidth = 20;
            let queryBoxHeight = TextGridLineHeight * 2;
            let queryLeft = userPt.x-queryWidth;
            let queryTop = userPt.y-queryBoxHeight;
            let queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

            let hits = neighborHits = textgridRTree.search(queryBox);
            // neighborHits = textgridRTree.search(queryBox);
            neighborHits = _.sortBy(
                _.filter(hits, hit => hit.pdfBounds),
                hit => [hit.bottom, hit.right]
            );

            showGlyphHoverReticles(d3$textgridSvg, queryBox, neighborHits);

            if (selectionStartId && neighborHits.length > 0) {
                let firstHit = neighborHits[neighborHits.length-1];
                let hitId = parseInt(firstHit.id);
                if (selectionEndId != hitId) {
                    selectionEndId = hitId;
                    let id1 = selectionStartId;
                    let id2 = selectionEndId;
                    if (selectionStartId > selectionEndId) {
                        id1 = selectionEndId;
                        id2 = selectionStartId;
                    }
                    gridSelection = globals.dataPts[pageNum].slice(id1, id2);
                    showSelectionHighlight(d3$textgridSvg, gridSelection);
                }
            }

        })
        .on("mouseout", function() {
            reticleGroup.attr("opacity", 0);

            util.d3select.pageImage(pageNum)
                .selectAll('.textloc').remove();
        });

}


function initGridText(d3$canvas, gridData, gridNum) {
    let context = d3$canvas.node().getContext('2d');
    // context.font = 'normal normal normal 12px/normal Helvetica, Arial';
    context.font = `normal normal normal ${TextGridLineHeight}px/normal Times New Roman`;
    // context.font = `${TextGridLineHeight}px Helvetica, Arial`;
    let idGen = util.IdGenerator();

    let rowDataPts = _.map(gridData.rows, (gridRow, rowNum) => {

        let y = TextGridOriginPt.y + (rowNum * TextGridLineHeight);
        let x = TextGridOriginPt.x;
        let text = gridRow.text;
        let currLeft = x;
        let dataPts = _.map(text.split(''), (ch, chi) => {
            let chWidth = context.measureText(ch).width;

            let dataPt = coords.mk.fromLtwh(
                currLeft, y-TextGridLineHeight, chWidth, TextGridLineHeight
            );

            let charLocus = gridRow.loci[chi];
            let charBBox = charLocus[0][1];
            let pdfTextBox = charBBox? coords.mk.fromArray(charBBox) : undefined;

            dataPt.pdfBounds = pdfTextBox ;
            dataPt.locus = gridRow.loci[chi];
            dataPt.page = charBBox? charLocus[0][0] : undefined;
            dataPt.gridRow = gridRow;
            dataPt.id = idGen();
            currLeft += chWidth;
            return dataPt;
        });
        // context.strokeText(text, x, y);
        context.fillText(text, x, y);
        return dataPts;
    });

    let allDataPts = _.flatten(rowDataPts);
    globals.dataPts[gridNum] = allDataPts;
    let textgridRTree = rtree();
    globals.textgridRTrees[gridNum] = textgridRTree;
    textgridRTree.load(allDataPts);
}



function createTextGridLabelingPanel(annotation) {

    // let svgPageSelector = `#textgrid-frame-${annotation.page}`;
    // let pageImageTop = $(svgPageSelector).parent().position().top;
    // let pageImageTop = $(svgPageSelector).position().top;
    // let textGridsTop = $('div.page-textgrids').position().top;
    // let screenY = pageImageTop + textGridsTop;

    lbl.createTextGridLabeler(annotation);

    $('.modal-content').css({
        'margin-left': globals.currentMousePos.x,
        'margin-top': globals.currentMousePos.y // + screenY
    });

    $('#label-form.modal').css({
        display: 'block'
    });

}



function setupPageTextGrids(contentId, textgrids) {

    let computeGridHeight = (grid) => {
        return (grid.rows.length * TextGridLineSpacing) + TextGridOriginPt.y + 10;
    };
    let pagegridDivs = d3.select(contentId)
        .selectAll(".textgrid")
        .data(textgrids, util.getId)
        .enter()
        .append('div').classed('textgrid', true)
        .attr('id', (d, i) => `textgrid-frame-${i}`)
    // .attr('width', 900)
    // .attr('height', grid => grid.rows.length * TextGridLineSpacing)
        .attr('style', grid => {
            let height = computeGridHeight(grid);
            return `width: 900; height: ${height};`;
        })
    ;

    pagegridDivs
        .append('canvas').classed('textgrid', true)
        .attr('id', (d, i) => `textgrid-canvas-${i}`)
        .attr('page', (d, i) => i)
        .attr('width', 900)
        .attr('height', grid => computeGridHeight(grid))
    ;

    pagegridDivs
        .append('svg').classed('textgrid', true)
        .attr('id', (d, i) => `textgrid-svg-${i}`)
        .attr('page', (d, i) => i)
        .attr('width', 900)
        .attr('height', grid => computeGridHeight(grid))
    ;

    d3.selectAll('canvas.textgrid')
        .each(function (gridData, gridNum){
            let d3$canvas = d3.select(this);
            initGridText(d3$canvas, gridData, gridNum);
        });

    d3.selectAll('svg.textgrid')
        .each(function (gridData, gridNum){
            let d3$svg = d3.select(this);
            textgridSvgHandlers(d3$svg);
        });
}


function setupFrameLayout() {

    let {leftPaneId: leftPaneId, rightPaneId: rightPaneId} =
        panes.splitVertical('.content-pane', {fixedLeft: 200});


    d3.select(`#${leftPaneId}`)
        .append('div').classed('page-images', true)
    ;

    d3.select(`#${rightPaneId}`)
        .append('div').classed('page-textgrids', true)
    ;

}

export function RenderTextGrid(dataBlock) {
    let pages = dataBlock.pages;
    let textgrids = _.map(pages, p => p.textgrid);
    let pageShapes = _.map(pages, p => p.shapes);


    setupFrameLayout();

    pageview.setupPageImages('div.page-images', pageShapes);
    setupPageTextGrids('div.page-textgrids', textgrids);

    rtrees.initRTrees(textgrids);

    lbl.updateAnnotationShapes();

    return d3;

}
