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
// import * as $ from 'jquery';
import $ from 'jquery';
import Split from 'split.js';
import { $id, t, htm } from "./tstags";
const noop = function () { return; };
export const SPLIT_OPTIONS = {
    sizes: [],
    minSize: [],
    gutterSize: 0,
    snapOffset: 0,
    direction: 'vertical',
    cursor: 'col-resize',
    gutter: noop,
    elementStyle: noop,
    gutterStyle: noop,
    onDrag: noop,
    onDragStart: noop,
    onDragEnd: noop // Function 		                    Callback on drag end.
};
const splitPaneRootId = 'splitwin_root';
export var FrameFlowDir;
(function (FrameFlowDir) {
    FrameFlowDir[FrameFlowDir["Row"] = 0] = "Row";
    FrameFlowDir[FrameFlowDir["Col"] = 1] = "Col";
})(FrameFlowDir || (FrameFlowDir = {}));
class Frame {
    // private paneIds: string[] = [];
    constructor($elem) {
        this.panes = [];
        this.elem = $elem;
        this.frameId = $elem.attr('id');
        this.direction = FrameFlowDir.Col;
    }
    setDirection(dir) {
        const cdiv = this.childrenDiv();
        this.direction = dir;
        if (dir === FrameFlowDir.Row) {
            cdiv.addClass('splitwin-row');
            cdiv.removeClass('splitwin-column');
        }
        else if (dir === FrameFlowDir.Col) {
            cdiv.addClass('splitwin-column');
            cdiv.removeClass('splitwin-row');
        }
        else {
            throw Error(`unknown direction ${dir}`);
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
        return this.direction === FrameFlowDir.Col ? 'vertical' : 'horizontal';
    }
    getParentPane() {
        // console.log('getParentPane', this.frameId);
        const idParts = this.frameId.split(/__/);
        // console.log('idParts', idParts);
        const parentId = idParts.slice(0, idParts.length - 1).join('__');
        // console.log('parentId', parentId);
        return parentId;
    }
    addPanes(n) {
        const paneIds = generatePaneIds(this.frameId, n);
        const panes = _.map(paneIds, id => mkPane(id));
        const paneElems = _.map(panes, p => p.elem);
        this.childrenDiv().append(paneElems);
        this.rebuild();
        return panes;
    }
    rebuild() {
        const ch = this.childrenDiv().children();
        // console.log('rebuild: ch', ch);
        const childPanes = ch.filter(function () {
            return $(this).is('.splitwin-pane');
        });
        // console.log('rebuild: childPanes len=', childPanes.length);
        const paneIds = _.map(childPanes.toArray(), p => {
            return $(p).attr('id');
        });
        const panes = _.map(childPanes.toArray(), p => {
            return $(p).prop('SplitWin');
        });
        // console.log('rebuild: panes', panes);
        const paneSelectors = _.map(paneIds, id => `#${id}`);
        // const paneElems = _.map(panes, p => p.elem);
        // console.log('rebuild: paneSelectors = ', paneSelectors.join(', '));
        const size = Math.floor(100 / paneIds.length);
        const sizes = _.map(_.range(0, paneIds.length), () => size);
        // console.log('rebuild: sizes = ', sizes.join(', '));
        if (this.split !== undefined) {
            this.split.destroy();
        }
        // $e.children('.children').empty();
        // $e.children('.children').append(paneElems);
        this.split = Split(paneSelectors, {
            sizes,
            direction: this.getSplitDir(),
            gutterSize: 6,
            minSize: 10
        });
        // this.paneIds = paneIds;
        this.panes = panes;
        // this.updateSplit(split);
    }
    updateSplit(split) {
        if (this.split !== undefined) {
            this.split.destroy();
        }
        this.split = split;
    }
    addPaneControls() {
        const self = this;
        const exp = htm.iconButton('expand');
        const comp = htm.iconButton('compress');
        const del = htm.iconButton('times');
        const controls = t.div('.splitwin-controls', [
            exp, comp, del
        ]);
        del.on('click', () => {
            self.delete();
        });
        $id(this.frameId).addClass('controls');
        $id(this.frameId).children('.status-top').append(controls);
    }
    delete() {
        this.updateSplit(undefined);
        $id(this.frameId).remove();
        const parentPaneId = this.getParentPane();
        const parentSplitWin = $id(parentPaneId).prop('SplitWin');
        parentSplitWin.rebuild();
    }
    maximize() {
    }
    restoreSize() {
    }
}
export function createRootFrame(containerId) {
    const root = mkPane(splitPaneRootId);
    root.elem.addClass('splitwin-root');
    $(containerId).append(root.elem);
    $(containerId).css({
        overflow: 'hidden'
    });
    return root;
}
function mkPane(id) {
    const elem = t.div(`#${id} .splitwin-pane`, [
        t.div(`.status-top`),
        t.div(`.left-gutter`),
        t.div(`.frame-content`),
        t.div(`.right-gutter`),
        t.div(`.status-bottom`)
    ]);
    const frame = new Frame(elem);
    elem.prop('SplitWin', frame);
    return frame;
}
// export function makePaneId(...indexes) {
//   const paneId = _.join(
//     _.map(indexes, i => {
//       return `pane-${i}`;
//     }),
//     '__'
//   );
//   return `${splitPaneRootId}__${paneId}`;
// }
function generatePaneIds(parentId, n) {
    return _.map(_.range(0, n), id => {
        return `${parentId}__pane-${id}`;
    });
}
//# sourceMappingURL=SplitWin.js.map