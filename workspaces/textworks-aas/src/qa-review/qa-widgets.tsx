import _ from "lodash";
import React from "react";
import { Text, Box, Color, ColorProps, BoxProps } from "ink";

//@ts-ignore
import Divider from 'ink-divider';

interface TitledBoxArgs {
  title: string;
  body: string;
}


export type ModJSX = (fc: JSX.Element) => JSX.Element;
export type StringToJSX = (s: string) => JSX.Element;

export const dim: ModJSX = e => <Color dim>{e}</Color>;
export const dimGray: ModJSX = e => <Color dim gray>{e}</Color>;
export const gray: ModJSX = e => <Color gray>{e}</Color>;
export const bold: ModJSX = e => <Color bold>{e}</Color>;
export const red: ModJSX = e => <Color red>{e}</Color>;
export const blue: ModJSX = e => <Color blue>{e}</Color>;
export const boldBlue: ModJSX = e => <Color bold blue>{e}</Color>;

export function text(s: string): JSX.Element {
  return <Text>{s}</Text>;
}

const objKeyColor: StringToJSX = (key: string) => red(text(key));
const kvSepColor: StringToJSX = (key: string) => dimGray(text(key));

export const Row: React.FC<BoxProps> = (bps) => {
  return <Box {...bps} />;
};
export const Col: React.FC<BoxProps> = (bps) => {
  return <Box flexDirection="column" {...bps} />;
};

export const TitledBox: React.FC<TitledBoxArgs> = ({ title, body }) => {
  return (
    <Col>
      <Divider title={title} />

      <Box textWrap="wrap" marginLeft={4} marginBottom={1} width="80%" height={15} >
        {bold(blue(text(body)))}
      </Box>

    </Col>
  );
};

interface KeyValBoxArgs {
  keyname: string;
  val?: string;
}

export const KeyValBox: React.FC<KeyValBoxArgs> = ({ keyname, val }) => {
  return (
    <Box marginLeft={2} marginBottom={0} width="80%" height={1} >
      <Color bold red> <Text>{keyname}: </Text> </Color>
      <Color bold blue> <Text>{val ? val : '<none>'}</Text> </Color>
    </Box>
  );
};

interface RenderAnyArgs {
  item: any;
  depth: number;
}

export const RenderAny: React.FC<RenderAnyArgs> = ({ item, depth }) => {

  const isPrimitive = _.isString(item) || _.isNumber(item) || _.isBoolean(item);

  if (isPrimitive) {
    return boldBlue(text(`${item}`));
  }

  if (_.isNull(item)) {
    return boldBlue(text('null'));
  }

  if (_.isArray(item)) {
    const ritems = _.map(item, (item0, i) => {
      return (
        <Box key={`r-item-${i}`} >
          {dim(gray(text(`${i}.`)))}
          <RenderAny item={item0} depth={depth + 1} />
        </Box>
      )
    });
    return (
      <Box flexDirection="column">
        {ritems}
      </Box>
    );
  }
  if (_.isObject(item)) {
    return (
      <RenderRec rec={item} />
    );
  }

  return (
    <Box marginLeft={2} marginBottom={0} width="80%" >
      <Color bold red> <Text>{'UNIMPLEMENTED'} </Text> </Color>
    </Box>
  );
};

interface RenderRecImplArgs {
  rec: Record<string, any>;
  depth: number;
}

/* const [fst, lst, mid, sole] = "┏┗┃═".split(''); */
const [fst, lst, mid, sole] = "╭╰│═".split('');

const capitalizeDottedString = (s: string) => {
  return _.map(s.split('.'), k => _.capitalize(k)).join(" ");
};

const RenderRecImpl: React.FC<RenderRecImplArgs> = ({ rec, depth }) => {
  const asPairs = _.toPairs(rec);
  const longestKeyLen = _.max(_.map(asPairs, ([key]) => key.length));
  const padRight = longestKeyLen || 1;

  const allBoxes = _.map(asPairs, ([key, val], i) => {
    const prefixChar = asPairs.length == 1 ? sole :
      i === 0 ? fst :
        i === asPairs.length - 1 ? lst : mid;

    const itemBox = <RenderAny item={val} depth={depth + 1} />;

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
    <Col width="80%">
      {allBoxes}
    </Col>
  );
};

interface RenderRecArgs {
  rec: Record<string, any>;
}

export const RenderRec: React.FC<RenderRecArgs> = ({ rec }) => {
  return <RenderRecImpl rec={rec} depth={0} />
}
