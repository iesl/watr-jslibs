/* global require  */

// import * as d3 from 'd3';
// import * as $ from 'jquery';
// import * as _ from 'underscore';
// import * as lbl from './labeling';
// import * as coords from './coord-sys.js';
// import * as panes from  './splitpane-utils.js';
// import * as util from  './commons.js';
// import * as rtrees from  './rtrees.js';

// import {initD3DragSelect} from  './dragselect.js';

// import { globals } from './globals';

// let knn = require('rbush-knn');
// let rtree = require('rbush');

// /** Page sync flashing indicator dot */
// function scrollSyncIndicator(parentSelection, indicatorPoint) {
//     d3.select(parentSelection)
//         .append('circle')
//         .attr("cx",  indicatorPoint.x)
//         .attr("cy", indicatorPoint.y)
//         .attr("r", 20)
//         .attr("fill-opacity", 1)
//         .attr("stroke-opacity", 0)
//         .attr("fill",  "yellow")
//         .attr("stroke",  "black")
//         .transition()
//         .duration(300)
//         .attr("r", 1)
//         .attr("fill-opacity", 0)
//         .attr("stroke-opacity", 1)
//         .delay(10)
//         .remove()
//     ;
// }

// /**
//  *  Capture a click on the page image side and scroll the corresponding page text into
//  *  view, flashing an indicator on the text point
//  */
// function syncScrollTextGrid(clickPt, neighbor) {

//     // let { minX: x, minY: y, page: pageNum, row: row, col: col } = neighbor;
//     let { page: pageNum, row: row } = neighbor;

//     let pageTextgridSvgId = `#page-textgrid-${pageNum}`;
//     let pageTextTop = $(pageTextgridSvgId).parent().position().top;

//     let pageImageTop = $(`#page-image-${pageNum}`).parent().position().top;
//     let pageTextClickY = clickPt.y;
//     let pageImagesOffset = $('div.page-images').position().top;
//     let userAbsY = pageImageTop + pageTextClickY + pageImagesOffset;
//     // let pageRelativeClickedY = clickPt.y;

//     let scrollTo = pageTextTop + (row * 16) - userAbsY;

//     $('#splitpane_root__bottom__right').scrollTop(scrollTo);

//     scrollSyncIndicator(
//         pageTextgridSvgId,
//         coords.mkPoint.fromXy(10, (row*16)+10)
//     );

// }


// /**
//  *  Capture a click on the textgrid-side and scroll the corresponding page image into
//  *  view, flashing an indicator on the image point corresponding to the text
//  */
// function syncScrollPageImages(mouseClickPt, loci) {

//     // Use first location as sync point
//     let headLoc = loci[0];
//     let pageNum = headLoc[0][0];

//     let pdfTextBox = coords.mk.fromArray(headLoc[0][1]);

//     // Get visible abs Y-position of user click:
//     let pageTextTop = $(`#page-textgrid-${pageNum}`).parent().position().top;
//     let pageTextClickY = mouseClickPt[1];
//     let pageTextsOffset = $('div.page-textgrids').position().top;
//     let userAbsY = pageTextTop + pageTextClickY + pageTextsOffset;

//     // Get offset of clicked text on page
//     let pageImageSvgId = `#page-image-${pageNum}`;
//     let pageImageTop = $(pageImageSvgId).parent().position().top;

//     // let scrollTo = pageImageTop + pdfTextY - pdfTextH - 10 - userAbsY;
//     let scrollTo = pageImageTop + pdfTextBox.top - 10 - userAbsY;

//     $('#splitpane_root__bottom__left').scrollTop(scrollTo);

//     scrollSyncIndicator(
//         pageImageSvgId,
//         pdfTextBox.topLeft
//     );

// }

// function canvasTextGridLocationIndicator(r) {
//     let canvas = r.node();

//     canvas.onmousedown = function(e) {
//         let pageNum = parseInt(d3.select(canvas).attr('page'));
//         // let pageNum = parseInt(d3.select(this).attr('page'));
//         let textgridRTree = globals.textgridRTrees[pageNum];

//         // let d3Mouse = d3.mouse(this);
//         var r = canvas.getBoundingClientRect(),
//             x = e.clientX - r.left, y = e.clientY - r.top;
//         let pageTextgridSvgId = `#page-textgrid-${pageNum}`;
//         let pageTextPos = $(pageTextgridSvgId).parent().position();
//         let pageTextTop = pageTextPos.top;
//         let pageTextMouseY = y;
//         let pageTextMouseX = x; //  - pageTextPos.left;

