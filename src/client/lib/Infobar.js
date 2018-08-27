/**
 */

import * as $ from 'jquery';
import * as _ from 'lodash';

import {t, htm, $id} from './jstags.js';

export default class Infobar {


    constructor (containerId, numRows, numCols) {
        this.containerId = containerId;
        this.numRows = numRows;
        this.numCols = numCols;
        this.numSlots = numRows * numCols;
        this.init();
    }


    init() {
        let widget = this;

        let infobarSlots =
            _.flatMap(_.range(0, this.numRows), row => {
                let slots = _.map(_.range(0, this.numCols), col => {
                    let i = (this.numCols*row) + col;
                    let id = this.getSlotId(i);
                    let lid = this.getSlotLabelId(i);
                    let sid = this.getSlotValueId(i);

                    return t.div(`.infoslot #${id}`, [
                        t.span(`.infoslot-label #${lid}`, ''),
                        t.span(`.infoslot-value #${sid}`, '')
                    ]);
                });
                return t.div(`.infobar-row`, slots);
            });


        let elem = t.div(`.infobar`, infobarSlots);

        this.elem = elem;

        let infoToggle = htm.makeToggle('info-toggle', 'toggle-on', 'toggle-off', false, 'Toggle debug info pane');

        infoToggle.on('change', function(event) {
            let isChecked = $(event.target).prop('checked');
            if (isChecked) {
                $($id(widget.containerId)).addClass('hideinfobar');
            } else {
                $($id(widget.containerId)).removeClass('hideinfobar');
            }
        });
        this.infoToggle = infoToggle;
    }

    getSlotId(n) {
        return `${this.containerId}-slot-${n}`;
    }
    getSlotLabelId(n) {
        return `${this.containerId}-slot-label-${n}`;
    }

    getSlotValueId(n) {
        return `${this.containerId}-slot-value-${n}`;
    }


    getElem() {
        return this.elem;
    }

    getToggle() {
        return this.infoToggle;
    }

    printToInfobar(slot, label, value) {
        $(`#${this.getSlotLabelId(slot)}`).text(label);
        $(`#${this.getSlotValueId(slot)}`).text(value.toString());
    }
}
