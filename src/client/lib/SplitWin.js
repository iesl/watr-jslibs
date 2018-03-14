/**
 *   .split-pane-frame   : immediate parent for split-pane-component
 *   .split-pane-component : child panes, immediately nested within a div.split-pane-frame
 *
 * Split options:
 *     sizes        	Array 		                      Initial sizes of each element in percents or CSS values.
 *     minSize      	Number or Array 	100 	        Minimum size of each element.
 *     gutterSize   	Number 	          10 	          Gutter size in pixels.
 *     snapOffset   	Number 	          30  	        Snap to minimum size offset in pixels.
 *     direction    	String 	         'horizontal' 	Direction to split: horizontal or vertical.
 *     cursor       	String 	         'col-resize' 	Cursor to display while dragging.
 *     gutter       	Function 		                    Called to create each gutter element
 *     elementStyle 	Function 		                    Called to set the style of each element.
 *     gutterStyle  	Function 		                    Called to set the style of the gutter.
 *     onDrag       	Function 		                    Callback on drag.
 *     onDragStart  	Function 		                    Callback on drag start.
 *     onDragEnd    	Function 		                    Callback on drag end.
 *
 */

/* global */

import Split from 'split.js';
import * as _ from 'lodash';
import * as $ from 'jquery';
import { $id, t } from './jstags.js';


const splitPaneRootId = 'splitpane_root';

function mkComponent(id) {
    return t.div('.split-pane-component')
        .attr('id', id) ;
}


function composePanes(paneComponents) {
    return t.div('.split-pane-frame', paneComponents);
}


export function createSplitPaneRoot (containerId)  {
    $(containerId).append(
        t.div(`#${splitPaneRootId} .split-pane-component`)
    );
    return splitPaneRootId;
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

function getNearestPaneAncestor (elem)  {
    let pane = $(elem).parent().closest('.split-pane-component');
    let id;
    if (pane.length > 0) {
        id = $(pane).attr('id');
    } else {
        id = splitPaneRootId;
    }
    return id;
}

export function splitVertical(containerId, numPanes) {
    let parentId = getNearestPaneAncestor('#'+containerId);
    let paneIds = generatePaneIds(parentId, numPanes);
    let panes = _.map(paneIds, id =>  mkComponent(id));
    let paneSelectors = _.map(paneIds, id =>  `#${id}`);
    console.log('splitVertical', containerId, parentId, paneIds);

    let frame = composePanes(panes).addClass('split-pane-frame-row');
    $id(containerId).append(frame);

    return Split(paneSelectors, {
        sizes: [50, 50],
        direction: 'horizontal',
        minSize: 100
    });
}


export function fixedTopProps(topHeight) {
    return {
        gutterSize: 0,
        sizes: [`${topHeight}px`, '']
    };
}
export function splitHorizontal(containerSelector, numPanes, addProps) {
    let parentId = getNearestPaneAncestor(containerSelector);
    let props = addProps || {};
    let paneIds = generatePaneIds(parentId, numPanes);
    let panes = _.map(paneIds, id =>  mkComponent(id));

    let paneSelectors = _.map(paneIds, id =>  `#${id}`);
    console.log('splitHorizontal',containerSelector, parentId, paneIds);

    let frame = composePanes(panes).addClass('split-pane-frame-column');

    $id(containerSelector).append(frame);
    let defaultProps = {
        sizes: [50, 50],
        direction: 'vertical',
        minSize: 1
    };

    let init = Object.assign({}, defaultProps, props);

    return Split(paneSelectors, init);
}