//         let neighborHits = knn(textgridRTree, pageTextMouseX, pageTextMouseY, 1);

//         console.log(`knn at ${pageTextPos.top} ${pageTextgridSvgId} `);
//         console.log(`   page info at x:${pageTextMouseX}, y:${pageTextMouseY} page: ${pageNum} ${neighborHits}`);

//         _.map(neighborHits, (hit) => {
//             let loci = util.filterLoci(hit.gridRow.loci);

//             syncScrollPageImages([x, y], loci);
//         });

//     };

//     canvas.onmouseup  = function() {

//         // let selection = util.getSelectionText();
//         // console.log('selected: ', d,  selection);
//         // let loci = filterLoci(d.loci);
//     };

//     canvas.onmouseover = function(e) {
//         let pageNum = parseInt(d3.select(canvas).attr('page'));
//         let textgridRTree = globals.textgridRTrees[pageNum];

//         // show the grid-side bbox
//         // let d3Mouse = d3.mouse(this);

//         // Get the current mouse position
//         var r = canvas.getBoundingClientRect(),
//         x = e.clientX - r.left, y = e.clientY - r.top;


//         let pageTextgridSvgId = `#page-textgrid-${pageNum}`;
//         let pageTextPos = $(pageTextgridSvgId).parent().position();
//         let pageTextTop = pageTextPos.top;
//         let pageTextMouseY = y;
//         let pageTextMouseX =  x;


//         if (textgridRTree) {
//             let neighborHits = knn(textgridRTree, pageTextMouseX, pageTextMouseY, 1);

//             console.log(`knn at ${pageTextPos.top} ${pageTextgridSvgId} `);
//             console.log(`   page info at x:${pageTextMouseX}, y:${pageTextMouseY} page: ${pageNum} ${neighborHits}`);
//             console.log('neighborHits at ', neighborHits);
//             _.map(neighborHits, (hit) => {
//                 let loci = util.filterLoci(hit.gridRow.loci);
//                 let charBboxes = _.map(loci, l => {
//                     return coords.mk.fromArray(l[0][1]);
//                 });
//                 util.d3select.pageImage(pageNum)
//                     .selectAll('.textloc')
//                     .data(charBboxes)
//                     .enter()
//                     .append('rect')
//                     .classed('textloc', true)
//                     .attr("x", d => d.left)
//                     .attr("y", d => d.top)
//                     .attr("width", d => d.width)
//                     .attr("height", d => d.height)
//                     .attr("opacity", 0.4)
//                     .attr("fill-opacity", 0.5)
//                     .attr("stroke-width", 0)
//                     .attr("stroke", 'blue')
//                     .attr("fill", 'blue')
//                     .transition()
//                     .delay(300)
//                     .remove()
//                 ;

//             });
//         }
//     };
//     canvas.onmousemove = canvas.onmouseover;

//     canvas.onmouseout = function(e) {
//         return util.d3select.pageImages()
//             .selectAll('.textloc')
//             .remove();
//     };

//     return r;
// }

// function textGridLocationIndicator(r) {

//     return r
//         .on("mousedown", function(d) {
//             let loci = util.filterLoci(d.loci);
//             let mouseClickPt = d3.mouse(this);
//             syncScrollPageImages(mouseClickPt, loci);


//         })
//         .on("mouseup", function(d) {
//             let selection = util.getSelectionText();
//             // console.log('selected: ', d,  selection);
//             // let loci = filterLoci(d.loci);
//         })
//         .on("mouseover", function(d) {
//             let loci = util.filterLoci(d.loci);
//             let charBboxes = _.map(loci, l => {
//                 return coords.mk.fromArray(l[0][1]);
//             });

//             let pageNum = loci[0][0][0];

//             util.d3select.pageImage(pageNum)
//                 .selectAll('.textloc')
//                 .data(charBboxes)
//                 .enter()
//                 .append('rect')
//                 .classed('textloc', true)
//                 .attr("x", d => d.left)
//                 .attr("y", d => d.top)
//                 .attr("width", d => d.width)
//                 .attr("height", d => d.height)
//                 .attr("opacity", 0.4)
//                 .attr("fill-opacity", 0.5)
//                 .attr("stroke-width", 0)
//                 .attr("stroke", 'blue')
//                 .attr("fill", 'blue')
//             ;


