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
import * as util from  './commons.js';
// import * as rtrees from  './rtrees.js';
import * as pageview from  './view-pdf-pages.js';
import {t} from './jstags.js';

import '../style/view-pdf-text.less';
// import '../style/view-pdf-pages.less';

// import keyboardJS from 'keyboardjs';

import { globals } from './globals';
// let rtree = require('rbush');

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
        .call(util.initStroke, 'black', 1, 0)
        .call(util.initFill, 'red', 1)
        .transition()
        .duration(300)
        .attr("r", 2)
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
        return hit.glyphDataPt !== undefined;
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



/**
 *  Capture a click on the textgrid-side and scroll the corresponding page image into
 *  view, flashing an indicator on the image point corresponding to the text
 */
function syncScrollPageImageToTextClick(clientPt, dataPt) {
    // syncScrollFrame(clientPt, dataPt.pdfBounds, dataPt.page, 'page-image', '.page-images');
    let pageNum = dataPt.page;
    let whichSide = 'page-image';
    let pageImageFrameId = `div#${whichSide}-frame-${pageNum}`;

    let scrollTo = $(pageImageFrameId).position().top + $('.page-images').scrollTop(); // Value to scroll page top-edge to top of view pane
    scrollTo -= globals.currMouseClientPt.y;  // adjust so that  page top is at same client-y as user's mouse
    scrollTo += 75; // fudge factor to adjust for topbar+statusbar heights
    scrollTo += dataPt.top;  // adjust so that clicked text is even w/user's mouse

    $('.page-images').scrollTop(scrollTo);

    scrollSyncIndicator(
        `svg#${whichSide}-${pageNum}`,
        dataPt.glyphDataPt.topLeft
    );
}

/**
 *  Capture a click on the page image side and scroll the corresponding page text into
 *  view, flashing an indicator on the text point
 */
export function syncScrollTextGridToImageClick(clientPt, txtDataPt) {

    let { page: pageNum, row: row } = txtDataPt;

    // // TODO: this looks wrong:
    // let pageTextgridSvgId = `div#textgrid-frame-${pageNum}`;
    // let frameTop = $(pageTextgridSvgId).position().top;

    // // let containerTop = $(`div.page-textgrids`).position().top;
    // let absFrameTop = frameTop; //  - containerTop ;

    let textGridNeighborY = row * TextGridLineHeight;
    // let scrollTo = absFrameTop + (textGridNeighborY - clientPt.y - 10);

    // $('#splitpane_root__bottom__right').scrollTop(scrollTo);

    let whichSide = 'textgrid';
    let pageFrameId = `div#${whichSide}-frame-${pageNum}`;
    console.log('pageFrameId', pageFrameId);

    let scrollTo = $(pageFrameId).position().top + $('.page-textgrids').scrollTop(); // Value to scroll page top-edge to top of view pane
    scrollTo -= globals.currMouseClientPt.y;  // adjust so that  page top is at same client-y as user's mouse
    scrollTo += 50; // fudge factor to adjust for topbar+statusbar heights
    scrollTo += textGridNeighborY;  // adjust so that clicked text is even w/user's mouse

    $('.page-textgrids').scrollTop(scrollTo);

    scrollSyncIndicator(
        `svg#textgrid-svg-${pageNum}`,
        coords.mkPoint.fromXy(txtDataPt.left-20, textGridNeighborY+10)
    );

}

function showSelectionHighlight(d3$textgridSvg, selections) {

    let sel = d3$textgridSvg
        .selectAll("rect.glyph-selection")
        .data(selections, d=> d.id)
    ;
    sel.enter()
        .append('rect')
        .classed("glyph-selection", true)
        .attr('id', d => d.id)
        .call(util.initRect, d => d)
        .call(util.initStroke, 'black', 1, 0.1)
        .call(util.initFill, 'blue', 0.1)
    ;

    sel.exit().remove() ;
}


// Setup keyboard watcher
// function initKeyboardHandlers() {
//     function rebind(domNode) {
//         keyboardJS.reset();
//         keyboardJS.watch(domNode);
//         keyboardJS.bind('a', function(kdownEvent) {
//             console.log('kdown', kdownEvent);
//             kdownEvent.preventRepeat();
//         }, function(kupEvent) {
//         });

//     }

//     $('svg.textgrid').each(function() {
//         console.log('watch', this);
//         $(this)
//             .on("mouseover", () => rebind(this))
//             .on("mouseout", () => keyboardJS.watch())
//         ;
//     });

// }


