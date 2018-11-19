/**
 *
 **/
import * as d3 from 'd3';
import * as coords from './coord-sys';
import * as d3x from './d3-extras';
export function awaitUserSelection(d3$svg, initSvgPt) {
    return new Promise((resolve, reject) => {
        let svgSelector = d3$svg.attr('id');
        let originPt = initSvgPt;
        let currentPt = originPt;
        let emptyRect = { left: originPt.x, top: originPt.y, width: 0, height: 0 };
        let selectionRect = d3$svg.append("rect")
            .call(d3x.initRect, () => emptyRect)
            .classed("selection", true)
            .attr("rx", 4)
            .attr("ry", 4);
        let userWithinPageBounds = true;
        update(initSvgPt);
        function update(svgPt) {
            currentPt = svgPt;
            adjustSelectionRect();
        }
        function getSelectionMinBoundingRect() {
            let ny = Math.min(currentPt.y, originPt.y);
            let nx = Math.min(currentPt.x, originPt.x);
            let nwidth = Math.abs(currentPt.x - originPt.x);
            let nheight = Math.abs(currentPt.y - originPt.y);
            return { left: nx, top: ny, width: nwidth, height: nheight };
        }
        function adjustSelectionRect() {
            let adjusted = getSelectionMinBoundingRect();
            selectionRect
                .call(d3x.initRect, () => adjusted);
        }
        d3$svg.on("mouseup", function () {
            // return either point or rect
            if (selectionRect !== null) {
                selectionRect.remove();
                if (currentPt !== originPt) {
                    d3.event.preventDefault();
                    let mbr = getSelectionMinBoundingRect();
                    mbr.svgSelector = svgSelector;
                    resolve({
                        rect: mbr
                    });
                }
                else {
                    originPt.svgSelector = svgSelector;
                    resolve({
                        point: {
                            svgSelector: svgSelector,
                            x: originPt.x,
                            y: originPt.y
                        }
                    });
                }
            }
            else {
                reject("Error");
            }
        });
        d3$svg.on("mousemove", function () {
            if (selectionRect !== null && userWithinPageBounds) {
                // let p = d3.mouse(this);
                let mouseEvent = d3.event;
                let clickPt = coords.mkPoint.fromXy(mouseEvent.offsetX, mouseEvent.offsetY);
                // let clickPt = coords.mkPoint.fromD3Mouse(p);
                update(clickPt);
            }
        });
        d3$svg.on("mousedown", function () { });
        d3$svg.on("mouseover", function () {
            // User moved back inside  page frame, resume updates
            userWithinPageBounds = true;
        });
        d3$svg.on("mouseout", function () {
            userWithinPageBounds = false;
        });
    });
}
//# sourceMappingURL=dragselect.js.map