//             // show the grid-side bbox
//             let textgridRTree = globals.textgridRTrees[pageNum] ;
//             let d3Mouse = d3.mouse(this);

//             if (textgridRTree) {
//                 let neighborHits = knn(textgridRTree, d3Mouse.x, d3Mouse.y, 1);

//                 console.log('neighborHits page:', pageNum, ' ', neighborHits);

//             }
//         })
//         .on("mouseout", function() {
//             return util.d3select.pageImages()
//                 .selectAll('.textloc')
//                 .remove();
//         });

// }


// function setupPageTextsXX(contentId, textgrids) {

//     d3.select(contentId)
//         .selectAll(".textgrid")
//         .data(textgrids, util.getId)
//         .enter()
//         .append('div').classed('page-textgrid', true)
//         .append('svg').classed('textgrid', true)
//         .attr('id', (d, i) => `page-textgrid-${i}`)
//         .attr('width', 600)
//         .attr('height', grid => {
//             return grid.rows.length * 18;
//         })
//     ;

//     // d3.selectAll('svg.textgrid') .css({
//     //     display: 'none',
//     //     visibility:  'hidden' // 'visible'
//     // });

//     d3.selectAll('svg.textgrid')
//         .each(function (textGridData){
//             let d3$textgrid = d3.select(this);
//             setTimeout(() => {
//                 let d3$gridrows = d3$textgrid.selectAll('.gridrow')
//                     .data(d => d.rows)
//                     .enter()
//                     .append('text') .classed('gridrow', true)
//                     .attr("y", (d, i) => 20 + (i * 16))
//                     .attr("x", () => 40)
//                     .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
//                     // .text(function(d){ return "∙  " + d.text + "  ↲"; })
//                     .call(textGridLocationIndicator)
//                 ;
//                 d3$gridrows
//                     .selectAll('tspan')
//                     .data(d => d.text.split(''))
//                     .enter()
//                     .append('tspan') // .classed('.gc', true)
//                     .text(d => { return d; })
//                 ;

//             }, 0);
//         });

//     // d3.selectAll('svg.textgrid')
//     //     .each(function (){
//     //         let svg = d3.select(this);

//     //         initD3DragSelect(svg.attr('id'), (pointOrRect) => {
//     //             if (pointOrRect.point != undefined) {
//     //                 console.log('textgrid click');
//     //                 // clickHandler(pointOrRect.point);
//     //             } else if (pointOrRect.rect != undefined) {
//     //                 console.log('textgrid select');
//     //                 // selectionHandler(pointOrRect.rect);
//     //             } else {
//     //                 // Move handler
//     //             }
//     //         });
//     //     })
//     // ;

// }


// function setupPageTextGridsUsinCanvas(contentId, textgrids) {
//     let d3$textgrid = d3.select(contentId)
//         .selectAll(".textgrid")
//         .data(textgrids, util.getId)
//         .enter()
//         .append('div').classed('page-textgrid', true)
//         .append('canvas').classed('textgrid', true)
//         .attr('id', (d, i) => `page-textgrid-${i}`)
//         .attr('page', (d, i) => i)
//         .attr('width', 600)
//         .attr('height', grid => {
//             return grid.rows.length * 18;
//         })
//     ;

//     d3.selectAll('canvas.textgrid')
//         .each(function (gridData, gridNum){
//             let d3$canvas = d3.select(this);
//             let context = d3$canvas.node().getContext('2d');
//             // context.font = 'normal normal normal 12px/normal Helvetica, Arial';
//             context.font = 'normal normal normal 12px/normal Times New Roman';
//             // context.font = '12px Helvetica, Arial';
//             let rowDataPts = _.map(gridData.rows, (gridRow, rowNum) => {
//                 let y = 20 + (rowNum * 12);
//                 let x = 40;
//                 let text = gridRow.text;
//                 let currLeft = x;
//                 let dataPts = _.map(text.split(''), (ch, chi) => {
//                     let chWidth = context.measureText(ch).width;
//                     let dataPt = coords.mk.fromLtwh(
//                         currLeft, y, chWidth, 14
//                     );
//                     dataPt.locus = gridRow.loci[chi];
//                     dataPt.gridRow = gridRow;
//                     return dataPt;
//                 });
//                 context.fillText(text, x, y);
//                 return dataPts;
//             });

