/**
 * Some helper functions for working with client-side html
 **/

/* global $ _ */

export function $id(selector) {
    return $('#' + selector);
}

let allHtmlTags = [
    'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'b', 'base',
    'basefont', 'bdi', 'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center',
    'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog',
    'dir', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'font', 'footer',
    'form', 'frame', 'frameset', 'h1', - 'h6', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img',
    'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu',
    'menuitem', 'meta', 'meter', 'nav', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output',
    'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp',
    'script', 'section', 'select', 'small', 'source', 'span', 'strike', 'strong', 'style', 'sub', 'summary',
    'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr',
    'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
];


let allSvgTags = [
  'a', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform', 'animation', 'audio', 'canvas', 'circle', 'clipPath', 'color-profile', 'cursor', 'defs', 'desc', 'discard', 'ellipse', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting',
  'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'handler', 'hatch', 'hatchpath', 'hkern', 'iframe', 'image',
  'line', 'linearGradient', 'listener', 'marker', 'mask', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'metadata', 'missing-glyph', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'prefetch', 'radialGradient', 'rect', 'script',
  'set', 'solidColor', 'solidcolor', 'stop', 'style', 'svg', 'switch', 'symbol', 'tbreak', 'text', 'textArea', 'textPath', 'title', 'tref', 'tspan', 'unknown', 'use', 'video', 'view', 'vkern'
];

function mkNbsp (n) {
    n = n || 1;
    let nbsps = _.times(n, _.constant('\u00A0'));
    return document.createTextNode(_.join(nbsps, ''));
}

export let t = {
    nbsp: mkNbsp
};

_.each(allHtmlTags, tag => {
    t[tag] = (...args) => elem(tag, ...args);
});

_.each(allSvgTags, tag => {
    t[tag] = (...args) => elem(tag, ...args);
});


let i           = (...args) => elem('i', ...args);

let fa = (icon) => i('.fa', `.fa-${icon}`, {'aria-hidden': true});

export let icon = {
    fa           : fa,
    trash        : fa('trash'),
    hashtag      : fa('hashtag'),
    chevronRight : fa('chevron-right'),
    chevronLeft  : fa('chevron-left')
};

function elem(tag, ...args) {
    let $tag = $(`<${tag}></${tag}>`);
    _.each(args, arg => {
        if (typeof arg === 'string') {
            // let re = new RegExp('^[\\.,#::@=]');
            let re = /^[\\.#:@=]/;
            if (re.test(arg)) {
                arg.split(/ +/).forEach(attr => {
                    if (_.startsWith(attr, '.')) {
                        $tag.addClass(attr.slice(1));
                    } else if (_.startsWith(attr, '#')) {
                        $tag.attr('id', attr.slice(1));
                    } else if (_.startsWith(attr, ':')) {
                        $tag.attr('type', attr.slice(1));
                    } else if (_.startsWith(attr, '@')) {
                        $tag.attr('name', attr.slice(1));
                    } else if (_.startsWith(attr, '=')) {
                        $tag.attr('value', attr.slice(1));
                    } else {
                        throw new Error('unexpected attribute type: ' + attr);
                    }
                });
            } else {
                $tag.text(arg);
            }
        } else if (typeof arg === 'object') {
            if (arg instanceof $) {
                $tag.append(arg);
            } else if (Array.isArray(arg)) {
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

export function makeModal(form) {
    let modal =
        t.div('.modal', '.fade', {tabindex:"-1", role: "dialog", 'aria-hidden': true}, [
            t.div(".modal-dialog",{role: "document"}, [
                t.div(".modal-content", [
                    t.div(".modal-body", [
                        form
                    ])
                ])
            ])
        ])
    ;

    return modal;
}

export let htm = {
    labeledTextInput: (label, key) => {
        return t.div([
            t.input(':text', `@${key}`, `#${key}`),
            t.label({for: `$key`}, label)
        ]);
    }

};

export function resizeCanvas(canvasElem, width, height) {
    let imgData = canvasElem.toDataURL();
    canvasElem.width = width;
    canvasElem.height = height;
    let ctx = canvasElem.getContext('2d');
    let img = new Image();
    img.onload = function(){
        ctx.drawImage(img,0,0);
    };
    img.src = imgData;
}
