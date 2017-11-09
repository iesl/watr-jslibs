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
import Tooltip from 'tooltip.js';

import * as textview from  './textgrid-view.js';
import {initD3DragSelect} from  './dragselect.js';

import { globals } from './globals';


// function awaitUserSelection(d3$svg, pageNum, initd3Event) {
function awaitUserSelection(d3$svg, pageNum, initSvgPt, initClientPt) {

    return new Promise((resolve, reject) => {

        let selState = {
            element: null,
            previousElement: null,
            svgSelector: d3$svg.attr('id'),
            originPt: initSvgPt,
            currentPt: initSvgPt
        };

        console.log('selState', selState);
        init(initSvgPt, initClientPt);

        function init(svgPt, clientPt) {

            let rectElement = d3$svg.append("rect")
                .classed("selection", true)
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("x", 0)
                .attr("y", 0)
                .attr("width",0)
                .attr("height", 0)
            ;

            setElement(rectElement);
            selState.originPt.x = svgPt.x;
            selState.originPt.y = svgPt.y;
            update(svgPt, clientPt);
        }

        function update(svgPt, clientPt) {
            globals.currentMousePos.x = clientPt.x;
            globals.currentMousePos.y = clientPt.y;
            $("li > span#mousepos").text(
                `x: ${clientPt.x}, y: ${clientPt.y} / ${selState.svgSelector} @  ${svgPt.x},${svgPt.y} `
            );

            selState.currentPt = svgPt;
            _.each(getNewAttributes(), (v, k) => {
                selState.element.attr(k, v);
            });
        }


        function setElement(ele) {
            selState.previousElement = selState.element;
            selState.element = ele;
        }

        function getNewAttributes() {
            let x = selState.currentPt.x < selState.originPt.x ? selState.currentPt.x : selState.originPt.x;
            let y = selState.currentPt.y < selState.originPt.y ? selState.currentPt.y : selState.originPt.y;
            let width = Math.abs(selState.currentPt.x - selState.originPt.x);
            let height = Math.abs(selState.currentPt.y - selState.originPt.y);
            return {
                x: x,
                y: y,
                width: width,
                height: height
            };
        }

        function getCurrentAttributes() {
            let x = parseInt(selState.element.attr("x"));
            let y = parseInt(selState.element.attr("y"));
            let width = parseInt(selState.element.attr("width"));
            let height = parseInt(selState.element.attr("height"));
            return {
                svgSelector: selState.svgSelector,
                x1: x,
                y1: y,
                x2: x + width,
                y2: y + height
            };
        }


        function remove() {
            selState.element.remove();
            selState.element = null;
        }

        function removePrevious() {
            if (selState.previousElement) {
                selState.previousElement.remove();
            }
        }



        // function dragStart() {
        //     let mouseEvent = d3.event.sourceEvent;

        //     // 0=left, 1=middle, 2=right
        //     let b = mouseEvent.button;
        //     if (b == 0) {
        //         let p = d3.mouse(this);
        //         let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);
        //         init(p[0], p[1], clientPt);
        //         removePrevious();
        //         mouseEvent.stopPropagation(); // silence other listeners
        //     }
        // }


        d3$svg.on("mouseup", function() {
            // return either point or rect
            if (selState.element != null) {
                let finalAttributes = getCurrentAttributes();

                if (finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1) {
                    d3.event.preventDefault();
                    remove();
                    resolve({
                        rect: finalAttributes
                    });
                } else {
                    remove();
                    resolve({
                        point: {
                            svgSelector: finalAttributes.svgSelector,
                            x: finalAttributes.x1,
                            y: finalAttributes.y1
                        }
                    });
                }
            } else {
                reject("???");
            }
        });
        d3$svg.on("mousemove", function() {
            if (selState.element != null) {
                let p = d3.mouse(this);
                let mouseEvent = d3.event;
                let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);
                let clickPt = coords.mkPoint.fromD3Mouse(p);
                update(clickPt, clientPt);
            }
        });

        d3$svg.on("mousedown", function() {});
        d3$svg.on("mouseover", function() {});
        d3$svg.on("mouseout", function() {});
    });
}

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


    d3$svg.on("mousemove", function(underlings) {
        let mouseEvent = d3.event;
        let svgUserPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));

        // button: 0=left, 1=middle, 2=right
        // buttons: 0=none, 1=left, 3=middle, 2=right
        let b = mouseEvent.buttons;
        if (b == 1) {
            let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);
            //         init(p[0], p[1], clientPt);
            //         removePrevious();
            mouseEvent.stopPropagation(); // silence other listeners
            awaitUserSelection(d3$svg, pageNum, svgUserPt, clientPt)
                .then(pointOrRect => {
                    defaultModeMouseHandlers(d3$svg, pageNum);
                    if (pointOrRect.point != undefined) {
                        let clickPt = pointOrRect.point;
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
                    } else if (pointOrRect.rect != undefined) {
                        let selectionRect = pointOrRect.rect;
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
    // function clickHandler(pageNum, clickPt) {

    //     let queryBox = coords.mk.fromLtwh(clickPt.x, clickPt.y, 1, 1);
    //     let hoveredLabels = rtrees.searchPageLabels(pageNum, queryBox);
    //     if (hoveredLabels.length > 0) {

    //         toggleLabelSelection(pageNum, hoveredLabels);

    //     } else {

    //         let pageStr = clickPt.svgSelector.split('-').pop();
    //         let page =  parseInt(pageStr);

    //         let neighbors = rtrees.knnQueryPage(page, clickPt, 4);

    //         if (neighbors.length > 0) {
    //             let nearestNeighbor = neighbors[0];
    //             // let ns = _.map(neighbors, (n) => n.char).join('');
    //             textview.syncScrollTextGrid(clickPt, nearestNeighbor);
    //         }

    //     }
    // }
    // function selectionHandler(selectionRect) {
    //     let pdfImageRect = coords.mk.fromXy12(selectionRect, coords.coordSys.pdf);

    //     let pageStr = selectionRect.svgSelector.split('-').pop();
    //     let page = parseInt(pageStr);

    //     let hits = rtrees.searchPage(page, pdfImageRect);

    //     let minBoundSelection = rtrees.queryHitsMBR(hits);

    //     let annotation = lbl.mkAnnotation({
    //         type: 'bounding-boxes',
    //         page: page,
    //         targets: [[page, minBoundSelection]] // TODO should be another level of nesting here
    //     });

    //     createImageLabelingPanel(pdfImageRect, annotation);
    // }

    // d3$svg.on("mousemove", function(d) {
    //     let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));
    //     displayCharHoverReticles(d3$svg, pageNum, userPt);
    //     displayLabelHovers(pageNum, userPt);
    // });

    // initD3DragSelect(d3$svg.attr('id'), (pointOrRect) => {
    //     if (pointOrRect.point != undefined) {
    //         clickHandler(pageNum, pointOrRect.point);
    //     } else if (pointOrRect.rect != undefined) {
    //         selectionHandler(pointOrRect.rect);
    //     } else {
    //         // Move handler
    //     }
    // });
}

// let currentSelections = [];

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
