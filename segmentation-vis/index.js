

var x0,
    y0;

function mousemove() {

  var m = d3.mouse(this),
      x1 = m[0],
      y1 = m[1];

  if (x0 != null) {
    svg.append("circle")
      .attr("cx", x0)
      .attr("cy", y0)
      .attr('r', 20)
      .style("stroke-width", "3px")
      .style("stroke", "#fff")
    .transition()
      .attr("r", 30)
      .duration(200)
    .transition()
      .attr("r", 10)
      .duration(100)
      .remove();


    x1 = y1 = null;
  }

  x0 = x1;
  y0 = y1;

}

var svg = d3.select('#main')
    .on("mousemove", mousemove)
;

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

function chainfunc (loopfunc, dataArray, index) {
    if (index < dataArray.length) {

        loopfunc(dataArray[index])
            .on("end", function (dataBlock, endIndex, c) {
                if (index < dataArray.length) {
                    return chainfunc(loopfunc, dataArray, index + 1);
                } else {
                    return 0;
                }
            });
    }

    return 0;
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

d3.json("bursts.json", function(error, jsval) {
    if (error) throw error;

    chainfunc(showRegions, jsval, 0);

});
