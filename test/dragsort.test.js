
/* global require beforeEach _ d3 fixture describe */


// describe('Grid-based drag/drop reordering', function() {


//     beforeEach(function() {
//         fixture.base = 'test';
//         fixture.cleanup();
//         fixture.load('dragsort.test.html');
//         // let htmlSnippet = fixtures[0];
//         // console.log('html', htmlSnippet);
//     });



//     it('should render', function() {
//         let DR = require('./../src/client/lib/dragsort.js');
//         let GraphPaper = require('./../src/client/lib/graphpaper-variants.js');
//         let util = require('./../src/client/lib/commons.js');
//         // import * as util from  './commons.js';
//         let cellWidth = 12;
//         let cellHeight = 14;
//         let rowCount = 40;
//         let colCount = 40;

//         let svgWidth = colCount*cellWidth;
//         let svgHeight = rowCount*cellHeight;


//         let svg = d3.select("div#main")
//             .append("svg")
//             .attr("width", svgWidth)
//             .attr("height", svgHeight)
//         ;

//         svg.append('rect')
//             .attr('x', 0)
//             .attr('y', 0)
//             .attr('width', svgWidth)
//             .attr('height', svgHeight)
//             .attr('stroke', 1)
//             .attr('fill', 'yellow')
//             .attr('fill-opacity', 0.3) ;

//         let graphPaper = new GraphPaper.GraphPaper(
//             rowCount,
//             colCount,
//             cellWidth,
//             cellHeight
//         );


//         let bboxes = _.map([
//             // 'id' origin x, origin y, span x, span y
//             ["a", 3, 3, 4, 2],
//             ["b", 8, 5, 4, 2],
//             ["c", 1, 9, 4, 4],
//         ], ([id, ox, oy, w, h]) => {
//             let graphBox = graphPaper.boxAt(ox, oy, w, h);
//             graphBox.id = id;
//             let b = graphBox.bounds;
//             b.x0 = b.x;
//             b.y0 = b.y;
//             return graphBox;
//         });


//         let sortSelection = svg.selectAll('path.drag-sortable')
//             .data(bboxes, d => d.id);

//         let sortNode = sortSelection.enter()
//             .append('g')
//             // .attr('draggable', true)
//             .classed('drag-sortable', true) ;

//         let rectSel = sortNode
//             .append('path')
//             .attr("d", d => {
//                 let b = d.bounds;
//                 return `M ${b.x} ${b.y} L ${b.x2} ${b.y} L ${b.x2} ${b.y2} L ${b.x} ${b.y2} z`;
//             })
//             .call(util.initFill, () => 'blue', 0.4)
//             .attr('id', d => d.id)
//             .attr('stroke', 1)
//         ;
//         // let rectSel = sortNode
//         //     .append('rect')
//         //     .call(util.initRect, d => d.bounds)
//         //     .call(util.initFill, () => 'blue', 0.7)
//         //     .attr('id', d => d.id)
//         //     .attr('stroke', 1)
//         // ;
//         $(sortSelection.nodes())
//             .on('mouseover', function (event) {
//                 $(this).attr('draggable', true);

//                 DR.reorderViaHtml5('g.drag-sortable');
//             });

//         $(sortSelection.nodes())
//             .on('mouseout', function (event) {
//                 $(this).attr('draggable', false);

//             });


//         // DR.reorder('path.drag-sortable').then(res => {
//         //     console.log('change in order', res);

//         // }).catch(() => {
//         //     console.log('no change in order');
//         // }) ;

//     });
// });
