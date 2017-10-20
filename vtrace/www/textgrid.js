
// define(['/lib/d3.js', '/lib/underscore-min.js'], function (d3, us) {

//     var svg = d3.select('#main') ;

//     function RenderTextGridPerCell (dataBlock) {
//         console.log("Running TextGridMethod" );

//         let gridRows = dataBlock.grid.rows;
//         let gridShapes = dataBlock.shapes;

//         svg.selectAll(".shape")
//             .data(gridShapes, getId)
//             .enter()
//             .each(function (d){
//                 var self = d3.select(this);
//                 let shape = d.type;
//                 return self.append(shape)
//                     .call(initShapeAttrs);
//             })
//         ;
//         svg.selectAll("image")
//             .attr("opacity", 1.0)
//         ;

//         // RenderTextGridPerLine version:
//         // return svg.selectAll('.gridrow')
//         //     .data(gridRows)
//         //     .enter()
//         //     .append('text')
//         //     .classed('gridrow', true)
//         //     .attr("y", function(d, i){ return 20 + (i * 16); })
//         //     .attr("x", function(d, i){ return 700; })
//         //     .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
//         //     .text(function(d, i){ return d.text; })
//         //     .call(textGridLocationIndicator)
//         // ;

//         // RenderTextGridPerCell version:
//         let gridrowSel = svg.selectAll('.gridrow')
//               .data(gridRows)
//             .enter()
//               .append('text').classed('gridrow', true)
//               .attr("y", function(d, i){ return 20 + (i * 15); })
//               .attr("x", function(d, i){ return 700; })
//         ;

//         let getChar = d => d[0][2];

//         let gridcellSel = gridrowSel.selectAll('.gridcell')
//             .data(function(d, i) { return d.loci; })
//             .enter()
//             .append('tspan').classed('gridcell', true)
//             .attr("x", function(d, i){ return 700 + (7*i); })
//             // .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
//             .attr("style", "font-family: Courier, monospace; font-size: 12px;")
//             .text(function(d, i){ return getChar(d); })
//             .call(textGridLocationIndicator)
//         ;

//         return gridcellSel;

//     }

// }
