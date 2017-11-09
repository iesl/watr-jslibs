/**
 * d3-driven drag/click handling
 *
 *  Credit to : http://bl.ocks.org/paradite/71869a0f30592ade5246
 **/

import * as d3 from 'd3';
import 'd3-dispatch';
import 'd3-selection';
import 'd3-drag';
import * as _ from  'lodash';
import {globals} from './globals';
import * as $ from 'jquery';
import * as coords from './coord-sys.js';


export function initD3DragSelect(svgSelector, callback) {
    let selfSvg = () => d3.select("#" + svgSelector);

    let selState = {
        element: null,
        previousElement: null,
        svgSelector: svgSelector,
        currentY: 0,
        currentX: 0,
        originX: 0,
        originY: 0
    };

    function setElement(ele) {
        selState.previousElement = selState.element;
        selState.element = ele;
    }

    function getNewAttributes() {
        let x = selState.currentX < selState.originX ? selState.currentX : selState.originX;
        let y = selState.currentY < selState.originY ? selState.currentY : selState.originY;
        let width = Math.abs(selState.currentX - selState.originX);
        let height = Math.abs(selState.currentY - selState.originY);
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    }

    function getCurrentAttributes() {
        // use plus sign to convert string into number
        let x = +selState.element.attr("x");
        let y = +selState.element.attr("y");
        let width = +selState.element.attr("width");
        let height = +selState.element.attr("height");
        return {
            svgSelector: selState.svgSelector,
            x1: x,
            y1: y,
            x2: x + width,
            y2: y + height
        };
    }

    function init(newX, newY, clientPt) {

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
        selState.originX = newX;
        selState.originY = newY;
        update(newX, newY, clientPt);
    }

    function update(newX, newY, clientPt) {
        globals.currentMousePos.x = clientPt.x;
        globals.currentMousePos.y = clientPt.y;
        $("li > span#mousepos").text(
            `x: ${clientPt.x}, y: ${clientPt.y} / ${svgSelector} @  ${newX},${newY} `
        );

        selState.currentX = newX;
        selState.currentY = newY;
        _.each(getNewAttributes(), (v, k) => {
            selState.element.attr(k, v);
        });
    }

    function remove() {
        selState.element.remove();
        selState.element = null;
    }

    function removePrevious() {
        if (selState.previousElement) {
            selState.previousElement.remove();
        }
    }



    function dragStart() {
        let mouseEvent = d3.event.sourceEvent;

        // 0=left, 1=middle, 2=right
        let b = mouseEvent.button;
        if (b == 0) {
            let p = d3.mouse(this);
            let mouseEvent = d3.event.sourceEvent;
            let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);
            init(p[0], p[1], clientPt);
            removePrevious();
            d3.event.sourceEvent.stopPropagation(); // silence other listeners
        }
    }

    function dragMove() {
        if (selState.element != null) {
            // console.log("dragMove");
            let p = d3.mouse(this);
            // let mouseEvent = d3.event;
            let mouseEvent = d3.event.sourceEvent;
            let clientPt = coords.mkPoint.fromXy(mouseEvent.clientX, mouseEvent.clientY);
            // console.log('mouseEvent', mouseEvent);
            update(p[0], p[1], clientPt);
            let currAttrs = getCurrentAttributes();
            callback({
                move: currAttrs
            });
        }
    }

    function dragEnd() {
        if (selState.element != null) {
            let finalAttributes = getCurrentAttributes();

            if (finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1) {
                d3.event.sourceEvent.preventDefault();
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
