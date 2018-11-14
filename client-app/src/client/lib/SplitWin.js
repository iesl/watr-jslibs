"use strict";
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
exports.__esModule = true;
var _ = require("lodash");
var $ = require("jquery");
var split_1 = require("split");
var tstags_1 = require("./tstags");
var noop = function () { return; };
exports.SPLIT_OPTIONS = {
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
var splitPaneRootId = 'splitwin_root';
var FrameFlowDir;
(function (FrameFlowDir) {
    FrameFlowDir[FrameFlowDir["Row"] = 0] = "Row";
    FrameFlowDir[FrameFlowDir["Col"] = 1] = "Col";
})(FrameFlowDir = exports.FrameFlowDir || (exports.FrameFlowDir = {}));
// export const row = 'row';
// export const col = 'column';
var Frame = /** @class */ (function () {
    function Frame($elem) {
        this.panes = [];
        this.paneIds = [];
        this.elem = $elem;
        this.frameId = $elem.attr('id');
        this.direction = FrameFlowDir.Col;
    }
    Frame.prototype.setDirection = function (dir) {
        var cdiv = this.childrenDiv();
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
            throw Error("unknown direction " + dir);
        }
    };
    Frame.prototype.clientAreaSelector = function () {
        return "#" + this.frameId + " > .frame-content";
    };
    Frame.prototype.clientArea = function () {
        return $(this.clientAreaSelector());
    };
    Frame.prototype.childrenDiv = function () {
        return tstags_1.$id(this.frameId).children('.frame-content');
    };
    Frame.prototype.getChildren = function () {
        return this.panes;
    };
    Frame.prototype.getSplitDir = function () {
        return this.direction === FrameFlowDir.Col ? 'vertical' : 'horizontal';
    };
    Frame.prototype.getParentPane = function () {
        // console.log('getParentPane', this.frameId);
        var idParts = this.frameId.split(/__/);
        // console.log('idParts', idParts);
        var parentId = idParts.slice(0, idParts.length - 1).join('__');
        // console.log('parentId', parentId);
        return parentId;
    };
    Frame.prototype.addPanes = function (n) {
        var paneIds = generatePaneIds(this.frameId, n);
        var panes = _.map(paneIds, function (id) { return mkPane(id); });
        var paneElems = _.map(panes, function (p) { return p.elem; });
        this.childrenDiv().append(paneElems);
        this.rebuild();
        return panes;
    };
    Frame.prototype.rebuild = function () {
        var ch = this.childrenDiv().children();
        // console.log('rebuild: ch', ch);
        var childPanes = ch.filter(function () {
            return $(this).is('.splitwin-pane');
        });
        // console.log('rebuild: childPanes len=', childPanes.length);
        var paneIds = _.map(childPanes.toArray(), function (p) {
            return $(p).attr('id');
        });
        var panes = _.map(childPanes.toArray(), function (p) {
            return $(p).prop('SplitWin');
        });
        // console.log('rebuild: panes', panes);
        var paneSelectors = _.map(paneIds, function (id) { return "#" + id; });
        // const paneElems = _.map(panes, p => p.elem);
        // console.log('rebuild: paneSelectors = ', paneSelectors.join(', '));
        var size = Math.floor(100 / paneIds.length);
        var sizes = _.map(_.range(0, paneIds.length), function () { return size; });
        // console.log('rebuild: sizes = ', sizes.join(', '));
        if (this.split !== undefined) {
            this.split.destroy();
        }
        // $e.children('.children').empty();
        // $e.children('.children').append(paneElems);
        this.split = split_1["default"](paneSelectors, {
            sizes: sizes,
            direction: this.getSplitDir(),
            gutterSize: 6,
            minSize: 10
        });
        this.paneIds = paneIds;
        this.panes = panes;
        // this.updateSplit(split);
    };
    Frame.prototype.updateSplit = function (split) {
        if (this.split !== undefined) {
            this.split.destroy();
        }
        this.split = split;
    };
    Frame.prototype.addPaneControls = function () {
        var self = this;
        var exp = tstags_1.htm.iconButton('expand');
        var comp = tstags_1.htm.iconButton('compress');
        var del = tstags_1.htm.iconButton('times');
        var controls = tstags_1.t.div('.splitwin-controls', [
            exp, comp, del
        ]);
        del.on('click', function () {
            self["delete"]();
        });
        tstags_1.$id(this.frameId).addClass('controls');
        tstags_1.$id(this.frameId).children('.status-top').append(controls);
    };
    Frame.prototype["delete"] = function () {
        this.updateSplit(undefined);
        tstags_1.$id(this.frameId).remove();
        var parentPaneId = this.getParentPane();
        var parentSplitWin = tstags_1.$id(parentPaneId).prop('SplitWin');
        parentSplitWin.rebuild();
    };
    Frame.prototype.maximize = function () {
    };
    Frame.prototype.restoreSize = function () {
    };
    return Frame;
}());
function createRootFrame(containerId) {
    var root = mkPane(splitPaneRootId);
    root.elem.addClass('splitwin-root');
    $(containerId).append(root.elem);
    $(containerId).css({
        overflow: 'hidden'
    });
    return root;
}
exports.createRootFrame = createRootFrame;
function mkPane(id) {
    var elem = tstags_1.t.div("#" + id + " .splitwin-pane", [
        tstags_1.t.div(".status-top"),
        tstags_1.t.div(".left-gutter"),
        tstags_1.t.div(".frame-content"),
        tstags_1.t.div(".right-gutter"),
        tstags_1.t.div(".status-bottom")
    ]);
    var frame = new Frame(elem);
    elem.prop('SplitWin', frame);
    return frame;
}
function makePaneId() {
    var indexes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        indexes[_i] = arguments[_i];
    }
    var paneId = _.join(_.map(indexes, function (i) {
        return "pane-" + i;
    }), '__');
    return splitPaneRootId + "__" + paneId;
}
exports.makePaneId = makePaneId;
function generatePaneIds(parentId, n) {
    return _.map(_.range(0, n), function (id) {
        return parentId + "__pane-" + id;
    });
}
