/**
 *
 **/

/* global */

import * as _ from 'lodash';
import * as $ from 'jquery';
import * as d3 from 'd3';

import * as lbl from './labeling';
import * as coords from './coord-sys.js';
import * as panes from  './splitpane-utils.js';
import * as util from  './commons.js';
import * as rtrees from  './rtrees.js';
import * as reflowWidget from  './ReflowWidget.js';
import * as reflowWidgetInit from  './ReflowWidgetInit.js';

import {awaitUserSelection} from './dragselect';
import Tippy from 'tippy.js';
import {$id, t, icon} from './jstags.js';
import * as d3x from './d3-extras';
import * as mhs from './MouseHandlerSets';

import * as server from './serverApi.js';
import * as textview from  './view-pdf-text.js';
import { shared } from './shared-state';
import * as global from './shared-state';
import {zipWithIndex} from './lodash-plus';



function defaultModeMouseHandlers($pageImageDiv, pageNum) {

    $pageImageDiv.on("mousedown", function() {
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
                textview.syncScrollTextGridToImageClick(clickPt, nearestNeighbor.gridDataPt);
            }
        }
    });


    $pageImageDiv.on("mousemove", function() {
        let mouseEvent = d3.event;
        let svgUserPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));

        // buttons: 0=none, 1=left, 3=middle, 2=right
        let b = mouseEvent.buttons;
        if (b == 1) {
            // let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);

            mouseEvent.stopPropagation(); // silence other listeners

            awaitUserSelection($pageImageDiv, svgUserPt)
                .then(pointOrRect => {
                    defaultModeMouseHandlers($pageImageDiv, pageNum);
                    console.log('awaitUserSelection: ', pointOrRect);
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
                                textview.syncScrollTextGridToImageClick(clickPt, nearestNeighbor.gridDataPt);
                            }
                        }
                    } else if (pointOrRect.rect) {
                        let selectionRect = pointOrRect.rect;
                        let pdfImageRect = coords.mk.fromLtwhObj(selectionRect, coords.coordSys.pdf);

                        let hits = rtrees.searchPage(pageNum, pdfImageRect);

                        let minBoundSelection = rtrees.queryHitsMBR(hits);

                        // console.log('minBoundSelection: ', minBoundSelection);

                        createImageLabelingPanel(pdfImageRect, minBoundSelection, pageNum);
                    }

                });
        } else {
            displayLabelHovers(pageNum, svgUserPt);
            displayCharHoverReticles($pageImageDiv, pageNum, svgUserPt);
        }
    });

    $pageImageDiv.on("mouseup", function() {});
    $pageImageDiv.on("mouseover", function() {});
    $pageImageDiv.on("mouseout", function() {});
}


function setupSelectionHighlighting() {

    shared.rx.selections.subscribe(currSelects => {
        d3.selectAll('.annotation-rect')
            .classed('annotation-selected', false);

        let groups = _.groupBy(currSelects, p => p.pageNum);

        _.each(groups, pageGroup => {
            let pageNum = pageGroup[0].pageNum;
            let svgPageSelector = `svg#page-image-${pageNum}`;

            _.each(pageGroup, r => {
                d3.select(svgPageSelector)
                    .select(r.selector)
                    .classed('annotation-selected', true);
            });
        });
    });
}

function toggleLabelSelection(pageNum, clickedItems) {
    let nonintersectingItems = _.differenceBy(clickedItems,  shared.currentSelections, s => s.id);
    global.setSelections(nonintersectingItems);
}

