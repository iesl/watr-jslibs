import _ from "lodash";
import React from "react";
import { Text, Box, Color } from "ink";

//@ts-ignore
import Divider from 'ink-divider';

interface TitledBoxArgs {
  title: string;
  body: string;
}

export const TitledBox: React.FC<TitledBoxArgs> = ({ title, body }) => {
  return (
    <Box flexDirection="column">
      <Divider title={title} />

      <Box textWrap="wrap" marginLeft={4} marginBottom={1} width="80%" height={15} >
        <Color bold blue>
          <Text>{body}</Text>
        </Color>
      </Box>

    </Box>
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
    return (<Color bold blue> <Text>{`${item}`}</Text> </Color>);
  }

  if (_.isNull(item)) {
    return (<Color bold blue><Text>null</Text> </Color>);
  }

  if (_.isArray(item)) {
    const ritems = _.map(item, (item0, i) => {
      return (
        <Box key={`r-item-${i}`} >
          <Color dim gray><Text>{i}.</Text></Color>
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
  /* const padKeyRight = (k: string) => k.padEnd(d) */

  const allBoxes = _.map(asPairs, ([key, val], i) => {
    const prefixChar = asPairs.length == 1 ? sole :
                       i === 0 ? fst :
                       i === asPairs.length - 1 ? lst : mid;

    const itemBox = <RenderAny item={val} depth={depth + 1} />;
    const prefix = <Color grey> <Text>{prefixChar} </Text></Color>;

    const capCaseKey = capitalizeDottedString(key)
      .padEnd(padRight);

    if (_.isArray(val) || _.isObject(val)) {
      return (
        <Box key={`render.rec.${i}`}>
          {prefix}
          <Box flexDirection="column">
            <Color red><Text>{capCaseKey}</Text></Color>
            <Box marginLeft={2}>
              {itemBox}
            </Box>
          </Box>
        </Box>
      );
    }

    return (
      <Box key={`render.rec.${i}`} >
        {prefix}
        <Color red><Text>{capCaseKey}</Text></Color>
        <Color dim gray><Text>{' ─> '}</Text></Color>
        {itemBox}
      </Box>
    );
  });

  return (
    <Box marginLeft={0} marginBottom={0} width="80%" flexDirection="column">
      {allBoxes}
    </Box>
  );
};

interface RenderRecArgs {
  rec: Record<string, any>;
}

export const RenderRec: React.FC<RenderRecArgs> = ({ rec }) => {
  return <RenderRecImpl rec={rec} depth={0} />
}
