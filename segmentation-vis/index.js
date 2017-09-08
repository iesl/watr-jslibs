

var svg = d3.select('#main') ;

var DrawingMethods = drawingMethods();

function selectShapes(dataBlock) {
    return svg.selectAll("rect")
        .data(dataBlock.shapes, getId) ;
}

function drawingMethods() {

    function OutlineMethod(dataBlock) {

        console.log("Running OutlineMethod" );

        var rects = selectShapes(dataBlock);

        printlog(dataBlock.desc);

        return rects.enter()
            .append("rect")
            .call(setRectAttrs)
            .transition()
            .duration(400)
            .attr("fill-opacity", 0.0)
        ;

    }

    function MorphMethod(dataBlock) {
        console.log("Running MorphMethod" );

        var rects = selectShapes(dataBlock);
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
        ;

    }

    function DrawMethod(dataBlock) {
        console.log("Running DrawMethod" );

        var rects = selectShapes(dataBlock);

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
        'ZipFlash' : RemoveMethod,
        'Morph'    : MorphMethod,
        'Draw'     : DrawMethod,
        'Outline'  : OutlineMethod,
        'Emboss'   : DrawMethod,
        'Remove'   : RemoveMethod,
        'Clear'    : RemoveMethod
    };
}

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
    if (typeof data.class != undefined) {
        return data.class;
    } else {
        return "";
    }

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

function endAll (transition, callback) {

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

        console.log("stepper:"+step.Method, step);

        var method = DrawingMethods[step.Method];

        method(step)
            .transition()
            .call(endAll, function(){
                stepper(steps.slice(1));
            });
        // console.log("stepper:end:"+step.Method, dataBlock, endIndex, nodes);
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


d3.json("multilog.json", function(error, jsval) {
    if (error) throw error;

    parseMultilog(jsval);

    return;
});
