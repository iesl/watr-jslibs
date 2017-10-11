
define(['/lib/d3.js', '/lib/underscore-min.js', '/js/colors.js'], function (d3, _, colors){

    let colorMap = {
        "Caption"                : "blue",
        "Image"                  : "brown",
        "CharRun"                : "chocolate",
        "CharRunBegin"           : "purple",
        "CharRunBaseline"        : "purple",
        "VisualBaseline"         : "blue",
        "LeftAlignedCharCol"     : "crimson",
        "RightAlignedCharCol"    : "darkorchid",
        "LeftAlignedColEnd"      : "darkred",
        "HPageDivider"           : "darksalmon",
        "ColLeftEvidence"        : "darkturquoise",
        "ColRightEvidence"       : "firebrick",
        "PageLines"              : "green",
        "HLinePath"              : "indianred",
        "VLinePath"              : "khaki",
        "LinePath"               : "lavender",
        "OutlineBox"             : "magenta"
    } ;

    var svg = d3.select('#main') ;

    var DrawingMethods = drawingMethods();

    function selectShapes(dataBlock) {
        return svg.selectAll(".shape")
            .data(dataBlock.shapes, getId) ;
    }

    function drawingMethods() {

        function DrawMethod(dataBlock) {
            console.log("Running DrawMethod" );

            var rects = selectShapes(dataBlock);

            printlog(dataBlock.desc);

            return rects.enter()
                .each(function (d){
                    var self = d3.select(this);
                    var shape = "???";
                    if (d.type != undefined) {
                        shape = d.type;
                    } else {
                        d.type = "rect";
                    }
                    self.append(shape)
                        .call(initShapeAttrs) ;
                    return self;
                })
                .merge(rects)
            // .transition()
            // .attr("opacity", 0.1)

            ;


            // .attr("fill-opacity", 0.2)

        }

        function OutlineMethod(dataBlock) {

            console.log("Running OutlineMethod" );

            var shapes = selectShapes(dataBlock);

            printlog(dataBlock.desc);

            return shapes.enter()
                .each(function (d){
                    var self = d3.select(this);
                    var shape = "rect";
                    if (d.type != undefined) {
                        shape = d.type;
                    } else {
                        d.type = "rect";
                    }
                    return self.append(shape)
                        .call(initShapeAttrs) ;
                })
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
        function ZipFlashMethod(dataBlock) {

            var rects = selectShapes(dataBlock);

            printlog(dataBlock.desc);

            return rects.enter()
                .append(function (d, i){
                    var shape = "rect";
                    if (d.type != undefined) {
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
            .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
            .text(function(d, i){ return "> " + d; })
        ;


        return 0;
    }

    function dataToColor(d) {
        if (d.stroke !== undefined) {
            return d.stroke;
        } else if (d.class === undefined) {
            return "black";
        } else {
            return colorMap[d.class];
        }
    }

    function setDefaultStrokeColor(d) {
        return dataToColor(d);
    }
    function setDefaultFillColor(d) {
        return dataToColor(d);
    }

    function getId(data) {
        var shape = data.type;

        if (data.id != undefined) {
            return data.id;
        } else {
            switch (shape) {
            case "rect":
                return "r_" + data.x + "_" + data.y + "_" + data.width + "_" + data.height;
            case "circle":
                return "c_" + data.cx + "_" + data.cy + "_" + data.r ;
            case "line":
                return "l_" + data.x1 + "_" + data.y1 + "_" + data.x2 + "_" + data.y2 ;
            }
        }
        return "";
    }

    function getCls(data) {
        if (data.class != undefined) {
            return "shape " + data.class;
        } else {
            return "shape";
        }

    }



    // Define the div for the tooltip
    var tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function addTooltip(r) {
        return r.on("mouseover", function(d) {
            if (d.class != undefined) {
                tooltipDiv.transition()
                    .duration(100)
                    .style("opacity", .9);
                tooltipDiv.html( d.class + "::" + getId(d) )
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            }
            })
            .on("mouseout", function(d) {
                if (d.class != undefined) {
                    tooltipDiv.transition()
                        .transition()
                        .delay(3000)
                       .duration(1000)
                       .style("opacity", 0);
                }
            });

    }


    function initShapeAttrs(r) {
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
                .attr("stroke-width", 1)
                .attr("fill",  setDefaultFillColor)
                .attr("stroke", setDefaultStrokeColor)
                .call(addTooltip)
            ;

        case "circle":
            return r.attr("cx", function(d){ return d.cx; })
                .attr("cy", function(d){ return d.cy; })
                .attr("r", function(d){ return d.r; })
                .attr("id", getId)
                .attr("class", getCls)
                .attr("fill-opacity", 0.2)
                .attr("stroke-width", 1)
                .attr("fill",  setDefaultFillColor)
                .attr("stroke", setDefaultStrokeColor)
                .call(addTooltip)
            ;

        case "line":
            return r.attr("x1", function(d){ return d.x1; })
                .attr("y1", function(d){ return d.y1; })
                .attr("x2", function(d){ return d.x2; })
                .attr("y2", function(d){ return d.y2; })
                .attr("id", getId)
                .attr("class", getCls)
                .attr("fill-opacity", 0.2)
                .attr("stroke-width", 1)
                .attr("fill",  setDefaultFillColor)
                .attr("stroke", setDefaultStrokeColor)
                .call(addTooltip)
            ;
        case "image":
            return r.attr("x", function(d){ return d.x; })
                .attr("y", function(d){ return d.y; })
                .attr("width", function(d){ return d.width; })
                .attr("height", function(d){ return d.height; })
                .attr("href", function(d){ return '/entry/'+corpusEntry()+'/image/page/'+d.page; })
                .attr("stroke-width", 1)
                .attr("stroke", "black")
                .attr("opacity", 0.3)
            ;
            // var entry = corpusEntry();

            // svg.append('image')
            //     .attr('href', '/entry/'+entry+'/image/page/'+1)
            //     .attr('x', 0)
            //     .attr('y', 0)
            //     .attr('width', 600)
            //     .attr('height', 800)
            // ;
            // .attr("fill-opacity", 0.4)
            // .attr("id", getId)
            // .attr("class", getCls)
        };

        return r;
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
                .delay(300)
                .call(onEndAll, function(){
                    stepper(steps.slice(1));
                });
        }
    }

    function corpusEntry() {
        let entry = location.href.split('/').reverse()[0];
        return entry;
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

    function runTrace() {
        var entry = corpusEntry();
        console.log('entry', entry);
        d3.json("/vtrace/json/"+entry, function(error, jsval) {

            if (error) {
                console.log('error', error);
                console.log('error', error.target.responseText);
                throw error;
            }

            parseMultilog(jsval);

            return;
        });

    }

return {
    run: runTrace
};

});
