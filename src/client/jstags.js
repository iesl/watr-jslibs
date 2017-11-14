/**
 * Some helper functions for working with client-side html
 **/

import * as $ from 'jquery';
import * as _ from  'lodash';


export function $id(selector) {
    return $('#' + selector);
}

export let a = (...args) => elem('a', ...args);
export let div = (...args) => elem('div', ...args);
export let span = (...args) => elem('span', ...args);
export let btn = (...args) => elem('button', ...args);

let i = (...args) => elem('i', ...args);
export let fa = (icon) => i('.fa', `.fa-${icon}`, {'aria-hidden': true});
export let faTrash = fa('trash');

export let icon = {
    trash: fa('trash')
};


export function elem(tag, ...args) {
    let $tag = $(`<${tag}></${tag}>`);
    _.each(args, arg => {
        if (typeof arg === 'string') {
            if (_.startsWith(arg, '.')) {
                $tag.addClass(arg.slice(1));
            } else if (_.startsWith(arg, '#')) {
                $tag.attr('id', arg.slice(1));
            } else {
                $tag.text(arg);
            }
        } else if (typeof arg === 'object') {
            if (Array.isArray(arg)) {
                _.each(arg, a0 => {
                    $tag.append(a0);
                });

            } else {
                _.each(_.toPairs(arg), ([k, v]) => {
                    $tag.attr(k, v);
                });

            }
        } else {
            throw new Error('unexpected elem initializer: ' + arg);
        }
    });

    return $tag;
}
