

var svg = d3.select('#main') ;
    // .on("mousemove", mousemove)


var messages = ["Logs"];


function printlog(msg) {
    messages.push(msg);
    console.log(msg);
    svg
        .select('g.log')
        .selectAll('text.log')
        .data(messages)
        .enter()
        .append("text").classed('log', true)
        .attr("y", function(d, i){ return 100 + (i * 30); })
        .attr("x", function(d, i){ return 1000 ; })
        .text(function(d, i){ return i + ": " + d; })
    ;


    return 0;
}

function setRectAttrs(r) {
    return r.attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .attr("width", function(d){ return d.width; })
        .attr("height", function(d){ return d.height; })
        .attr("fill", "yellow")
        .attr("stroke-width", 2)
        .attr("stroke", "#2233ff")
    ;
}

function chainfunc (dataArray, index) {
    if (index < dataArray.length) {
        var data = dataArray[index];

        var method = showRegions;

        switch (data.Method) {
        case 'Persistent':
            method = showAllAtOnce;
            break;
        case 'ZipFlash':
            method = showRegions;
            break;
        };


        method(dataArray[index])
            .on("end", function (dataBlock, endIndex, c) {
                if (index < dataArray.length) {
                    return chainfunc(dataArray, index + 1);
                } else {
                    return 0;
                }
            });
    }

    return 0;
};

function showAllAtOnce (dataBlock) {

    var rects = svg.selectAll("rect")
        .data(dataBlock.shapes)
    ;

    printlog(dataBlock.desc);

    return rects.enter()
        .append("rect")
        .call(setRectAttrs)
        .transition()
        .delay(function(d, i) { return i * 200; })
        .attr("fill", "#EEE")
        .duration(1000)
        .transition()
        .duration(1000)
        .attr("fill", "#222")
        .transition()
        .delay(function(d, i) { return i * 200; })
        .remove()
    ;

};
function showRegions (dataBlock) {

    var rects = svg.selectAll("rect")
        .data(dataBlock.shapes)
    ;

    printlog(dataBlock.desc);

    return rects.enter()
        .append("rect")
          .call(setRectAttrs)
        .transition()
          .delay(function(d, i) { return i * 200; })
          .attr("fill", "#EEE")
          .duration(1000)
        .transition()
          .duration(1000)
          .attr("fill", "#222")
        .transition()
          .delay(function(d, i) { return i * 200; })
          .remove()
    ;

};

function runLog(logData) {

    chainfunc(logData.steps, 0);

    return;
}

function parseMultilog(multilog) {
    var logLinks = svg.selectAll("text.loglink")
        .data(multilog)
    ;

    logLinks.enter()
        .append("text").classed('loglink', true)
        .attr("y", function(d, i){ return 100 + (i * 30); })
        .attr("x", function(d, i){ return 100 ; })
        .text(function(d, i){ return i + ": " + d.name; })
        .on("click", function(pdata, pi, nodes) {
            console.log("d", pdata);
            svg.selectAll('text.loglink').remove();

            runLog(pdata);
        })
    ;

    return;
}


d3.json("multilog2.json", function(error, jsval) {
    if (error) throw error;

    // chainfunc(showRegions, jsval, 0);
    parseMultilog(jsval);

    return;
});