function displayLabelHovers(pageNum, hoverPt) {
    // let pageImageFrameId = `div#page-image-frame-${pageNum}`;
    let queryBox = coords.mk.fromLtwh(hoverPt.x, hoverPt.y, 1, 1);
    // console.log('displayLabelHovers, page:', pageNum);

    let hoveredLabels = rtrees.searchPageLabels(pageNum, queryBox);

    let hoveredTooltips = _.map(hoveredLabels, hit => {
        let $hit = $(hit.selector);
        $hit.attr('title', hit.label);


        let tooltip = _.remove(shared.tooltips, tt => tt.id == hit.id)[0];
        if (tooltip === undefined) {
            tooltip = $hit.prop('_tippy');
            if (tooltip === undefined) {
                Tippy(hit.selector, {
                    updateDuration: 0,
                    popperOptions: {
                        modifiers: {
                            // preventOverflow: {
                            //     enabled: false
                            // },
                            computeStyle: {
                                gpuAcceleration: false
                            }
                        }
                    }
                });
                tooltip = $hit.prop('_tippy');
                tooltip.id = hit.id;
            }
        }
        tooltip.show();
        return tooltip;
    });

    _.each(shared.tooltips, tooltip => {
        tooltip.hide();
    });

    shared.tooltips = hoveredTooltips;
}

function displayCharHoverReticles(d3$svg, pageNum, userPt) {

    let pageImageRTree  = shared.pageImageRTrees[pageNum] ;
    // let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));

    let queryWidth = 20;
    let queryBoxHeight = shared.TextGridLineHeight * 2;
    let queryLeft = userPt.x-queryWidth;
    let queryTop = userPt.y-queryBoxHeight;
    let queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

    let searchHits = pageImageRTree.search(queryBox);
    let hits = _.sortBy(
        searchHits,
        hit => [hit.bottom, hit.right]
    );

    showPageImageGlyphHoverReticles(d3$svg, hits, queryBox);
    let textgridSvg = d3x.d3select.pageTextgridSvg(pageNum);
    // let gridData = _.map(hits, h => h.gridDataPt);
    // if (gridData.length > 0) {
    //     console.log('gridData', gridData);
    // }
    textview.showTexgridHoverReticles(textgridSvg, _.map(hits, h => h.gridDataPt));
}


export function showPageImageGlyphHoverReticles(d3$pageImageSvg, queryHits) {
    let d3$imageHitReticles = d3$pageImageSvg
        .selectAll('.textloc')
        .data(queryHits, d => d.id)
    ;

    d3$imageHitReticles .enter()
        .append('rect')
        .datum(d => d.glyphDataPt? d.glyphDataPt : d)
        .classed('textloc', true)
        .call(d3x.initRect, d => d)
        .call(d3x.initStroke, 'blue', 1, 0.2)
        .call(d3x.initFill, 'blue', 0.5)
    ;

    d3$imageHitReticles .exit() .remove() ;
}



function createImageLabelingPanel(userSelection, mbrSelection, page) {

    let svgPageSelector = `svg#page-image-${page}`;

    d3.select(svgPageSelector)
        .append('rect')
        .call(d3x.initRect, () => userSelection)
        .classed('label-selection-rect', true)
        .call(d3x.initStroke, 'blue', 1, 1.0)
        .call(d3x.initFill, 'yellow', 0.7)
        .transition().duration(200)
        .call(d3x.initRect, () => mbrSelection)
        .call(d3x.initFill, 'yellow', 0.3)
    ;

    lbl.createHeaderLabelUI(mbrSelection, page);

}

