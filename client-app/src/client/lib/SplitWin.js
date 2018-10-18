/**
 *
 * Construct a tree of nested windowed panes, where each intermediate node holds a list of child panes,
 *  and the leaves are user content.
 *
 *
 *
 *   .splitwin-root      : root element in hierarchy
 *   .splitwin-pane      : child panes, immediately nested within a div.split-pane-frame
 *
 *
 */

import * as _ from 'lodash';
import * as $ from 'jquery';

import Split from 'split.js';
import { $id, t, htm } from "./tstags";

const noop = function() { return; };

const SplitOptions = {
    sizes        : [],           //	Array 		                      Initial sizes of each element in percents or CSS values.
    minSize      : [],           //	Number or Array 	100 	        Minimum size of each element.
    gutterSize   : 0,            //	Number 	          10 	          Gutter size in pixels.
    snapOffset   : 0,            //	Number 	          30  	        Snap to minimum size offset in pixels.
    direction    : 'vertical',   //	String 	         'horizontal' 	Direction to split: horizontal or vertical.
    cursor       : 'col-resize', //	String 	         'col-resize' 	Cursor to display while dragging.
    gutter       : noop,         //	Function 		                    Called to create each gutter element
    elementStyle : noop,         //	Function 		                    Called to set the style of each element.
    gutterStyle  : noop,         //	Function 		                    Called to set the style of the gutter.
    onDrag       : noop,         //	Function 		                    Callback on drag.
    onDragStart  : noop,         //	Function 		                    Callback on drag start.
    onDragEnd    : noop          //	Function 		                    Callback on drag end.
};
const splitPaneRootId = 'splitwin_root';

export const row = 'row';
export const col = 'column';

class Frame {
    constructor($elem) {
        this.elem = $elem;
        this.frameId = $elem.attr('id');
        this.direction = col;
    }

    setDirection(dir) {
        let cdiv = this.childrenDiv();
        this.direction = dir;
        if (dir == row) {
            cdiv.addClass('splitwin-row');
            cdiv.removeClass('splitwin-column');
        } else if (dir == col) {
            cdiv.addClass('splitwin-column');
            cdiv.removeClass('splitwin-row');
        } else {
            throw Error('unknown direction', dir);
        }
    }

    clientAreaSelector() {
        return `#${this.frameId} > .frame-content`;
    }

    clientArea() {
        return $(this.clientAreaSelector());
    }

    childrenDiv() {
        return $id(this.frameId).children('.frame-content');
    }
    getChildren() {
        return this.panes;
    }

    getSplitDir() {
        return this.direction == 'column' ? 'vertical' : 'horizontal';
    }

    getParentPane() {
        // console.log('getParentPane', this.frameId);

        let idParts = this.frameId.split(/__/);
        // console.log('idParts', idParts);
        let parentId = idParts.slice(0, idParts.length-1).join('__');
        // console.log('parentId', parentId);
        return parentId;
    }

    addPanes(n) {
        let paneIds = generatePaneIds(this.frameId, n);
        let panes = _.map(paneIds, id =>  mkPane(id));
        let paneElems = _.map(panes, p => p.elem);

        this.childrenDiv().append(paneElems);

        this.rebuild();
        return panes;
    }

    rebuild() {
        let ch = this.childrenDiv().children();
        // console.log('rebuild: ch', ch);


        let childPanes = ch.filter(function () {
            return $(this).is('.splitwin-pane');
        });

        // console.log('rebuild: childPanes len=', childPanes.length);

        let paneIds = _.map(childPanes.toArray(), p => {
            return $(p).attr('id');
        });

        let panes = _.map(childPanes.toArray(), p => {
            return $(p).prop('SplitWin');
        });
        // console.log('rebuild: panes', panes);

        let paneSelectors = _.map(paneIds, id => `#${id}`);

        // let paneElems = _.map(panes, p => p.elem);


        // console.log('rebuild: paneSelectors = ', paneSelectors.join(', '));

        let size = Math.floor(100 / paneIds.length);

        let sizes = _.map(_.range(0, paneIds.length), () => size);

        // console.log('rebuild: sizes = ', sizes.join(', '));

        if (this.split != undefined) {
            this.split.destroy();
        }

        // $e.children('.children').empty();
        // $e.children('.children').append(paneElems);

        this.split = Split(paneSelectors, {
            sizes: sizes,
            direction: this.getSplitDir(),
            gutterSize: 6,
            minSize: 10
        });


        this.paneIds = paneIds;
        this.panes = panes;
        // this.updateSplit(split);
    }

    updateSplit(split) {
        if (this.split != undefined) {
            this.split.destroy();
        }
        this.split = split;
    }


    addPaneControls() {
        let self = this;
        let exp = htm.iconButton('expand');
        let comp = htm.iconButton('compress');
        let del = htm.iconButton('times');
        let controls = t.div('.splitwin-controls', [
            exp, comp, del
        ]);


        del.on('click', function() {
            self.delete();
        });

        $id(this.frameId).addClass('controls');

        $id(this.frameId).children('.status-top').append(controls);
    }

    delete() {
        this.updateSplit(undefined);
        $id(this.frameId).remove();
        let parentPaneId = this.getParentPane();
        let parentSplitWin = $id(parentPaneId).prop('SplitWin');
        parentSplitWin.rebuild();
    }

    maximize() {

    }

    restoreSize() {

    }


}

export function createRootFrame(containerId)  {
    let root = mkPane(splitPaneRootId);
    root.elem.addClass('splitwin-root');
    $(containerId).append(root.elem);
    $(containerId).css({
        overflow: 'hidden'
    });

    return root;
}

function mkPane(id) {
    let elem =
        t.div(`#${id} .splitwin-pane`, [
            t.div(`.status-top`),
            t.div(`.left-gutter`),
            t.div(`.frame-content`),
            t.div(`.right-gutter`),
            t.div(`.status-bottom`)
        ]);

    let frame = new Frame(elem);
    elem.prop('SplitWin', frame);
    return frame;
}

export function makePaneId(...indexes) {
    let paneId = _.join(
        _.map(indexes, i => {
            return `pane-${i}`;
        }),
        '__'
    );
    return splitPaneRootId + '__' + paneId;
}

function generatePaneIds(parentId, n) {
    return _.map(_.range(0, n), id => {
        return `${parentId}__pane-${id}`;
    });
}
