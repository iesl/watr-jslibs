/**
 *
 */

/* global d3 $ */


/**
*/

function allowDrop(ev) {
    ev.preventDefault();
    ev.originalEvent.preventDefault();
}

function drag(ev) {
    // console.log('drag', ev);
    ev.originalEvent.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    ev.originalEvent.preventDefault();
    var data = ev.originalEvent.dataTransfer.getData("text");
    // console.log('dropped', data);
    // ev.target.appendChild(document.getElementById(data));
}

export function reorderViaHtml5(draggableSelector, dropSelector) {
    $(draggableSelector)
        .on('dragstart', e => drag(e));

    $(dropSelector)
        .on('drop', e => drop(e))
        .on('dragover', e => allowDrop(e));

    // <img id="drag1" src="img_logo.gif" draggable="true" ondragstart="drag(event)" width="336" height="69">
    // <div id="div1" ondrop="drop(event)" ondragover="allowDrop(event)"></div>

}
export function reorder(sortablesSelector) {
    return new Promise((resolve, reject) => {
        let dragTarget;
        let drag = d3.drag()
            .on('start', function(gridBox) {
                dragTarget = d3.select(d3.event.sourceEvent.target);
                // console.log('drag:start', dragTarget);

                let others = d3.selectAll(sortablesSelector)
                    .filter(d => d.id != gridBox.id);

                // console.log('subject', gridBox);
                // console.log('others', others);


                others.on('mouseover', function() {
                    // console.log('mouseover', d3.event);
                    let hovered = d3.select(d3.event.target);
                    // let hovered = d3.select(this);
                    hovered.attr('fill-opacity', 0.1);
                    hovered.attr('fill', 'red');

                }).on('mouseout', function() {
                    let hovered = d3.select(d3.event.target);
                    // let hovered = d3.select(this);
                    hovered.attr('fill-opacity', 0.4);
                    hovered.attr('fill', 'blue');
                }) ;

            })
            .on('drag', function(d) {
                let {x, y, dx, dy, translate}  = d3.event;
                // console.log('drag:drag', d);
                let b = d.bounds;
                b.x0 += dx;
                b.y0 += dy;

                dragTarget
                    .attr("d", d => {
                        return `M ${b.x0} ${b.y0} l ${b.width} 0 0 ${b.height} ${-b.width} 0 Z`;
                    })
                ;
            })
            .on('end', function(d) {
                // console.log('drag:end');
                // d3.selectAll(sortablesSelector).on(".drag", null);
                resolve();
            });


        d3.selectAll(sortablesSelector)
            .call(drag);
    });
}
