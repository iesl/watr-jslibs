/**
 *
 * Allow sequencing of d3 animations by waiting for all transitions to end before moving to the next "step"
 *
 */

function onEndAll (transition, callback) {

    if (transition.empty()) {
        callback();
    } else {
        let n = transition.size();
        transition.on("end", function () {
            n--;
            if (n === 0) {
                callback();
            }
        });
    }
}

export function stepThrough(interpFunc, steps) {
    if (steps.length > 0) {
        let step = steps[0];

        // let method = DrawingMethods[step.Method];

        interpFunc(step)
            .transition()
            .delay(300)
            .call(onEndAll, function(){
                stepThrough(interpFunc, steps.slice(1));
            });
    }
}
