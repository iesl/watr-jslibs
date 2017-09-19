
var svg = d3.select('#main') ;

var DrawingMethods = drawingMethods();

function selectShapes(dataBlock) {
    return svg.selectAll(".shape")
        .data(dataBlock.shapes, getId) ;
}

function drawingMethods() {

    function OutlineMethod(dataBlock) {

        console.log("Running OutlineMethod" );

        var rects = selectShapes(dataBlock);

        printlog(dataBlock.desc);

        return rects.enter()
            .each(function (d){
                var self = d3.select(this);
                var shape = "rect";
                if (d.type != undefined) {
                    shape = d.type;
                } else {
                    d.type = "rect";
                }
                self.append(shape)
                    .call(initShapeAttrs) ;
            })
            .attr("opacity", 0.0)
        ;

    }

    function MorphMethod(dataBlock) {
        console.log("Running MorphMethod" );
        var shape0 = dataBlock.shapes[0];
        var shapesTail = dataBlock.shapes.slice(1);

        var select0 = svg.select("#" + shape0.id);

        _.each(shapesTail, function (sh) {
            select0 = select0
                .transition()
                .duration(1000)
                .attr("x",     sh.x)
                .attr("y",     sh.y)
                .attr("width", sh.width)
                .attr("height",sh.height)
            ;

        });

        return select0;

    }
    function DrawMethod(dataBlock) {
        console.log("Running DrawMethod" );

        var rects = selectShapes(dataBlock);

        printlog(dataBlock.desc);

        return rects.enter()
            .each(function (d){
                var self = d3.select(this);
                var shape = "rect";
                if (d.type != undefined) {
                    shape = d.type;
                } else {
                    d.type = "rect";
                }
                self.append(shape)
                    .call(initShapeAttrs) ;
            })
            .transition()
            .delay(function(d, i) { return i * 200; })
            .attr("fill", "#EEE")
            .duration(1000)
            .transition()
            .duration(1000)
            .attr("fill", "#222")
        ;


    }

    // var shapeNode = document.createElementNS(d3.namespaces.svg, shape);
    // shapeNode.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    function ZipFlashMethod(dataBlock) {

        var rects = selectShapes(dataBlock);

        printlog(dataBlock.desc);

        return rects.enter()
            .append(function (d, i){
                var shape = "rect";
                if (d.type != 'undefined') {
                    shape = d.type;
                }
                return document.createElement(shape);
            })
            .call(initShapeAttrs)
            .transition()
            .duration(100)
            .attr("opacity", 0.0)
            .transition()
            .duration(1000)
            .delay(function(d, i) { return i * 400; })
            .attr("opacity", 1.0)
            .transition()
            .duration(1000)
            .delay(function(d, i) { return i * 400; })
            .attr("opacity", 0.4)
        ;


    }

    function RemoveMethod (dataBlock) {
        console.log("Running RemoveMethod" );

        printlog(dataBlock.desc);

        _.each(dataBlock.shapes, function(shape){
            svg.selectAll("#" + shape.id )
                .attr('class', 'trash');
        });

        return svg.selectAll(".trash")
            .remove() ;
    }

    return {
        'ZipFlash' : ZipFlashMethod,
        'Morph'    : MorphMethod,
        'Draw'     : DrawMethod,
        'Outline'  : OutlineMethod,
        'Emboss'   : DrawMethod,
        'Remove'   : RemoveMethod,
        'Clear'    : RemoveMethod
    };
}

var messages = ["Logs"];

// style="text-anchor: middle; font: normal normal normal 12px/normal Helvetica, Arial; " font="12px Helvetica, Arial"
function printlog(msg) {
    messages.push(msg);
    console.log(msg);
    svg
        .select('g.log')
        .selectAll('text.log')
        .data(messages)
        .enter()
        .append("text").classed('log', true)
        .attr("y", function(d, i){ return 100 + (i * 20); })
        .attr("x", function(d, i){ return 700; })
    // .attr("font", "12px Helvetica, Arial")
        .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
        .text(function(d, i){ return "> " + d; })
    ;


    return 0;
}

function getId(data) {
    if (typeof data.id == 'undefined') {
        var id = (
            data.x + "_" + data.y + "_" +
                data.width + "_" + data.height
        );
        return id;
    } else {
        return data.id;
    }

}
function getCls(data) {
    if (typeof data.class != 'undefined') {
        return "shape " + data.class;
    } else {
        return "shape";
    }

}

function initShapeAttrs(r) {
    console.log("initShapeAttrs: r=", r);
    var shape = r.node().nodeName.toLowerCase();

    switch (shape) {
    case "rect":
        return r.attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y; })
            .attr("width", function(d){ return d.width; })
            .attr("height", function(d){ return d.height; })
            .attr("id", getId)
            .attr("class", getCls)
            .attr("opacity", 0.3)
            .attr("fill-opacity", 0.1)
            .attr("fill", "yellow")
            .attr("stroke-width", 1)
            .attr("stroke", "#223388")
        ;
        break;
    case "circle":
        r.attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })
            .attr("r", function(d){ return d.r; })
            .attr("id", getId)
            .attr("class", getCls)
            .attr("fill-opacity", 0.4)
            .attr("fill", "blue")
            .attr("stroke-width", 3)
            .attr("stroke", "blue")
        ;
        break;
    case "line":
        r.attr("x1", function(d){ return d.x1; })
            .attr("y1", function(d){ return d.y1; })
            .attr("x2", function(d){ return d.x2; })
            .attr("y2", function(d){ return d.y2; })
            .attr("id", getId)
            .attr("class", getCls)
            .attr("fill-opacity", 0.2)
            .attr("fill", "red")
            .attr("stroke-width", 1)
            .attr("stroke", "red")
        ;
        break;
    };

    return r;
}

function setRectAttrs(r) {
    return r.attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .attr("width", function(d){ return d.width; })
        .attr("height", function(d){ return d.height; })
        .attr("id", getId)
        .attr("class", getCls)
        .attr("fill-opacity", 0.4)
        .attr("fill", "yellow")
        .attr("stroke-width", 2)
        .attr("stroke", "#2233ff")
    ;
}

function onEndAll (transition, callback) {

    if (transition.empty()) {
        callback();
    }
    else {
        var n = transition.size();
        transition.on("end", function () {
            n--;
            if (n === 0) {
                callback();
            }
        });
    }
}

function stepper (steps) {
    if (steps.length > 0) {
        var step = steps[0];

        var method = DrawingMethods[step.Method];

        method(step)
            .transition()
            .delay(500)
            .call(onEndAll, function(){
                stepper(steps.slice(1));
            });
    }
}

function runLog(logData) {
    console.log("runLog", logData.steps);
    stepper(logData.steps);
}

function parseMultilog(multilog) {
    var logLinks = svg.selectAll("text.loglink")
        .data(multilog)
    ;

    logLinks.enter()
        .append("text").classed('loglink', true)
        .attr("y", function(d, i){ return 20 + (i * 20); })
        .attr("x", function(d, i){ return 100 ; })
        .attr("style", "font: normal normal normal 14px/normal Helvetica, Arial;")
        .text(function(d, i){ return i + ": " + d.name; })
        .on("click", function(pdata, pi, nodes) {
            svg.selectAll('text.loglink').remove();
            runLog(pdata);
        })
    ;

    return;
}



d3.json("/vtrace", function(error, jsval) {

    if (error) {
        console.log('error', error);
        console.log('error', error.target.responseText);
        throw error;
    }

    parseMultilog(jsval);

    return;
});
