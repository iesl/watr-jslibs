
// svg.selectAll("text.loglinks")
//     .selectAll("text.loglink")
//       .enter()
//       .append("text").classed('loglink', true)
//         .attr("y", function(d, i){ return 100 + (i * 30); })
//         .attr("x", function(d, i){ return 130 ; })
//         .text(function(d, i){ return i + ": " + d.name; })
//       .on("click", function(logData, nodeIndex, nodes) {
//         console.log("d", logData);
//       })
// ;
// .on("click", function(logData, nodeIndex, nodes) {
//     console.log("this", this);
//     console.log("d", logData);

//     d3.select(this)
//         .data(logData.logs)
//         .enter()
//         .append('text').classed('loglink', true)
//         .attr("y", function(d, i){ return 100 + (i * 30); })
//         .attr("x", function(d, i){ return 120 ; })
//         .text(function(d, i){ return i + "; "; })
//     ;
// })

// console.log("n", nod);
// console.log("x", x);

// d3.select(this)
//     .attr("x", function(d, i){ return 100 ; })
// ;
// .style("color", "red");
// d3.selectAll("p").on("click", function() {
//     d3.select(this).style("color", "red");
// });

logLinks.selectAll('text.loglinks')
    .each(function(parentData, parentIndex) {

        console.log("d", parentIndex);

        d3.select(this)
            .data(parentData[parentIndex].logs)
            .selectAll('text.loglink')
            .enter()
            .append("text").classed('loglink', true)
            .attr("y", function(d, i){ return 200 + (i * 30); })
            .attr("x", function(d, i){ return 200 ; })
            .text(function(d, i){ return i + " ?? " ; })
        ;
    })
;