function setupStatusBar(statusBarId) {

    $id(statusBarId)
        .addClass('statusbar');

    let $selectStatus = t.div('.statusitem', "Selections");

    shared.rx.selections.subscribe( selectedZones => {
        $selectStatus.empty();
        $selectStatus.append(t.span(`Selected:${selectedZones.length} del: `));

        if (selectedZones.length == 1) {
            let selection = selectedZones[0];
            let gridForSelection = reflowWidgetInit.getTextGridForSelectedZone(selection);
            let deleteBtn = t.button([icon.trash]);
            deleteBtn.on('click', function() {
                let zoneId = selection.zoneId;
                server.deleteZone(zoneId).then(resp => {
                    global.setSelections([]);
                    shared.activeReflowWidget = undefined;
                    lbl.updateAnnotationShapes();
                }).catch(() => {
                    shared.activeReflowWidget = undefined;
                    lbl.updateAnnotationShapes();
                    global.setSelections([]);
                }) ;
            });

            $selectStatus.append(deleteBtn);

            if (gridForSelection !== undefined) {
                reflowWidgetInit.showGrid(gridForSelection);
            } else {
                let gridShaperBtn = t.button([icon.fa('indent')]);

                gridShaperBtn.on('click', function() {
                    let textGrid = reflowWidgetInit.createTextGridFromSelectedZone(selection);
                    reflowWidgetInit.showGrid(textGrid);
                });
                $selectStatus.append(gridShaperBtn);

            }
        }
        else if (selectedZones.length > 1) {
            reflowWidget.unshowGrid();



        } else {
            reflowWidget.unshowGrid();
            $selectStatus.text(``);
        }
    });

    let $mouseCoords = t.div('.statusitem', 'Mouse');
    shared.rx.clientPt.subscribe(clientPt => {
        $mouseCoords.text(`x:${clientPt.x} y:${clientPt.y}`);
    });

    $id(statusBarId)
        .append($selectStatus)
        .append($mouseCoords);

}

export function setupPageImages(contentSelector, pageGeometries) {

    let ctx = {maxh: 0, maxw: 0};

    pageGeometries = _.map(zipWithIndex(pageGeometries), ([g, i]) => {
        let pageBounds = coords.mk.fromArray(g);
        pageBounds.page = i+1;
        return pageBounds;
    });


    _.each(pageGeometries, sh  => {
        ctx.maxh = Math.max(ctx.maxh, sh.y + sh.height);
        ctx.maxw = Math.max(ctx.maxw, sh.x + sh.width);
    });

    panes.setParentPaneWidth(contentSelector, ctx.maxw + 80);

    let {topPaneId: statusBar, bottomPaneId: pageImageDivId} =
        panes.splitHorizontal(contentSelector, {fixedTop: 30});

    setupStatusBar(statusBar);

    $id(pageImageDivId).append(
        t.div('.split-pane-component-inner', [
            t.div('#page-images .page-images')
        ])
    );

    let imageSvgs = d3.select("#page-images")
        .selectAll(".page-image")
        .data(pageGeometries, d3x.getId)
        .enter()
        .append('div').classed('page-image', true)
        .attr('id', (d, i) => `page-image-frame-${i}`)
        .attr('width', d => d.x + d.width)
        .attr('height', (d) => d.y + d.height )
        .append('svg').classed('page-image', true)
        .attr('id', (d, i) => `page-image-${i}`)
        .attr('width', d => d.x + d.width)
        .attr('height', (d) => d.y + d.height )
        // .attr('transform', 'scale(0.9)')
    ;

    d3.selectAll("svg.page-image")
        .each(function (d, i){
            let self = d3.select(this);
            return self .append('image')
                .attr("x"      , d =>  d.x )
                .attr("y"      , d =>  d.y )
                .attr("width"  , d =>  d.width )
                .attr("height" , d =>  d.height )
                .attr("href"   , d =>  '/api/v1/corpus/artifacts/entry/'+util.corpusEntry()+'/image/page/'+d.page )
            ;
        })
    ;

    // d3.selectAll('svg.page-image')
    //     .each(function (pageData, pageNum){
    //         let d3$svg = d3.select(this);
    //         console.log('d3.this', this);
    //         initPageImageMouseHandlers(d3$svg, pageNum);
    //     }) ;

    d3.selectAll('div.page-image')
        .each(function (pageData, pageNum){
            // let d3$svg = d3.select(this);
            // console.log('d3.this', this);
            defaultModeMouseHandlers($(this), pageNum);
        }) ;

    lbl.updateAnnotationShapes();

    setupSelectionHighlighting();
}
