import _ from "lodash";
import B from 'blessed';
import { toQualifiedPaths, QualifiedPath } from '~/qa-review/to-pairs-deep';
import { createListTable, createForm, createCheckBox, createLayout, createRadios, textDivBox, createRadioEmmitter } from './blessterm-widgets';
import { blue, red, bold, StyledText, text, dim, gray, concatStyledText, wrapStyledText, textLength, appendStyledTexts } from './text-styling';

const [fst, lst, mid, sole] = "╭╰│═".split(''); /*  "┏┗┃═" */

export function renderAnyVal(item: any): StyledText {
  if (_.isString(item)) {
    return blue(item);
  }

  const isNumOrBool = _.isNumber(item) || _.isBoolean(item);

  if (isNumOrBool) {
    return red(`${item}`);
  }

  if (_.isNull(item)) {
    return bold(blue('null'));
  }

  if (_.isUndefined(item)) {
    return bold(blue('undef'));
  }

  return bold(blue('UNIMPLEMENTED'));
}


export function layoutTreeWithInlineControls<T>(inputRec: T): B.Widgets.LayoutElement {
  const qualifiedPaths = toQualifiedPaths(inputRec);
  const layout = createLayout({
    layout: 'inline',
    border: undefined,
    bg: "#343434",
    top: 4,
    left: 4,
    width: "95%",
    height: "95%",
  });

  const mainContent = createLayout({
    parent: layout,
    layout: 'inline',
    bg: "#949434",
    top: 1,
    left: 4,
    width: "100%-8",
    height: "100%-5",
  });

  const footerContent = createLayout({
    parent: layout,
    layout: 'inline',
    border: 'line',
    top: 0,
    left: 2,
    width: "100%-4",
    height: 4,
  });

  const leftSide = createLayout({
    parent: mainContent,
    layout: 'inline',
    // bg: "#343434",
    top: 0,
    left: 0,
    align: "right",
    width: 10,
    height: "100%-4",
  });

  const rightSide = createLayout({
    parent: mainContent,
    layout: 'inline',
    // bg: "#434343",
    top: 0,
    left: 0,
    width: "100%-10",
    height: "100%-4",
  });

  const messageArea = textDivBox('<messages>');
  footerContent.append(messageArea);

  _.each(qualifiedPaths, (qpath, qpathIndex) => {
    const qpathRender = renderQualifiedPath(qpath);
    if (qpathRender.length > 0) {
      const [kpath] = qpath;
      const localKey = kpath.map(p => p.key).join(".");
      const shouldHaveCheckbox = /(count|exists|value|errors\.\d+)/.test(localKey);
      if (shouldHaveCheckbox) {
        const radioEmitter = createRadioEmmitter(localKey, 3)
        leftSide.append(radioEmitter);

        radioEmitter.on('radio-select', (data: any) => {
          const dbg = _.toPairs(data).map(([k, v]) => `${k}: ${v}`).join(', ');
          messageArea.setContent(dbg);
        });

      } else {
        const filler = textDivBox('');
        leftSide.append(filler);
      }

      _.each(qpathRender, (qpathLine, i) => {
        const rline = textDivBox(qpathLine);
        rightSide.append(rline);
        if (i > 0) {
          const filler = textDivBox('...');
          leftSide.append(filler);
        }
      });
    }
  });

  return layout;
}

function renderQualifiedPath(qpath: QualifiedPath): string[] {
  const [kpath, item] = qpath;
  const hasValue = qpath.length === 2;
  const parentPath = kpath.slice(0, kpath.length - 1);

  const indentIndicators0: StyledText[] = _.map(parentPath, (pathPart) => {

    const { key, n, sibs } = pathPart;
    const isLast = n === sibs - 1;
    const isSolo = sibs === 1;
    const isNotEnd = !(isLast || isSolo);

    const isArrayIndex = /^\d+$/.test(key);

    if (isArrayIndex) {
      return text('');
    }
    const prefix = isNotEnd ? mid : ' ';

    return appendStyledTexts(
      dim(gray(prefix)),
      text('    ')
    );
  });

  const indentIndicators = indentIndicators0.length > 0 ?
    concatStyledText(indentIndicators0) : text('');

  const valueLines: StyledText[] = hasValue ? wrapStyledText(180, renderAnyVal(item)) : [];

  const appendValueLines = (l: StyledText): StyledText[] => {
    if (valueLines.length === 0) {
      return [l];
    }

    if (valueLines.length === 1) {
      return [appendStyledTexts(l, text('  '), valueLines[0])];
    }
    const firstLine = appendStyledTexts(l, text('  '), valueLines[0]);
    const continuedLines = valueLines.slice(1);
    const len = textLength(l);
    const indictorsLen = textLength(indentIndicators);
    const padding = text('  ' + ''.padStart(len - indictorsLen));
    const paddedVLines = _.map(continuedLines, vl => {
      return appendStyledTexts(
        indentIndicators,
        padding, vl
      )
    });
    return [firstLine, ...paddedVLines];
  }

  const keyPath = _.last(kpath);
  if (keyPath) {
    const { key, n, sibs, pathType } = keyPath;
    const isFirst = n === 0;
    const isLast = n === sibs - 1;
    const isSolo = sibs === 1;

    if (pathType === 'array') {
      if (!hasValue) return [];

      const res = appendValueLines(
        appendStyledTexts(indentIndicators, dim(gray(`${n}.`)))
      );
      return _.map(res, r => r.render());
    }

    const prefixChar = isSolo ? sole
      : isFirst ? fst
        : isLast ? lst
          : mid;

    const capitalizeDottedString = (s: string) => {
      return _.map(s.split('.'), k => _.capitalize(k)).join(" ");
    };
    const capCaseKey = capitalizeDottedString(key);

    const res = appendValueLines(
      appendStyledTexts(indentIndicators, dim(gray(`${prefixChar} `)), red(bold(`${capCaseKey}`)), text(' ->'))
    );
    return _.map(res, r => r.render());
  }

  const res = appendValueLines(indentIndicators);
  return _.map(res, r => r.render());
}
