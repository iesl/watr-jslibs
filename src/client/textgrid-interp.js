/**
 *
 *  Renderer/Interpreter for extracted text display
 *  Canvas based implementation.  d3+svg was too sluggish.
 *
 */

/* global require setTimeout */

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
let rtree = require('rbush');

const TextGridLineSpacing = 16;
const TextGridLineHeight  = 16;
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

/**
 *  Capture a click on the page image side and scroll the corresponding page text into
 *  view, flashing an indicator on the text point
 */
function syncScrollTextGrid(clickPt, neighbor) {

    let { page: pageNum, row: row } = neighbor;

    let pageTextgridSvgId = `#textgrid-svg-${pageNum}`;
    let pageTextTop = $(pageTextgridSvgId).parent().position().top;

    let pageImageTop = $(`#page-image-${pageNum}`).parent().position().top;
    let pageTextClickY = clickPt.y;
    let pageImagesOffset = $('div.page-images').position().top;
    let userAbsY = pageImageTop + pageTextClickY + pageImagesOffset;
    // let pageRelativeClickedY = clickPt.y;

    let scrollTo = pageTextTop + (row * TextGridLineHeight) - userAbsY;

    $('#splitpane_root__bottom__right').scrollTop(scrollTo);

    scrollSyncIndicator(
        pageTextgridSvgId,
        coords.mkPoint.fromXy(10, (row*TextGridLineHeight)+10)
    );

}

function initHoverReticles(d3$textgridSvg) {
    let reticleGroup = d3$textgridSvg
        .append('g')
        .classed('reticles', true);

    // reticleGroup
    //     .append('line')
    //     .attr('x1', 10)
    //     .attr('x2', 90)
    //     .attr('y1', 30)
    //     .attr('y2', 400)
    //     .attr("stroke-width", 2)
    //     .attr('stroke', 'black')
    // ;

    reticleGroup
        .append('rect')
        .classed('query-reticle', true)
        .attr("opacity", 0.4)
        .attr("fill-opacity", 0.3)
        .attr("fill", 'blue')
    ;
    return reticleGroup;
}

function showGlyphHoverReticles(d3$textgridSvg, queryBox, queryHits) {
    let pageNum = parseInt(d3$textgridSvg.attr('page'));

    d3$textgridSvg.select('g.reticles')
        .select('rect.query-reticle')
        .attr("x", queryBox.left)
        .attr("y", queryBox.top)
        .attr("width", queryBox.width)
        .attr("height", queryBox.height)
    ;


    let d3$hitReticles = d3.select('g.reticles')
        .selectAll('.hit-reticle')
        .data(queryHits, (d) => d.id)
    ;

    d3$hitReticles
        .enter()
        .append('rect')
        .classed('hit-reticle', true)
        .attr('id', d => d.id)
        .attr("x", d => d.left)
        .attr("y", d => d.top)
        .attr("width", d => d.width)
        .attr("height", d => d.height)
        .attr("stroke-opacity", 0.2)
        .attr("fill-opacity", 0.8)
        .attr("fill", 'yellow')
        .attr("stroke", 'green')
    ;

    d3$hitReticles
        .exit()
        .remove() ;

    let ns = _.filter(queryHits, (hit) => {
        return hit.pdfBounds !== undefined;
    });

    let d3$imageHitReticles = util.d3select.pageImage(pageNum)
        .selectAll('.textloc')
        .data(ns, (d) => d.id)
    ;

    d3$imageHitReticles
        .enter()
        .append('rect')
        .datum(d => d.pdfBounds)
        .classed('textloc', true)
        .attr("x", d => d.left)
        .attr("y", d => d.top)
        .attr("width", d => d.width)
        .attr("height", d => d.height)
        .attr("stroke-opacity", 0.2)
        .attr("fill-opacity", 0.5)
        .attr("stroke-width", 1)
        .attr("stroke", 'blue')
        .attr("fill", 'blue') ;

    d3$imageHitReticles
        .exit()
        .remove() ;
}

/**
 *  Capture a click on the textgrid-side and scroll the corresponding page image into
 *  view, flashing an indicator on the image point corresponding to the text
 */
