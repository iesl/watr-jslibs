/**
 *
 *  Render for extracted text display (TextGrid)
 *  Canvas based implementation.  d3+svg was too sluggish.
 *
 */

/* global d3 _ $ */

import * as lbl from './labeling';
import * as coords from './coord-sys.js';
import * as util from  './commons.js';
import * as pageview from  './view-pdf-pages.js';
import {t} from './jstags.js';

import '../style/view-pdf-text.less';

import { shared } from './shared-state';

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


export function initHoverReticles(d3$textgridSvg) {
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

export function showGlyphHoverReticles(d3$textgridSvg, queryBox, queryHits) {
    let pageNum = parseInt(d3$textgridSvg.attr('page'));

    d3$textgridSvg.select('g.reticles')
        .select('rect.query-reticle')
        .call(util.initRect, () => queryBox)
    ;

    showTexgridHoverReticles(d3$textgridSvg, queryHits);

    let ns = _.filter(queryHits, (hit) => {
        return hit.glyphDataPt !== undefined;
    });

    pageview.showPageImageGlyphHoverReticles(
        util.d3select.pageImage(pageNum),
        ns
    );
}

export function showTexgridHoverReticles(d3$textgridSvg, gridDataPts) {

    let d3$hitReticles = d3$textgridSvg.select('g.reticles')
        .selectAll('.hit-reticle')
        .data(gridDataPts, (d) => d.id)
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
}


/**
 *  Capture a click on the textgrid-side and scroll the corresponding page image into
 *  view, flashing an indicator on the image point corresponding to the text
 */
function syncScrollPageImageToTextClick(clientPt, dataPt) {
    let pageNum = dataPt.page;
    let whichSide = 'page-image';
    let pageImageFrameId = `div#${whichSide}-frame-${pageNum}`;

    let scrollTo = $(pageImageFrameId).position().top + $('.page-images').scrollTop(); // Value to scroll page top-edge to top of view pane
    scrollTo -= shared.currMouseClientPt.y;  // adjust so that  page top is at same client-y as user's mouse
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

    let textGridNeighborY = row * shared.TextGridLineHeight;

    let whichSide = 'textgrid';
    let pageFrameId = `div#${whichSide}-frame-${pageNum}`;

    let scrollTo = $(pageFrameId).position().top + $('.page-textgrids').scrollTop(); // Value to scroll page top-edge to top of view pane
    scrollTo -= shared.currMouseClientPt.y;  // adjust so that  page top is at same client-y as user's mouse
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
                console.log('gridSelection', gridSelection);

                let gridDataPts = _.map(gridSelection, pt => pt.locus);

                gridSelection = [];
                selectionStartId = undefined;
                selectionEndId = undefined;
                d3$textgridSvg
                    .selectAll("rect.glyph-selection")
                    .remove() ;


                lbl.createTextGridLabeler(gridDataPts);

            }

        })
        .on("mousemove", function() {
            let textgridRTree = shared.textgridRTrees[pageNum] ;
            let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));
            let queryWidth = 20;
            let queryBoxHeight = shared.TextGridLineHeight * 2;
            let queryLeft = userPt.x-queryWidth;
            let queryTop = userPt.y-queryBoxHeight;
            let queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

            let hits = neighborHits = textgridRTree.search(queryBox);

            neighborHits = _.sortBy(
                _.filter(hits, hit => hit.glyphDataPt != undefined),
                hit => [hit.bottom, hit.left]
            );

            // console.log('neighborHits', neighborHits);

            if (selectionStartId) {
                let selectQuery = coords.mk.fromLtwh(userPt.x, userPt.y, 1, 1);
                let selectHits = textgridRTree.search(selectQuery);

                let hitId = selectHits[0] ? parseInt(selectHits[0].id) : undefined;
                if (selectHits.length>0 && selectionEndId != hitId) {
                    selectionEndId = hitId;
                    if (selectionStartId <= selectionEndId) {
                        gridSelection = shared.dataPts[pageNum].slice(selectionStartId, selectionEndId+1);
                    } else {
                        gridSelection = shared.dataPts[pageNum].slice(selectionEndId, selectionStartId);
                    }

                    showSelectionHighlight(d3$textgridSvg, gridSelection);
                }
            } else if (neighborHits.length > 0) {
                showGlyphHoverReticles(d3$textgridSvg, queryBox, neighborHits);
            }
        })
    ;

}




export function setupPageTextGrids(contentId, textgrids) {
    let fixedTextgridWidth = 900;

    let computeGridHeight = (grid) => {
        return (grid.rows.length * shared.TextGridLineHeight) + shared.TextGridOriginPt.y + 10;
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
