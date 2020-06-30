//
import _ from "lodash";
import React from "react";
import { Text, Box } from "ink";

import { text, boldBlue, Row, dim, gray, Col, bold, red, objKeyColor, kvSepColor, blue } from './ink-widgets';
import { QualifiedPath, toObjectPath } from './to-pairs-deep';

interface RenderAnyArgs {
  item: any;
  renderOverrides?: RenderOverride[];
  depth: number;
}

export type RenderAnyType = React.FC<RenderAnyArgs>;

export const RenderAnyTruncated: RenderAnyType = ({ item, renderOverrides, depth }) => {
  if (_.isString(item)) {
    let itemstr = item;
    if (item.length > 10) {
      itemstr = item.slice(0, 10) + '...';
    }
    return boldBlue(text(`${itemstr}`));
  }
  if (_.isArray(item)) {
    return (
      <Row>
        {dim(gray(text(`[ len: ${item.length} ]`)))}
      </Row>
    );
  }
  return <RenderAny item={item} depth={depth} renderOverrides={renderOverrides} />;
}

export const RenderAny: React.FC<RenderAnyArgs> = ({ item, renderOverrides, depth }) => {

  const isPrimitive = _.isString(item) || _.isNumber(item) || _.isBoolean(item);

  if (isPrimitive) {
    return bold(blue(`${item}`));
  }

  if (_.isNull(item)) {
    return boldBlue(text('null'));
  }

  if (_.isUndefined(item)) {
    return boldBlue(text('undef'));
  }

  if (_.isArray(item)) {
    const ritems = _.map(item, (item0, i) => {
      return (
        <Box key={`r-item-${i}`} >
          {dim(gray(text(`${i}.`)))}
          <RenderAny item={item0} renderOverrides={renderOverrides} depth={depth + 1} />
        </Box>
      )
    });
    return (
      <Col>
        {ritems}
      </Col>
    );
  }
  if (_.isObject(item)) {
    return (
      <RenderRecImpl rec={item} depth={depth} renderOverrides={renderOverrides} />
    );
  }

  return (
    <Box marginLeft={2} marginBottom={0}>
      {bold(red(text('UNIMPLEMENTED')))}
    </Box>
  );
};

interface RenderRecImplArgs {
  rec: Record<string, any>;
  renderOverrides?: RenderOverride[];
  depth: number;
}

const [fst, lst, mid, sole] = "╭╰│═".split(''); /*  "┏┗┃═" */

const capitalizeDottedString = (s: string) => {
  return _.map(s.split('.'), k => _.capitalize(k)).join(" ");
};

const RenderRecImpl: React.FC<RenderRecImplArgs> = ({ rec, renderOverrides, depth }) => {
  const asPairs = _.toPairs(rec);
  const longestKeyLen = _.max(_.map(asPairs, ([key]) => key.length));
  const padRight = longestKeyLen || 1;

  const allBoxes = _.map(asPairs, ([key, val], i) => {
    const prefixChar = asPairs.length == 1 ? sole :
      i === 0 ? fst :
        i === asPairs.length - 1 ? lst : mid;

    const overrides = renderOverrides || [];

    const override = overrides.filter(([k,]) => k === key)[0];

    const itemBox = override ?
      override[1]({ item: val, depth: depth + 1 })
      : <RenderAny item={val} depth={depth + 1} renderOverrides={renderOverrides} />;

    const prefix = gray(text(prefixChar));

    const capCaseKey = capitalizeDottedString(key)
      .padEnd(padRight);

    if (_.isArray(val) || _.isObject(val)) {
      return (
        <Box key={`render.rec.${i}`}>
          {prefix}
          <Col>
            {objKeyColor(capCaseKey)}
            <Box marginLeft={2}>
              {itemBox}
            </Box>
          </Col>
        </Box>
      );
    }

    return (
      <Box key={`render.rec.${i}`} >
        {prefix}
        {objKeyColor(capCaseKey)}
        {kvSepColor(' ─> ')}
        {itemBox}
      </Box>
    );
  });

  return (
    <Col>
      {allBoxes}
    </Col>
  );
};

export type RenderOverride = [string, RenderAnyType];

interface RenderRecArgs {
  rec: any;
  renderOverrides?: RenderOverride[];
}

export const RenderRec: React.FC<RenderRecArgs> = ({ rec, renderOverrides }) => {
  return <RenderRecImpl rec={rec} depth={0} renderOverrides={renderOverrides} />
}


interface RenderQualifiedPathArgs {
  qpath: QualifiedPath;
}


export const RenderQualifiedPath: React.FC<RenderQualifiedPathArgs> = ({ qpath }) => {
  const [kpath, value] = qpath;
  const hasValue = qpath.length === 2;

  const parentPath = kpath.slice(0, kpath.length - 1);

  const indentIndicators = _.map(parentPath, (pathPart, partIndex) => {
    const { key, n, sibs, pathType } = pathPart;

    const localKeyPrefix = kpath.slice(0, partIndex).map(p => p.key).join(".");
    const localKey = `${localKeyPrefix}.${key}`;

    const isFirst = n === 0;
    const isLast = n === sibs - 1;
    const isSolo = sibs === 1;
    const isNotEnd = !(isLast || isSolo);


    const isArrayIndex = /^\d+$/.test(key);

    if (isArrayIndex) {
      return (
        <Box key={localKey} >
          {text(' ')}
        </Box>
      );
    }
    const prefix = isNotEnd? mid : '';

    return (
      <Box key={localKey} marginRight={4}>
        {dim(gray(prefix))}
      </Box>
    );
  });

  let itemBox = <Text></Text>;

  if (hasValue) {
    itemBox = <RenderAny item={value} depth={0} renderOverrides={[]} />;
  }

  const keyPath = _.last(kpath);
  if (keyPath) {
    const { key, n, sibs, pathType } = keyPath;
    const isFirst = n === 0;
    const isLast = n === sibs - 1;
    const isSolo = sibs === 1;

    const opath = toObjectPath(qpath);
    const opathKey = opath.join('.');

    if (pathType === 'array') {
      if (!hasValue) return null;

      return (
        <Box key={`${opathKey}:${key}`}>
          {indentIndicators}
          {dim(gray(`${n}.`))}
          <Box marginLeft={2}>
            {itemBox}
          </Box>
        </Box>
      );
    }

    const prefixChar = isSolo ? sole
      : isFirst ? fst
        : isLast ? lst
          : mid;

    const padRight = 2;
    const capCaseKey = capitalizeDottedString(key)
      .padEnd(padRight);

    return (
      <Box key={`${opathKey}:${key}`}>
        {indentIndicators}
        {dim(gray(prefixChar))}
        {objKeyColor(capCaseKey)}
        {kvSepColor(' ─> ')}
        <Box marginLeft={2}>
          {itemBox}
        </Box>
      </Box>
    );
  }

  return (
    <Row>{indentIndicators}</Row>
  );
};