//             let allDataPts = _.flatten(rowDataPts);
//             console.log('allDataPts', allDataPts);
//             let textgridRTree = rtree();
//             globals.textgridRTrees[gridNum] = textgridRTree;
//             textgridRTree.load(allDataPts);
//         })
//     ;

//     d3.selectAll('canvas.textgrid')
//         .call(canvasTextGridLocationIndicator)
//     ;
//     // let d3$gridrows = d3$textgrid.selectAll('.gridrow')
//     //     .data(d => d.rows)
//     //     .enter()
//     //     .append('text') .classed('gridrow', true)
//     //     .attr("y", (d, i) => 20 + (i * 16))
//     //     .attr("x", () => 40)
//     //     .call(textGridLocationIndicator)
//     // ;
// }

// function setupPageTexts(contentId, textgrids) {

//     let d3$textgridSvg = d3.select(contentId)
//         .selectAll(".textgrid")
//         .data(textgrids, util.getId)
//         .enter()
//         .append('div').classed('page-textgrid', true)
//         .append('svg').classed('textgrid', true)
//         .attr('id', (d, i) => `page-textgrid-${i}`)
//         .attr('width', 600)
//         .attr('height', grid => {
//             return grid.rows.length * 18;
//         })
//     ;

//     // d3.selectAll('svg.textgrid').style('visibility', 'hidden' );


//     let d3$gridrows = d3$textgridSvg.selectAll('.gridrow')
//         .data(d => d.rows)
//         .enter()
//         .append('text') .classed('gridrow', true)
//         .attr("y", (d, i) => 20 + (i * 16))
//         .attr("x", () => 40)
//         .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
//         // .text(function(d){ return "∙  " + d.text + "  ↲"; })
//         .call(textGridLocationIndicator)
//     ;

//     d3$gridrows
//         .selectAll('.gridcell')
//         .data(d => d.text.split(''))
//         .enter()
//         .append('tspan').classed('.gridcell', true)
//         .text(d => { return d; })
//     ;

//     // d3.selectAll('svg.textgrid').style('visibility', 'visible' );

//     // textgridsel.selectAll('.gridrow')
//     //     .data(d => d.rows)
//     //     .enter()
//     //     .append('text') .classed('gridrow', true)
//     //     .attr("y", (d, i) => 20 + (i * 16))
//     //     .attr("x", () => 40)
//     //     .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
//     //     .text(function(d){ return "∙  " + d.text + "  ↲"; })
//     //     .call(textGridLocationIndicator)
//     // ;


//     // d3.selectAll('svg.textgrid')
//     //     .each(function (){
//     //         let svg = d3.select(this);

//     //         initD3DragSelect(svg.attr('id'), (pointOrRect) => {
//     //             if (pointOrRect.point != undefined) {
//     //                 console.log('textgrid click');
//     //                 // clickHandler(pointOrRect.point);
//     //             } else if (pointOrRect.rect != undefined) {
//     //                 console.log('textgrid select');
//     //                 // selectionHandler(pointOrRect.rect);
//     //             } else {
//     //                 // Move handler
//     //             }
//     //         });
//     //     })
//     // ;
// }




// function createLabelingPanel(annotation) {

//     // let sortedHits = _.sortBy(hits, hit => hit.minX);
//     // let hitStr = _.map(sortedHits, n => n.char).join('');
//     // console.log('selectRect', selectRect, 'hit:', hitStr);
//     // console.log('selectRect', selectRect, 'minRect:', [minX, minY, maxX-minX, maxY-minY]);
//     // Create visual feedback for selection

//     let svgPageSelector = `svg#page-image-${annotation.page}`;
//     let pageImageTop = $(svgPageSelector).parent().position().top;
//     let pageImagesOffset = $('div.page-images').position().top;
//     let screenY = pageImageTop + pageImagesOffset;

//     console.log('pageImageTop', screenY);

