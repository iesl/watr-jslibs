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

import * as d3x from './d3-extras';

import { shared } from './shared-state';

/** Page sync flashing indicator dot */
function scrollSyncIndicator(parentSelection, indicatorPoint) {
    d3.select(parentSelection)
        .append('circle')
        .attr("cx", indicatorPoint.x)
        .attr("cy", indicatorPoint.y)
        .attr("r", 20)
        .call(d3x.initStroke, 'black', 1, 0)
        .call(d3x.initFill, 'red', 1)
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
        .call(d3x.initStroke, 'blue', 1, 0.6)
        .call(d3x.initFill, 'blue', 0.2)
    ;
    return reticleGroup;
}

export function showGlyphHoverReticles(d3$textgridSvg, queryBox, queryHits) {
    let pageNum = parseInt(d3$textgridSvg.attr('page'));

    d3$textgridSvg.select('g.reticles')
        .select('rect.query-reticle')
        .call(d3x.initRect, () => queryBox)
    ;

    showTexgridHoverReticles(d3$textgridSvg, queryHits);

    let ns = _.filter(queryHits, (hit) => {
        return hit.glyphDataPt !== undefined;
    });

    pageview.showPageImageGlyphHoverReticles(
        d3x.d3select.pageImage(pageNum),
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
        .call(d3x.initRect, d => d)
        .call(d3x.initStroke, 'green', 1, 0.2)
        .call(d3x.initFill, 'yellow', 0.7)
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
        .call(d3x.initRect, d => d)
        .call(d3x.initStroke, 'black', 1, 0.1)
        .call(d3x.initFill, 'blue', 0.1)
    ;

    sel.exit().remove() ;
}


export function textgridSvgHandlers(d3$textgridSvg) {
    let pageNum = parseInt(d3$textgridSvg.attr('page'));
    let reticleGroup = initHoverReticles(d3$textgridSvg);

    let neighborHits = [];

    d3$textgridSvg
        .on("mouseover", function() {
            reticleGroup.attr("opacity", 0.4);

        })
        .on("mouseout", function() {
            reticleGroup.attr("opacity", 0);
            d3.selectAll('.textloc').remove();
        });

    d3$textgridSvg.on("mousedown",  function() {
        let mouseEvent = d3.event;

        let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);

        if (neighborHits.length > 0) {
            let firstHit = neighborHits[neighborHits.length-1];

            syncScrollPageImageToTextClick(clientPt, firstHit);
        }})
        .on("mouseup", function() {})
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

            showGlyphHoverReticles(d3$textgridSvg, queryBox, neighborHits);
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
        gridHeight = Math.min(gridHeight, 2500);
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

}