function syncScrollPageImages(userPt, dataPt) {

    let pageNum = dataPt.page;
    let pdfTextBox = dataPt.pdfBounds;
    // Get visible abs Y-position of user click:
    let pageTextTop = $(`#textgrid-svg-${pageNum}`).parent().position().top;
    let pageTextsOffset = $('div.page-textgrids').position().top;
    let userPageY = pageTextTop + userPt.y + pageTextsOffset;

    // Get offset of clicked text on page
    let pageImageSvgId = `#page-image-${pageNum}`;
    let pageImageTop = $(pageImageSvgId).parent().position().top;

    let scrollTo = pageImageTop + pdfTextBox.top - 10 - userPageY;

    $('#splitpane_root__bottom__left').scrollTop(scrollTo);

    scrollSyncIndicator(pageImageSvgId, pdfTextBox.topLeft);

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
        .attr("x", d => d.left)
        .attr("y", d => d.top)
        .attr("width", d => d.width)
        .attr("height", d => d.height)
        .attr("fill-opacity", 0.4)
        .attr("stroke-opacity", 0.1)
        .attr("stroke", 'black')
        .attr("fill", 'blue')
    ;

    sel.exit().remove() ;
}

let nextAnnotId = util.IdGenerator();
function mkAnnotation(props) {
    return Object.assign({id: nextAnnotId()}, props);
}
function textgridSvgHandlers(d3$textgridSvg) {
    let pageNum = parseInt(d3$textgridSvg.attr('page'));
    let reticleGroup = initHoverReticles(d3$textgridSvg);

    let neighborHits = [];
    let gridSelection = [];
    let selectionStartId = undefined;
    let selectionEndId = undefined;



    d3$textgridSvg
        .on("mousedown", function(d) {
            // let d3mouse = d3.mouse(this);
            let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));
            let mouseEvent = d3.event;


            if (neighborHits.length > 0) {
                let firstHit = neighborHits[neighborHits.length-1];
                // let firstNeighbor = neighborHits[0];
                syncScrollPageImages(userPt, firstHit);

                if (mouseEvent.shiftKey) {
                    selectionEndId = selectionStartId = parseInt(firstHit.id);
                }
            }

        })
        .on("mouseup", function(d) {
            if (selectionStartId) {

                let annotBoxes = _.map(gridSelection, pt => pt.locus[0]);

                // _.each(gridSelection, (g) =>{
                //     console.log('gridsel: ', g);
                // });

                let annotation = mkAnnotation({
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
        .on("mouseover", function(d) {
            reticleGroup
                .attr("opacity", 0.4);
        })
        .on("mousemove", function(d) {
            // show the grid-side bbox
            let textgridRTree = globals.textgridRTrees[pageNum] ;
            let userPt = coords.mkPoint.fromD3Mouse(d3.mouse(this));

            let queryBoxHeight = TextGridLineHeight / 2; //  / 4;
            let queryLeft = userPt.x-30;
            let queryTop = userPt.y-queryBoxHeight;
            let queryWidth = 30;
            let queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

            let hits = neighborHits = textgridRTree.search(queryBox);
            // neighborHits = textgridRTree.search(queryBox);
            neighborHits = _.sortBy(
                _.filter(hits, hit => hit.pdfBounds),
                hit => [hit.top, hit.left]
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

        });

}


function initGridText(d3$canvas, gridData, gridNum) {
    let context = d3$canvas.node().getContext('2d');
    // context.font = 'normal normal normal 12px/normal Helvetica, Arial';
    context.font = `normal normal normal ${TextGridLineHeight}px/normal Times New Roman`;
    // context.font = `${TextGridLineHeight}px Helvetica, Arial`;
    let ptId = -1;
    let nextId = () => {
        ptId +=1;
        return ptId;
    };

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
            let pdfTextBox = charBBox? coords.mk.fromArray(charLocus[0][1]) : undefined;
            dataPt.pdfBounds = pdfTextBox ;
            dataPt.locus = gridRow.loci[chi];
            dataPt.page = charBBox? charLocus[0][0] : undefined;
            dataPt.gridRow = gridRow;
            dataPt.id = nextId();
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


function createTextGridLabelingPanel(annotation) {

    let svgPageSelector = `#textgrid-frame-${annotation.page}`;
    // let pageImageTop = $(svgPageSelector).parent().position().top;
    let pageImageTop = $(svgPageSelector).position().top;
    let textGridsTop = $('div.page-textgrids').position().top;
    let screenY = pageImageTop + textGridsTop;

    console.log('svgPageSelector', svgPageSelector);
    console.log('position()', $(svgPageSelector).position());
    console.log('position()', $(svgPageSelector).parent().position());
    lbl.createTextGridLabeler(annotation);

    $('.modal-content').css({
        'margin-left': globals.currentMousePos.x,
        'margin-top': globals.currentMousePos.y // + screenY
    });

    $('#label-form.modal').css({
        display: 'block'
    });

}

function createImageLabelingPanel(initSelection, annotation) {

    // let sortedHits = _.sortBy(hits, hit => hit.minX);
    // let hitStr = _.map(sortedHits, n => n.char).join('');
    // console.log('selectRect', selectRect, 'hit:', hitStr);
    // console.log('selectRect', selectRect, 'minRect:', [minX, minY, maxX-minX, maxY-minY]);
    // Create visual feedback for selection
    // _.each(annotation.targets, (target) => {
    let target = annotation.targets[0];

    let [page, mbr] = target;
    let svgPageSelector = `svg#page-image-${page}`;
    let pageImageTop = $(svgPageSelector).parent().position().top;
    let pageImagesOffset = $('div.page-images').position().top;
    let screenY = pageImageTop + pageImagesOffset;


    d3.select(svgPageSelector)
        .append('rect')
        .classed('label-selection-rect', true)
        .attr("x", initSelection.left)
        .attr("y", initSelection.top)
        .attr("width", initSelection.width)
        .attr("height", initSelection.height)
        .attr("fill-opacity", 0.7)
        .attr("stroke-width", 1)
        .attr("stroke", 'blue')
        .attr("fill", 'yellow')
        .transition().duration(200)
        .attr("x", mbr.left)
        .attr("y", mbr.top)
        .attr("width", mbr.width)
        .attr("height", mbr.height)
        .attr("fill-opacity", 0.3)
    ;


    lbl.createHeaderLabelUI(annotation);


    $('.modal-content').css({
        'margin-left': globals.currentMousePos.x,
        'margin-top': globals.currentMousePos.y + screenY
    });

    $('#label-form.modal').css({
        display: 'block'
    });

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

    function clickHandler(clickPt) {
        let pageStr = clickPt.svgSelector.split('-').pop();
        let page =  parseInt(pageStr);

        let neighbors = rtrees.knnQueryPage(page, clickPt, 4);

        if (neighbors.length > 0) {
            let nearestNeighbor = neighbors[0];
            // let ns = _.map(neighbors, (n) => n.char).join('');
            syncScrollTextGrid(clickPt, nearestNeighbor);
        }

    }
    function selectionHandler(selectionRect) {
        let pdfImageRect = coords.mk.fromXy12(selectionRect, coords.coordSys.pdf);

        let pageStr = selectionRect.svgSelector.split('-').pop();
        let page = parseInt(pageStr);

        let hits = rtrees.searchPage(page, pdfImageRect);

        let minBoundSelection = rtrees.queryHitsMBR(hits);

        let annotation = mkAnnotation({
            type: 'bounding-boxes',
            page: page,
            targets: [[page, minBoundSelection]] //  TODO should be another level of nesting here
        });

        createImageLabelingPanel(pdfImageRect, annotation);
    }

    d3.selectAll('svg.page-image')
        .each(function (){
            let svg = d3.select(this);

            initD3DragSelect(svg.attr('id'), (pointOrRect) => {
                if (pointOrRect.point != undefined) {
                    clickHandler(pointOrRect.point);
                } else if (pointOrRect.rect != undefined) {
                    selectionHandler(pointOrRect.rect);
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

    d3.select(`#${rightPaneId}`)
        .append('div').classed('page-textgrids', true)
    ;

    setupPageImages('div.page-images', pageShapes);
    setupPageTextGrids('div.page-textgrids', textgrids);

    setTimeout(() => {
        rtrees.initRTrees(textgrids);
    }, 0);


    leftContent.selectAll("image")
        .attr("opacity", 1.0)
    ;

    console.log('global', globals);
    lbl.updateAnnotationShapes();

    return d3;

}
