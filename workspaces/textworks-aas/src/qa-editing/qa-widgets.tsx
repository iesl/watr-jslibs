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
}

export const RenderAny: React.FC<RenderAnyArgs> = ({ item }) => {
  if (_.isString(item)) {
    return (<Color bold blue> <Text>{item}</Text> </Color>);
  }
  if (_.isArray(item)) {
    const ritems = _.map(item, (item0, i) => {
      return (<RenderAny key={`r-item-${i}`} item={item0} />)
    });
    return (
      <Box flexDirection="column">
        {ritems}
      </Box>
    );
  }
  if (_.isBoolean(item)) {
    return (<Color bold blue> <Text>{`${item}`}</Text> </Color>);
  }
  if (_.isObject(item)) {
    return (
      <RenderRec rec={item} />
    );
  }

  return (
    <Box marginLeft={2} marginBottom={0} width="80%" >
      <Color bold red> <Text>{'TODO'} </Text> </Color>
    </Box>
  );
};

interface RenderRecArgs {
  rec: Record<string, any>;
}

export const RenderRec: React.FC<RenderRecArgs> = ({ rec }) => {
  const asPairs = _.toPairs(rec);
  const allBoxes = _.map(asPairs, ([key, val], i) => {
    const [fst, lst, mid, sole] = "┏┗┃═".split('');
    /* const [fst, lst, mid, sole] = "++|=".split(''); */
    const prefixChar = asPairs.length == 1 ? sole :
                   i === 0 ? fst :
                   i === asPairs.length - 1 ? lst : mid;

    const itemBox = <RenderAny item={val} />;
    const prefix = <Color grey> <Text>{prefixChar} </Text></Color>;

    const capCaseKey = _.map(key.split('.'), k => _.capitalize(k)).join(" ");
    return (
      <Box key={`render.rec.${i}`} marginLeft={0} marginBottom={0} width="80%" >
        {prefix}
        <Color red><Text>{capCaseKey}</Text></Color>
        <Color bold gray><Text> :: </Text></Color>

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
