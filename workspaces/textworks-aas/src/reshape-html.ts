//
import fs from 'fs-extra';


import _ from 'lodash';
import * as cheerio from 'cheerio';

// TODO use npm lib surgeon to extract fields
// TODO peruse: https://github.com/lorien/awesome-web-scraping/blob/master/javascript.md

import { prettyPrint } from './pretty-print';

type Attrs = { [k: string]: string };

function parseAttrs(attrs: Attrs): string[][] {
  const keys = _.keys(attrs);
  let kvs: string[][] = [];
  const stdKeys = [['id', '#'], ['class', '.'], ['href', 'href'], ['src', 'src'], ['name', '@']];
  _.each(stdKeys, ([k, abbr]) => {
    const v = attrs[k];
    if (v) {
      if (v.includes(' ')) {
        const words = v.split(' ').map(_.trim).filter(_.isEmpty);
        _.each(words, w => {
          kvs.push([k, w, abbr]);
        });
      } else if (_.isArray(v)) {
        _.each(v, v0 => {
          kvs.push([k, v0, abbr]);
        });
      } else {
        kvs.push([k, v, abbr]);
      }
    }
  });
  const otherKeys = keys.filter(ok => !_.some(stdKeys, ([k]) => k===ok));
  const sorted = _.sortBy(otherKeys);
  _.each(sorted, k => {
    const v = attrs[k];
    if (v) {
      kvs.push([k, v, k]);
    }
  });

  return kvs;
}

export function getCSSTree() {
  const testHtml = fs.readFileSync('../../test.html').toString();
  const $ = cheerio.load(testHtml);

  const root: Cheerio = $(':root');

  mapHtmlTree(root[0], (node: CheerioElement, depth, index, sibcount) => {
    const tn = node.tagName
    const tp = node['type'];

    let fmt = ''.padStart(depth*2);
    const attrs = node.attribs;
    let attrsStr = '';
    if (attrs) {
      const attrPairs = parseAttrs(attrs);
      const attrstr0 = _.map(attrPairs, ([k, v, abbr]) => {
        if (abbr.length===1) {
          return `${abbr}${v}`;
        }
        return `${abbr}='${v}'`;
      });
      attrsStr = _.join(attrstr0, ' ');
    }

    switch (tp) {
      case 'tag':
        fmt = `${fmt}${tn} ${attrsStr}`;
        break;

      case 'text': {
        const d = node.data?.trim();
        if (d && d.length > 0) {
          const oneLine = d.replace('\n', '\\n');
          const len = oneLine.length;
          const abbrev = oneLine.slice(0, 50);
          fmt = `${fmt}(l=${len})> ${abbrev} ...`;
        }
        break;
      }

      case 'comment': {
        const d = node.data?.trim();
        if (d && d.length > 0) {
          const oneLine = d.replace('\n', '\\n');
          const len = oneLine.length;
          const abbrev = oneLine.slice(0, 50);
          fmt = `${fmt}comment(l=${len})> ${abbrev} ...`;
        }
        break;
      }

      default:
        fmt = `${fmt}${tn}[${tp}] ${attrsStr}`;
    }
    if (fmt.trim().length > 0) {
      console.log(fmt);
    }
  });

}

function mapHtmlTree(
  rootElem: CheerioElement,
  f: (node: CheerioElement, depth: number, index: number, siblings: number) => any
) {

  function _inner(elem: CheerioElement, dpt: number, idx: number, sibs: number) {
    f(elem, dpt, idx, sibs);
    const childs = elem.children;
    if (childs) {
      const chsibs = childs.length;
      const chdpt = dpt+1;
      _.each(childs, (child, chidx) => {
        _inner(child, chdpt, chidx, chsibs);
      });
    }
  }
  _inner(rootElem, 0, 0, 1);
}

getCSSTree();



// get-css
// $.prototype.getUniqueSelector = function () {
//     var el = this;
//     var parents = el.parents();
//     if (!parents[0]) {
//       // Element doesn't have any parents
//       return ':root';
//     }
//     var selector = getElementSelector(el);
//     var i = 0;
//     var elementSelector;

//     if (selector[0] === '#' || selector === 'body') {
//       return selector;
//     }

//     do {
//       elementSelector = getElementSelector($(parents[i]));
//       selector = elementSelector + ' > ' + selector;
//       i++;
//     } while (i < parents.length - 1 && elementSelector[0] !== '#'); // Stop before we reach the html element parent
//     return selector;
//   };

//   function getElementSelector(el) {
//     if (el.attr('id')) {
//       return '#' + el.attr('id');
//     } else {
//       var tagName = el.get(0).tagName;
//       if (tagName === 'body') {
//         return tagName;
//       }
//       if (el.siblings().length === 0) {
//         return el.get(0).tagName;
//       }
//       if (el.index() === 0) {
//         return el.get(0).tagName + ':first-child';
//       }
//       if (el.index() === el.siblings().length){
//         return el.get(0).tagName + ':last-child';
//       }
//       return el.get(0).tagName+ ':nth-child(' + (el.index() + 1) + ')';
//     }
//   }
// }
