/* global */

/**
   Credit to : http://bl.ocks.org/paradite/71869a0f30592ade5246
**/

import * as d3 from 'd3';
import 'd3-dispatch';
import 'd3-selection';
import 'd3-drag';
import * as _ from  'underscore';


export function initD3DragSelect(svgSelector, callback) {
    let selfSvg = () => d3.select("#" + svgSelector);

    let selectionRect = {
        element: null,
        previousElement: null,
        svgSelector: svgSelector,
        currentY: 0,
        currentX: 0,
        originX: 0,
        originY: 0
    };

    let sel = selectionRect;

    function setElement(ele) {
        sel.previousElement = sel.element;
        sel.element = ele;
    }

    function getNewAttributes() {
        let x = sel.currentX < sel.originX ? sel.currentX : sel.originX;
        let y = sel.currentY < sel.originY ? sel.currentY : sel.originY;
        let width = Math.abs(sel.currentX - sel.originX);
        let height = Math.abs(sel.currentY - sel.originY);
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    }

    function getCurrentAttributes() {
        // use plus sign to convert string into number
        let x = +sel.element.attr("x");
        let y = +sel.element.attr("y");
        let width = +sel.element.attr("width");
        let height = +sel.element.attr("height");
        return {
            svgSelector: sel.svgSelector,
            x1: x,
            y1: y,
            x2: x + width,
            y2: y + height
        };
    }

    function getCurrentAttributesAsText() {
        let attrs = getCurrentAttributes();
        return "x1: " + attrs.x1 + " x2: " + attrs.x2 + " y1: " + attrs.y1 + " y2: " + attrs.y2;
    }

    function init(newX, newY) {

        let rectElement = selfSvg().append("rect")
            .classed("selection", true)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width",0)
            .attr("height", 0)
        ;

        setElement(rectElement);
        sel.originX = newX;
        sel.originY = newY;
        update(newX, newY);
    }

    function update(newX, newY) {
        sel.currentX = newX;
        sel.currentY = newY;
        _.each(getNewAttributes(), (v, k) => {
            sel.element.attr(k, v);
        });
    }

    function focus() {
        sel.element
            .style("stroke", "#DE695B")
            .style("stroke-width", "2.5");
    }

    function remove() {
        sel.element.remove();
        sel.element = null;
    }

    function removePrevious() {
        if (sel.previousElement) {
            sel.previousElement.remove();
        }
    }



    function dragStart() {
        console.log("dragStart");
        let mouseEvent = d3.event.sourceEvent;
        console.log("mouse event:", mouseEvent);
        // console.dir('svg', svgSelection);

        // 0=left, 1=middle, 2=right
        let b = mouseEvent.button;
        if (b == 0) {
            let p = d3.mouse(this);
            init(p[0], p[1]);
            removePrevious();
            d3.event.sourceEvent.stopPropagation(); // silence other listeners
        }
    }

    function dragMove() {
        if (sel.element != null) {
            // console.log("dragMove");
            let p = d3.mouse(this);
            update(p[0], p[1]);
            let currAttrs = getCurrentAttributes();
            callback({
                move: currAttrs
            });
        }
    }

    function dragEnd() {
        if (sel.element != null) {
            let finalAttributes = getCurrentAttributes();

            if (finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1) {
                d3.event.sourceEvent.preventDefault();
                // sel.focus();
                remove();
                callback({
                    rect: finalAttributes
                });
            } else {
                remove();
                callback({
                    point: {
                        svgSelector: finalAttributes.svgSelector,
                        x: finalAttributes.x1,
                        y: finalAttributes.y1
                    }
                });
            }
        }
    }

    let dragBehavior = d3.drag()
        .on("drag", dragMove)
        .on("start", dragStart)
        .on("end", dragEnd);


    dragBehavior(selfSvg());

}
