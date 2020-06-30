//
import _ from "lodash";
import React from "react";
import { Text, Box } from "ink";

import { ObjectPathWithValue } from './view-files';
import { text, boldBlue, Row, dim, gray, Col, bold, red, objKeyColor, kvSepColor, blue } from './ink-widgets';

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
    bold(blue(`${item}`))
    return (
      <Row>
        <Text bold color="blue">{`${item}`}</Text>
      </Row>
    );
  }

  if (_.isNull(item)) {
    return boldBlue(text('null'));
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



interface RenderRecPathsArgs {
  recPaths: ObjectPathWithValue[];
}

interface RenderRecPathsImplArgs {
  recPaths: ObjectPathWithValue[];
}

const RenderRecPathsImpl: React.FC<RenderRecPathsImplArgs> = ({ recPaths  }) => {

  const recSlices = _.map(recPaths, (pathAndValue, i) => {
    const isJustPath = pathAndValue.length === 2;
    const [path, valueType, value] = pathAndValue;

    const valueRender = isJustPath ?
      (<Text>{valueType}</Text>) :
      (<RenderAny item={value} depth={0} />);

    const pathLeading = path.slice(0, path.length - 1);
    const pathLast = path[path.length - 1] || 'root';
    const lastIsNumeric = /\d+/.test(pathLast);

    const capCaseKey = capitalizeDottedString(pathLast);

    if (isJustPath) {
      if (valueType === 'array') {

      }
    }

    const pathLastRender = lastIsNumeric ?
      <Text>{`-${capCaseKey}   `}</Text> :
      <Text>{`:${capCaseKey} ->`}</Text>;

    const pathRender = _.map(pathLeading, (pathPart) => {
      const isNumeric = /\d+/.test(pathPart);
      if (isNumeric) {
        return <Text>{'|    '}</Text>
      }
      return <Text>{'{    '}</Text>
    });

    const recSlice = (
      <Row key={`k#${i}`}>
        {pathRender}
        {pathLastRender}
        {valueRender}
      </Row>
    );

    return recSlice;
  });

  return (
    <Col>
      {recSlices}
    </Col>
  );
};

export const RenderRecPaths: React.FC<RenderRecPathsArgs> = ({ recPaths }) => {
  return <RenderRecPathsImpl recPaths={recPaths} />
}