export function textgridSvgHandlers(d3$textgridSvg) {
    let pageNum = parseInt(d3$textgridSvg.attr('page'));
    let reticleGroup = initHoverReticles(d3$textgridSvg);

    let neighborHits = [];
    let gridSelection = [];
    let selectionStartId = undefined;
    let selectionEndId = undefined;

    d3$textgridSvg
        .on("mouseover", function() {
            reticleGroup.attr("opacity", 0.4);

            // Set statusbar page num
        })
        .on("mouseout", function() {
            // remove key handlers
            // clear statusbar

            reticleGroup.attr("opacity", 0);

            d3.selectAll('.textloc').remove();

        });

    d3$textgridSvg.on("mousedown",  function() {
        let mouseEvent = d3.event;

        let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);

        if (neighborHits.length > 0) {
            let firstHit = neighborHits[neighborHits.length-1];

            syncScrollPageImageToTextClick(clientPt, firstHit);

            if (mouseEvent.shiftKey) {
                // Start text selection
                selectionEndId = selectionStartId = parseInt(firstHit.id);
            }
        }})
        .on("mouseup", function() {
            if (selectionStartId !== undefined) {

                let annotBoxes = _.map(gridSelection, pt => pt.locus[0]);


                let annotation = lbl.mkAnnotation({
                    type: 'char-boxes',
                    page: pageNum,
                    targets: annotBoxes
                });

                console.log('annotating', annotation);

                gridSelection = [];
                selectionStartId = undefined;
                selectionEndId = undefined;
                d3$textgridSvg
                    .selectAll("rect.glyph-selection")
                    .remove() ;

                createTextGridLabelingPanel(annotation);
            }

        })
        .on("mousemove", function() {
            let textgridRTree = globals.textgridRTrees[pageNum] ;
            let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));
            let queryWidth = 20;
            let queryBoxHeight = TextGridLineHeight * 2;
            let queryLeft = userPt.x-queryWidth;
            let queryTop = userPt.y-queryBoxHeight;
            let queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

            let hits = neighborHits = textgridRTree.search(queryBox);

            neighborHits = _.sortBy(
                _.filter(hits, hit => hit.glyphDataPt != undefined),
                hit => [hit.bottom, hit.right]
            );

            // console.log('neighborHits', neighborHits);

            if (selectionStartId) {
                let selectQuery = coords.mk.fromLtwh(userPt.x, userPt.y, 1, 1);
                let selectHits = textgridRTree.search(selectQuery);

                let hitId = selectHits[0] ? parseInt(selectHits[0].id) : undefined;
                if (selectHits.length>0 && selectionEndId != hitId) {
                    selectionEndId = hitId;
                    if (selectionStartId <= selectionEndId) {
                        gridSelection = globals.dataPts[pageNum].slice(selectionStartId, selectionEndId+1);
                    } else {
                        gridSelection = globals.dataPts[pageNum].slice(selectionEndId, selectionStartId);
                    }

                    showSelectionHighlight(d3$textgridSvg, gridSelection);
                }
            } else if (neighborHits.length > 0) {
                showGlyphHoverReticles(d3$textgridSvg, queryBox, neighborHits);
            }
        })
    ;

}



function createTextGridLabelingPanel(annotation) {

    let $labeler = lbl.createTextGridLabeler(annotation);

    $labeler.find('.modal-dialog').css({
        'position': 'absolute',
        'left': globals.currMouseClientPt.x + "px",
        'top': globals.currMouseClientPt.y + "px"
    });

    $labeler.modal();
}


export function setupPageTextGrids(contentId, textgrids) {
    let fixedTextgridWidth = 900;

    let computeGridHeight = (grid) => {
        return (grid.rows.length * TextGridLineSpacing) + TextGridOriginPt.y + 10;
    };

    _.each(textgrids, (textgrid, gridNum) => {
        let gridHeight = computeGridHeight(textgrid);
        let frameIdSelector = `#textgrid-frame-${gridNum}`;
        let gridNodes =
            t.div('.textgrid', frameIdSelector, {
                style: `width: 900; height:${gridHeight}`}, [
                    t.canvas('.textgrid', `#textgrid-canvas-${gridNum}`,
                             {page: gridNum, width: fixedTextgridWidth, height: gridHeight})
                ]) ;

        $(contentId).append(gridNodes);

        d3.select(frameIdSelector)
            .append('svg').classed('textgrid', true)
            .datum(textgrid)
            .attr('id', `textgrid-svg-${gridNum}`)
            .attr('page', gridNum)
            .attr('width', fixedTextgridWidth)
            .attr('height', gridHeight)
        ;

    });

    // initKeyboardHandlers();
}
