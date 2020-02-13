//
import _ from "lodash";
import React, {useState} from "react";
import {Text, Box, Color, useInput, useApp} from "ink";
import * as ink from "ink";
export type KeyDef = [string, () => void];
import MultiSelect, { ListedItem } from "ink-multi-select";
import { CleaningRule } from './qa-edits';
import ansiEscapes from 'ansi-escapes';
import wrapAnsi from 'wrap-ansi';
import { BufferedLogger } from "~/util/logging";

//@ts-ignore
import Divider from 'ink-divider';

interface CleaningRulesArgs {
  abstractStr: string;
  setAbstract: (s: string) => void;
  cleaningRules: CleaningRule[];
  logger: BufferedLogger;
}

interface RuleSelection extends ListedItem {
  rule: CleaningRule;
  label: string;
  value: string;
}


const CleaningRules: React.FC<CleaningRulesArgs> = ({ cleaningRules, abstractStr, setAbstract }: CleaningRulesArgs) => {
  const items: ListedItem[] = _.map(cleaningRules, (rule, i) => {

    const ruleMatches = rule.precondition(abstractStr);
    return {
      rule,
      label: `${rule.name} matches=${ruleMatches}`,
      value: `rule#${i}`,
      key: `rule#${i}`
    };
  });

  function onSelect(this: MultiSelect, item: ListedItem) {
    const ruleSel = item as any as RuleSelection;
    const rule = ruleSel.rule;
    if (rule.precondition(abstractStr)) {
      const newAbs = rule.run(abstractStr);
      setAbstract(newAbs);
    }
    return this;
  };

  return (
    <Box>
      <MultiSelect
        onSelect={onSelect}
        items={items}
      />
    </Box>
  );
};


interface RunInteractive {
  abstractStr: string;
  cleaningRules: CleaningRule[];
  logger: BufferedLogger;
}

function clipParagraph(width: number, height: number, para: string): string {

  const wrappedLines = wrapAnsi(para, width).split('\n');

  const elidedStartLine = height-4;
  let clipped: string;
  if (wrappedLines.length > height) {
    const clippedHead = wrappedLines.slice(0, elidedStartLine).join("\n");
    const len = wrappedLines.length;
    const clippedEnd = wrappedLines.slice(len-3).join("\n");
    const clippedCount = len-height;
    const middle = `... + ${clippedCount} lines`;
    clipped = _.join([clippedHead, middle, clippedEnd], '\n');
  } else {
    clipped = wrappedLines.join("\n");
  }

  return clipped;
}


const App: React.FC<RunInteractive> = ({ abstractStr, cleaningRules, logger }: RunInteractive) => {
  const {exit} = useApp();

  const okAndNext = () => {
    logger.append('field.abstract.clean=true');
    exit();
  };

  const notOkAndNext = () => {
    logger.append('field.abstract.clean=false');
    exit();
  };
  const previousNotOkAndNext = () => {
    logger.append('field.abstract.prev.clean=false');
    exit();
  };

  const keymap: KeyDef[] = [
    ["n", okAndNext],
    ["x", notOkAndNext],
    ["p", previousNotOkAndNext],
    ["(", () => { process.exit(); }],
  ];

  const [currAbstract, setAbstract] = useState(abstractStr);

  const [cleanedAbstract] = useState(() => {
    let cleanedAbs = abstractStr;

    _.map(cleaningRules, rule => {
      if (rule.precondition(abstractStr)) {
        cleanedAbs = rule.run(cleanedAbs);
      }
    });

    return cleanedAbs;
  });

  useInput((input, _key) => {
    const whichKey = _.find(keymap, ([k]) => k === input);
    if (whichKey) {
      whichKey[1]();
    }
  });
  const viewWidth = 200;
  const rawAbsViewHeight = 15;
  const cleanAbsViewHeight = 10;

  const clippedAbs = clipParagraph(viewWidth, rawAbsViewHeight, currAbstract);
  const clippedCleanAbs = clipParagraph(viewWidth, cleanAbsViewHeight, cleanedAbstract);
  let title = "Abstract (cleaned)";

  if (currAbstract === cleanedAbstract) {
    title = "Abstract (cleaned == raw)";
  }

  return (
    <Box flexDirection="column">
      <Divider title={title} />

      <Box textWrap="wrap" marginLeft={4} marginBottom={1} width="80%" height={cleanAbsViewHeight} >
        <Color bold blue>
          <Text>{ clippedCleanAbs }</Text>
        </Color>
      </Box>

      <Divider title={'Abstract (raw)'} />

      <Box textWrap="wrap" marginLeft={4} marginBottom={1} width="80%" height={rawAbsViewHeight} >
        <Color bold blue>
          <Text>{ clippedAbs }</Text>
        </Color>
      </Box>

      <Divider title={'Rule Selection'} />

      <Box padding={3}>
        <CleaningRules
          abstractStr={currAbstract}
          setAbstract={setAbstract}
          cleaningRules={cleaningRules}
          logger={logger}
        />
      </Box>
    </Box>
  );
};


export function runInteractive({ abstractStr, cleaningRules, logger }: RunInteractive): Promise<void> {
  process.stdout.write(ansiEscapes.clearTerminal);
  process.stdout.write(ansiEscapes.clearScreen);
  process.stdout.write(ansiEscapes.cursorDown(1));

  const app = ink.render(
    <App
      abstractStr={abstractStr}
      cleaningRules={cleaningRules}
      logger={logger}
    />
  );
  return app.waitUntilExit();
}
