

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
            .attr('r', 10)
            .style("stroke-width", "3px")
            .style("stroke", "#fff")
            .transition()
            .attr("r", 15)
            .duration(200)
            .transition()
            .attr("r", 1)
            .duration(120)
            .remove();


        x1 = y1 = null;
    }

    x0 = x1;
    y0 = y1;

}
