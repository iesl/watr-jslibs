
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

// function chainfunc (dataArray, index) {
//     if (index < dataArray.length) {
//         var data = dataArray[index];

//         console.log(index, data);

//         var method = DrawingMethods[data.Method];


//         method(data)
//             .on("end", function (dataBlock, endIndex, c) {
//                 console.log("chainfunc:end", dataBlock, endIndex, c);

//                 return chainfunc(dataArray, index + 1);
//                 // if (index < dataArray.length) {
//                 // } else {
//                 //     return 0;
//                 // }
//             });
//     }

//     return;
// };

// var taskQ = d3.queue(1);

// _.each(logData.steps, function (step) {
//     var method = DrawingMethods[step.Method];

//     console.log("taskQ enqueue " + step.Method);
//     // taskQ.defer(method, step);

//     taskQ.defer(function() {
//         method(step)
//             .on("end", function (dataBlock, endIndex, c) {
//                 console.log("chainfunc:end", dataBlock, endIndex, c);

//                 return chainfunc(dataArray, index + 1);
//                 // if (index < dataArray.length) {
//                 // } else {
//                 //     return 0;
//                 // }
//             });


//     });
// });

// taskQ.awaitAll(function(error) {
//     console.log("taskQ done " + error );
// });

// console.log("stepper:end:"+step.Method, dataBlock, endIndex, nodes);
    .on("hover", function(pdata, pi, nodes) {
        d3.select(this)
            .transition()
            .duration(20)
            .attr('fill', 'blue')
            .duration(20)
            .attr('fill', 'black')
        ;

    })
