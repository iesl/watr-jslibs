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
    // border: 'line',
    border: undefined,
    bg: "#343434",
    width: "80%",
    height: "50%",
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
        // const filler = textDivBox(abbrevKey);
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

export function layoutTreeWithControls<T>(inputRec: T): B.Widgets.LayoutElement {
  const qualifiedPaths = toQualifiedPaths(inputRec);
  const layout = createLayout({
    layout: 'inline',
    width: "100%",
    height: "100%",
  });
  const leftSide = createLayout({
    parent: layout,
    layout: 'inline',
    border: 'line',
    bg: "#343434",
    top: 0,
    left: 0,
    width: "20%-2",
    height: "100%",
  });

  const rightSide = createLayout({
    parent: layout,
    layout: 'inline',
    border: 'line',
    bg: "#434343",
    top: 0,
    left: 0,
    width: "80%-2",
    height: "100%",
  });

  const controlForms = createForm({
    parent: leftSide,
  });

  const controlPanelLayout = createLayout({
    parent: controlForms,
    layout: 'inline',
    border: 'line',
    bg: "#232323",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  });

  const qpathRenders = _.map(qualifiedPaths, (qpath, index) => {
    const [kpath] = qpath;
    const localKey = kpath.slice(0, index).map(p => p.key).join(".");

    const shouldHaveCheckbox = /(count|exists|value|errors)/.test(localKey);

    if (shouldHaveCheckbox) {

      const [radioSet, buttons] = createRadios({
        parent: controlPanelLayout,
        name: 'name',
        content: 'content',
        label: "label",
        text: "text",
        width: "100%"
      }, [
        {
          mouse: true,
          keys: false,
          shrink: true,
          height: 1,
          top: 0,
          name: '?',
          content: '!'
        },
        {
          mouse: true,
          keys: false,
          shrink: true,
          height: 1,
          top: 0,
          name: 'X',
          content: 'x'
        },
        {
          mouse: true,
          keys: false,
          shrink: true,
          height: 1,
          top: 0,
          name: 'Y',
          content: 'y'
        },
      ]);
    }

    const qpathRender = renderQualifiedPath(qpath);
    const empty: string[] = [];
    const emptys: string = '';
    if (qpathRender.length === 0) return [emptys, empty] as const;

    return [localKey, qpathRender] as const;
  });

  const recordRows = qpathRenders
    .filter(p => p[1].length > 0);

  const rows = _.flatMap(recordRows, ([key, recRender]) => {
    return _.map(recRender, (rec, i) => {
      return i === 0 ? [key, rec] : [' ...', rec];
    });
  });

  const headers = [['Key', 'Record']];
  headers.push(...rows)

  const ltopts: B.Widgets.ListTableOptions = {
    parent: rightSide,
    data: undefined,
    border: "line", // 'line'',
    align: 'left',
    tags: true,
    keys: true,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    vi: true,
    mouse: false,
    style: {
      header: {
        fg: 'blue',
        bold: true
      },
      cell: {
        selected: {
          bg: 'blue'
        }
      }
    }
  };
  const listTable = createListTable(ltopts)
  listTable.setData(headers);
  return layout;
}
export function renderQualifiedPaths<T>(inputRec: T): B.Widgets.ListTableElement {
  const qualifiedPaths = toQualifiedPaths(inputRec);
  const controlForms = createForm({
  });

  const qpathRenders = _.map(qualifiedPaths, (qpath, index) => {
    const [kpath] = qpath;
    const localKey = kpath.slice(0, index).map(p => p.key).join(".");

    const shouldHaveCheckbox = /(count|exists|value)/.test(localKey);

    if (shouldHaveCheckbox) {
      const checkbox = createCheckBox({
        parent: controlForms,
        mouse: true,
      });
    }

    const qpathRender = renderQualifiedPath(qpath);
    const empty: string[] = [];
    const emptys: string = '';
    if (qpathRender.length === 0) return [emptys, empty] as const;

    return [localKey, qpathRender] as const;
  });

  const recordRows = qpathRenders
    .filter(p => p[1].length > 0);

  const rows = _.flatMap(recordRows, ([key, recRender]) => {
    return _.map(recRender, (rec, i) => {
      return i === 0 ? [key, rec] : [' ...', rec];
    });
  });


  const headers = [['Key', 'Record']];
  headers.push(...rows)

  const ltopts: B.Widgets.ListTableOptions = {
    data: undefined,
    border: undefined, // 'line'',
    align: 'left',
    tags: true,
    keys: true,
    // width: 'shrink',
    // height: 'shrink',
    vi: true,
    mouse: true,
    style: {
      header: {
        fg: 'blue',
        bold: true
      },
      cell: {
        selected: {
          bg: 'blue'
        }
      }
    }
  };
  const listTable = createListTable(ltopts)
  listTable.append(controlForms);

  listTable.setData(headers);
  return listTable;

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

  const valueLines: StyledText[] = hasValue ? wrapStyledText(100, renderAnyVal(item)) : [];

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
