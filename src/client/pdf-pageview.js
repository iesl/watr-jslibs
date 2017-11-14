/**
 *
 *
 **/

import * as d3 from 'd3';
import * as $ from 'jquery';
import * as _ from 'lodash';
import * as lbl from './labeling';
import * as coords from './coord-sys.js';
import * as panes from  './splitpane-utils.js';
import * as util from  './commons.js';
import * as rtrees from  './rtrees.js';
import awaitUserSelection from './dragselect.js';
import Tooltip from 'tooltip.js';
import {$id, div, a, btn, span, icon} from './jstags.js';
import Rx from 'rxjs/Rx';
import * as server from './serverApi.js';

import * as textview from  './textgrid-view.js';

import { globals } from './globals';
import * as global from './globals';

import 'font-awesome/css/font-awesome.css';

function defaultModeMouseHandlers(d3$svg, pageNum) {
    d3$svg.on("mousedown", function() {
        // one of:
        //  - toggle labeled region selection
        //  - sync textgrid to clicked pt
        //  - begin selection handling
        let clickPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));
        let queryBox = coords.mk.fromLtwh(clickPt.x, clickPt.y, 1, 1);
        let hoveredLabels = rtrees.searchPageLabels(pageNum, queryBox);
        if (hoveredLabels.length > 0) {

            toggleLabelSelection(pageNum, hoveredLabels);

        } else {

            let neighbors = rtrees.knnQueryPage(pageNum, clickPt, 4);
            if (neighbors.length > 0) {
                let nearestNeighbor = neighbors[0];
                // let ns = _.map(neighbors, (n) => n.char).join('');
                textview.syncScrollTextGrid(clickPt, nearestNeighbor);
            }

        }
    });


    d3$svg.on("mousemove", function() {
        let mouseEvent = d3.event;
        let svgUserPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));

        // buttons: 0=none, 1=left, 3=middle, 2=right
        let b = mouseEvent.buttons;
        if (b == 1) {
            // let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);

            mouseEvent.stopPropagation(); // silence other listeners

            awaitUserSelection(d3$svg, svgUserPt)
                .then(pointOrRect => {
                    defaultModeMouseHandlers(d3$svg, pageNum);
                    if (pointOrRect.point) {
                        let clickPt = pointOrRect.point;
                        let queryBox = coords.mk.fromLtwh(clickPt.x, clickPt.y, 1, 1);
                        let hoveredLabels = rtrees.searchPageLabels(pageNum, queryBox);
                        if (hoveredLabels.length > 0) {
                            toggleLabelSelection(pageNum, hoveredLabels);
                        } else {

                            let neighbors = rtrees.knnQueryPage(pageNum, clickPt, 4);

                            if (neighbors.length > 0) {
                                let nearestNeighbor = neighbors[0];
                                // let ns = _.map(neighbors, (n) => n.char).join('');
                                textview.syncScrollTextGrid(clickPt, nearestNeighbor);
                            }
                        }
                    } else if (pointOrRect.rect) {
                        let selectionRect = pointOrRect.rect;
                        let pdfImageRect = coords.mk.fromLtwhObj(selectionRect, coords.coordSys.pdf);

                        let hits = rtrees.searchPage(pageNum, pdfImageRect);

                        let minBoundSelection = rtrees.queryHitsMBR(hits);

                        let annotation = lbl.mkAnnotation({
                            type: 'bounding-boxes',
                            page: pageNum,
                            targets: [[pageNum, minBoundSelection]] // TODO should be another level of nesting here
                        });

                        createImageLabelingPanel(pdfImageRect, annotation);
                    } else {
                        // Move handler
                    }

                });
        } else {
            displayLabelHovers(pageNum, svgUserPt); // OrElse:
            displayCharHoverReticles(d3$svg, pageNum, svgUserPt);
        }
    });

    d3$svg.on("mouseup", function() {});
    d3$svg.on("mouseover", function() {});
    d3$svg.on("mouseout", function() {});
}

