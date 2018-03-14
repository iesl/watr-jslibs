/**
 * An Rx driven tooltip widget, for those cases when a straight-up DOM based
 * tooltip engine won't suffice.
 */

import * as $ from 'jquery';
import * as _ from 'lodash';

import Tippy from 'tippy.js';


export default class ToolTips {

    /**
     * @param {string} container
     * @param {Rx.Subject<{id: string, n: number}>} rxSelectors
     */
    constructor (container, rxSelectors) {
        rxSelectors.subscribe(selectors => {
            this.updateTooltips(selectors);
        });
    }


    updateTooltips(tooltipped) {
        let widget = this;

        let hoveredTooltips = _.map(tooltipped, hoverHit => {
            let { selector, label, id } = hoverHit;

            let $elem = $(selector);
            $elem.attr('title', label);

            let tooltip = _.remove(widget.tooltips, tt => tt.id == hoverHit.id)[0];

            if (tooltip === undefined) {
                tooltip = $elem.prop('_tippy');
                if (tooltip === undefined) {
                    Tippy(selector, {
                        updateDuration: 0,
                        popperOptions: {
                            modifiers: {
                                computeStyle: {
                                    gpuAcceleration: false
                                }
                            }
                        }
                    });
                    tooltip = $elem.prop('_tippy');
                    console.log('hoverHit', hoverHit, $elem);
                    tooltip.id = hoverHit.id;
                }
            }
            tooltip.show();
            return tooltip;
        });

        _.each(widget.tooltips, tooltip => {
            tooltip.hide();
        });

        widget.tooltips = hoveredTooltips;
    }
}
