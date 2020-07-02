import _ from "lodash";
import B from 'blessed';
import { toQualifiedPaths, QualifiedPath } from '~/qa-review/to-pairs-deep';
import { createListTable, createForm, createCheckBox } from './blessterm-widgets';
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

  const valueLines: StyledText[] = hasValue? wrapStyledText(100, renderAnyVal(item)) : [];

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
    const padding = text('  ' + ''.padStart(len-indictorsLen));
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