function initPageImageMouseHandlers(d3$svg, pageNum) {
    defaultModeMouseHandlers(d3$svg, pageNum);
}

function setupSelectionHighlighting() {

    globals.rx.selections.subscribe(currSelects=> {

        d3.selectAll('.select-highlight')
            .remove();

        let groups = _.groupBy(currSelects, p => p.pageNum);

        _.each(groups, pageGroup => {
            let pageNum = pageGroup[0].pageNum;
            let svgPageSelector = `svg#page-image-${pageNum}`;
            d3.select(svgPageSelector)
                .selectAll('.select-highlight')
                .data(pageGroup)
                .enter()
                .append('rect')
                .classed('select-highlight', true)
                .call(util.initRect, d => d)
                .call(util.initStroke, 'black', 1, 0.9)
                .call(util.initFill, 'red', 0.3)
            ;

        });




    });

}
function toggleLabelSelection(pageNum, clickedItems) {

    let nonintersectingItems = _.differenceBy(clickedItems,  globals.currentSelections, s => s.id);

    global.setSelections(nonintersectingItems);
}



function displayLabelHovers(pageNum, hoverPt) {
    let queryBox = coords.mk.fromLtwh(hoverPt.x, hoverPt.y, 1, 1);

    let hoveredLabels = rtrees.searchPageLabels(pageNum, queryBox);
    if (hoveredLabels.length > 0) {
        _.each(hoveredLabels, hoverHit => {
            let $hit = $(hoverHit.selector);
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

function setupStatusBar(statusBarId) {

    $id(statusBarId)
        .addClass('statusbar');

    let $selectStatus = div('.statusitem', "Selections");

    globals.rx.selections.subscribe(currSelects=> {
        if (currSelects.length > 0) {
            let deleteBtn = btn('.btn', '.btn-sm', '.btn-default', [icon.trash]);
            var clicks = Rx.Observable.fromEvent(deleteBtn, 'click');
            clicks.subscribe(() => {
                let zoneIds = _.map(currSelects, (sel) => sel.zoneId);
                let delReq = {
                    stableId: globals.currentDocument,
                    zoneIds: zoneIds
                };
                server.deleteLabels(delReq).then(resp => {
                    console.log("deleted labels!", resp);
                    global.setSelections([]);

                    lbl.refreshZoneHightlights(resp.zones);
                }).catch(err => {
                    console.log("ERROR deleted labels!", err);
                    global.setSelections([]);

                })
                ;
            });

            $selectStatus.empty();
            $selectStatus.append(span(`Selected:${currSelects.length} del: `));
            $selectStatus.append(deleteBtn);
        } else {
            $selectStatus.text(``);
        }
    });

    let $mouseCoords = div('.statusitem', 'Mouse');
    globals.rx.clientPt.subscribe(clientPt => {
        $mouseCoords.text(`x:${clientPt.x} y:${clientPt.y}`);
    });

    $id(statusBarId)
        .append($selectStatus)
        .append($mouseCoords);

}

export function setupPageImages(contentSelector, pageImageShapes) {

    let ctx = {maxh: 0, maxw: 0};

    _.map(pageImageShapes, (sh) =>{
        ctx.maxh = Math.max(ctx.maxh, sh[0].y + sh[0].height);
        ctx.maxw = Math.max(ctx.maxw, sh[0].x + sh[0].width);
    });

    panes.setParentPaneWidth(contentSelector, ctx.maxw + 80);

    let {topPaneId: statusBar, bottomPaneId: pageImageDivId} =
        panes.splitHorizontal(contentSelector, {fixedTop: 30});

    setupStatusBar(statusBar);

    $id(pageImageDivId)
        .addClass('page-images');

    let imageSvgs = d3.select("#"+pageImageDivId)
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

    setupSelectionHighlighting();

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