//     d3.select(svgPageSelector)
//         .append('rect')
//         .classed('label-selection-rect', true)
//         .attr("x", annotation.userBounds.left)
//         .attr("y", annotation.userBounds.top)
//         .attr("width", annotation.userBounds.width)
//         .attr("height", annotation.userBounds.height)
//         .attr("fill-opacity", 0.7)
//         .attr("stroke-width", 1)
//         .attr("stroke", 'blue')
//         .attr("fill", 'yellow')
//         .transition().duration(200)
//         .attr("x", annotation.minBounds.left)
//         .attr("y", annotation.minBounds.top)
//         .attr("width", annotation.minBounds.width)
//         .attr("height", annotation.minBounds.height)
//         .attr("fill-opacity", 0.3)
//     ;

//     lbl.createHeaderLabelUI();


//     $('.modal-content').css({
//         'margin-left': globals.currentMousePos.x,
//         'margin-top': globals.currentMousePos.y + screenY
//     });

//     $('#label-form.modal').css({
//         display: 'block'
//     });

// }


// function setupPageImages(contentId, pageImageShapes) {

//     let ctx = {maxh: 0, maxw: 0};

//     _.map(pageImageShapes, (sh) =>{
//         ctx.maxh = Math.max(ctx.maxh, sh[0].height);
//         ctx.maxw = Math.max(ctx.maxw, sh[0].width);
//     });

//     panes.setParentPaneWidth(contentId, ctx.maxw+30);

//     let imageSvgs = d3.select(contentId)
//         .selectAll(".page-image")
//         .data(pageImageShapes, util.getId)
//         .enter()
//         .append('div').classed('page-image', true)
//         .append('svg').classed('page-image', true)
//         .attr('id', (d, i) => `page-image-${i}`)
//         .attr('width', (d) => d[0].width)
//         .attr('height', (d) => d[0].height)
//     ;

//     function clickHandler(clickPt) {
//         let pageStr = clickPt.svgSelector.split('-').pop();
//         let page =  parseInt(pageStr);

//         let neighbors = rtrees.knnQueryPage(page, clickPt, 4);

//         if (neighbors.length > 0) {
//             let nearestNeighbor = neighbors[0];
//             // let ns = _.map(neighbors, (n) => n.char).join('');
//             syncScrollTextGrid(clickPt, nearestNeighbor);
//         }

//     }
//     function selectionHandler(selectionRect) {
//         let pdfImageRect = coords.mk.fromXy12(selectionRect, coords.coordSys.pdf);

//         let pageStr = selectionRect.svgSelector.split('-').pop();
//         let page = parseInt(pageStr);

//         let hits = rtrees.searchPage(page, pdfImageRect);

//         let minBoundSelection = rtrees.queryHitsMBR(hits);

//         let annotation = {
//             page: page,
//             userBounds: pdfImageRect,
//             minBounds: minBoundSelection
//         };

//         createLabelingPanel(annotation);
//     }

//     d3.selectAll('svg.page-image')
//         .each(function (){
//             let svg = d3.select(this);

//             initD3DragSelect(svg.attr('id'), (pointOrRect) => {
//                 if (pointOrRect.point != undefined) {
//                     clickHandler(pointOrRect.point);
//                 } else if (pointOrRect.rect != undefined) {
//                     selectionHandler(pointOrRect.rect);
//                 } else {
//                     // Move handler
//                 }
//             });
//         })
//     ;


//     imageSvgs.selectAll(".shape")
//         .data(d => d)
//         .enter()
//         .each(function (d){
//             let self = d3.select(this);
//             let shape = d.type;
//             return self.append(shape)
//                 .call(util.initShapeAttrs);
//         })
//     ;
// }



// export function RenderTextGrid(dataBlock) {
//     let pages = dataBlock.pages;
//     let textgrids = _.map(pages, p => p.textgrid);
//     let pageShapes = _.map(pages, p => p.shapes);



//     let {leftPaneId: leftPaneId, rightPaneId: rightPaneId} =
//         panes.splitVertical('.content-pane', {fixedLeft: 200});


//     let leftContent = d3.select(`#${leftPaneId}`)
//         .append('div').classed('page-images', true)
//     ;

//     d3.select(`#${rightPaneId}`)
//         .append('div').classed('page-textgrids', true)
//     ;

//     setupPageImages('div.page-images', pageShapes);
//     setupPageTextGridsUsinCanvas('div.page-textgrids', textgrids);

//     setTimeout(() => {
//         rtrees.initRTrees(textgrids);
//     }, 0);


//     leftContent.selectAll("image")
//         .attr("opacity", 1.0)
//     ;

//     return d3;

// }
